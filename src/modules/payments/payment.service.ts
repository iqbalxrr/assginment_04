import {
  PaymentProvider,
  PaymentStatus,
  PropertyStatus,
  RentalStatus,
} from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { STRIPE_CURRENCY, stripe, toStripeAmount } from "../../config/stripe";
import { ApiError } from "../../utils/ApiError";

const completePaymentTransaction = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalRequest: { include: { property: true } } },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    }),
    prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: RentalStatus.ACTIVE },
    }),
    prisma.property.update({
      where: { id: payment.rentalRequest.propertyId },
      data: { status: PropertyStatus.RENTED },
    }),
  ]);

  return updatedPayment;
};

const createStripePaymentIntent = async (
  paymentId: string,
  amount: number,
  rentalRequestId: string,
  userId: string
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(amount),
    currency: STRIPE_CURRENCY,
    metadata: {
      paymentId,
      rentalRequestId,
      userId,
    },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: { transactionId: paymentIntent.id },
  });

  return paymentIntent;
};

export const createPayment = async (
  userId: string,
  data: { rentalRequestId: string; provider: PaymentProvider }
) => {
  if (data.provider !== PaymentProvider.STRIPE) {
    throw new ApiError(400, "Only Stripe payments are currently supported");
  }

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: data.rentalRequestId },
    include: { property: true, payments: true },
  });

  if (!rental) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rental.tenantId !== userId) {
    throw new ApiError(403, "You can only pay for your own rental requests");
  }
  if (rental.status !== RentalStatus.APPROVED) {
    throw new ApiError(400, "Payment is only allowed for approved rental requests");
  }

  const completedPayment = rental.payments.find((p) => p.status === PaymentStatus.COMPLETED);
  if (completedPayment) {
    throw new ApiError(409, "Payment already completed for this rental");
  }

  const pendingPayment = rental.payments.find((p) => p.status === PaymentStatus.PENDING);

  let payment = pendingPayment;
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        rentalRequestId: data.rentalRequestId,
        userId,
        amount: rental.property.price,
        method: "card",
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });
  }

  let paymentIntent;
  if (payment.transactionId) {
    paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
    if (paymentIntent.status === "succeeded") {
      const completed = await completePaymentTransaction(payment.id);
      return {
        payment: completed,
        clientSecret: null,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? null,
        message: "Payment already completed",
      };
    }
    if (["canceled", "requires_payment_method"].includes(paymentIntent.status)) {
      paymentIntent = await createStripePaymentIntent(
        payment.id,
        payment.amount,
        data.rentalRequestId,
        userId
      );
    }
  } else {
    paymentIntent = await createStripePaymentIntent(
      payment.id,
      payment.amount,
      data.rentalRequestId,
      userId
    );
  }

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? null,
    stripePaymentIntentId: paymentIntent.id,
  };
};

export const confirmPayment = async (
  userId: string,
  data: { paymentId: string; transactionId: string }
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: data.paymentId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  if (payment.userId !== userId) {
    throw new ApiError(403, "You do not have access to this payment");
  }
  if (payment.transactionId && payment.transactionId !== data.transactionId) {
    throw new ApiError(400, "Transaction ID does not match this payment");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(data.transactionId);

  if (paymentIntent.metadata.paymentId !== payment.id) {
    throw new ApiError(400, "Payment intent does not belong to this payment");
  }

  if (paymentIntent.status === "succeeded") {
    const updatedPayment = await completePaymentTransaction(payment.id);
    return {
      payment: updatedPayment,
      status: PaymentStatus.COMPLETED,
    };
  }

  if (paymentIntent.status === "processing") {
    return {
      payment,
      status: PaymentStatus.PENDING,
      message: "Payment is still processing",
    };
  }

  if (["canceled", "requires_payment_method"].includes(paymentIntent.status)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw new ApiError(400, `Payment failed with status: ${paymentIntent.status}`);
  }

  return {
    payment,
    status: PaymentStatus.PENDING,
    stripeStatus: paymentIntent.status,
    message: "Payment not yet completed. Complete payment using the client secret.",
  };
};

export const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(500, "Stripe webhook secret is not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new ApiError(400, "Invalid Stripe webhook signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const paymentId = paymentIntent.metadata.paymentId;

    if (paymentId) {
      await completePaymentTransaction(paymentId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const paymentId = paymentIntent.metadata.paymentId;

    if (paymentId) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  return { received: true, type: event.type };
};

export const getUserPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: {
      rentalRequest: {
        select: {
          id: true,
          status: true,
          property: { select: { id: true, title: true, location: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getPaymentById = async (id: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: {
        include: { property: { select: { id: true, title: true } } },
      },
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  if (payment.userId !== userId) {
    throw new ApiError(403, "You do not have access to this payment");
  }

  return payment;
};
