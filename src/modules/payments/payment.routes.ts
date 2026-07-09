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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rentalRequestId, provider]
 *             properties:
 *               rentalRequestId: { type: string, format: uuid, example: "dd4afb8b-d75e-4aa7-aeb3-5d1ab117fe81" }
 *               provider: { type: string, enum: [STRIPE, SSLCOMMERZ], example: STRIPE }
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, transactionId]
 *             properties:
 *               paymentId: { type: string, format: uuid }
 *               transactionId: { type: string, example: "pi_3TrIiWR1g1J1QVrW0CNmYzb3" }
 */
router.post("/confirm", validate(confirmPaymentSchema), paymentController.confirm);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get user's payment history
 *     security:
 *       - bearerAuth: []
 */
router.get("/", paymentController.getAll);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
router.get(
  "/:id",
  validate(paymentIdSchema, "params"),
  paymentController.getById
);

export default router;
