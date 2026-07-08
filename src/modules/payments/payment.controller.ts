import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as paymentService from "./payment.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(req.user!.id, req.body);
  sendSuccess(res, 201, "Stripe payment session created", result);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const payments = await paymentService.getUserPayments(req.user!.id);
  sendSuccess(res, 200, "Payment history retrieved successfully", payments);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentById(getParam(req.params.id), req.user!.id);
  sendSuccess(res, 200, "Payment details retrieved successfully", payment);
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.confirmPayment(req.user!.id, req.body);
  sendSuccess(res, 200, "Payment verified successfully", result);
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    res.status(400).json({
      success: false,
      message: "Missing Stripe signature header",
      errorDetails: null,
    });
    return;
  }

  const result = await paymentService.handleStripeWebhook(req.body as Buffer, signature);
  sendSuccess(res, 200, "Webhook processed", result);
});
