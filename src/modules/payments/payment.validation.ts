import { z } from "zod";
import { PaymentProvider } from "@prisma/client";

export const createPaymentSchema = z.object({
  rentalRequestId: z.string().uuid("Invalid rental request ID"),
  provider: z.nativeEnum(PaymentProvider, {
    errorMap: () => ({ message: "Provider must be STRIPE or SSLCOMMERZ" }),
  }),
});

export const paymentIdSchema = z.object({
  id: z.string().uuid("Invalid payment ID"),
});

export const confirmPaymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentId: z.string().uuid("Invalid payment ID"),
});
