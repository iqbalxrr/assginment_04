import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as paymentController from "./payment.controller";
import {
  confirmPaymentSchema,
  createPaymentSchema,
  paymentIdSchema,
} from "./payment.validation";

const router = Router();

router.use(authenticate, authorize(Role.TENANT));

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     tags: [Payments]
 *     summary: Create Stripe payment intent for approved rental
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", validate(createPaymentSchema), paymentController.create);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Verify Stripe payment after client confirmation
 *     security:
 *       - bearerAuth: []
 */
router.post("/confirm", validate(confirmPaymentSchema), paymentController.confirm);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get user's payment history
 */
router.get("/", paymentController.getAll);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details
 */
router.get(
  "/:id",
  validate(paymentIdSchema, "params"),
  paymentController.getById
);

export default router;
