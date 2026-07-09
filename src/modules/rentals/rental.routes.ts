import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as rentalController from "./rental.controller";
import {
  createRentalSchema,
  rentalFiltersSchema,
  rentalIdSchema,
  updateRentalStatusSchema,
} from "./rental.validation";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/rentals:
 *   post:
 *     tags: [Rentals]
 *     summary: Submit a rental request (tenant)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, startDate, endDate]
 *             properties:
 *               propertyId: { type: string, format: uuid, example: "9cb220c8-f4b0-4185-8b77-28b04b6bae96" }
 *               startDate: { type: string, format: date-time, example: "2026-08-01T00:00:00.000Z" }
 *               endDate: { type: string, format: date-time, example: "2026-09-01T00:00:00.000Z" }
 *               message: { type: string, example: "I want to rent this property" }
 */
router.post(
  "/",
  authorize(Role.TENANT),
  validate(createRentalSchema),
  rentalController.create
);

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     tags: [Rentals]
 *     summary: Get user's rental requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED] }
 */
router.get(
  "/",
  validate(rentalFiltersSchema, "query"),
  rentalController.getAll
);

/**
 * @swagger
 * /api/rentals/{id}:
 *   get:
 *     tags: [Rentals]
 *     summary: Get rental request details
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
  validate(rentalIdSchema, "params"),
  rentalController.getById
);

export default router;

const landlordRouter = Router();

landlordRouter.use(authenticate, authorize(Role.LANDLORD));

/**
 * @swagger
 * /api/landlord/requests:
 *   get:
 *     tags: [Landlord]
 *     summary: Get all rental requests for landlord's properties
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 */
landlordRouter.get(
  "/",
  validate(rentalFiltersSchema, "query"),
  rentalController.getLandlordRequests
);

/**
 * @swagger
 * /api/landlord/requests/{id}:
 *   patch:
 *     tags: [Landlord]
 *     summary: Approve or reject a rental request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [APPROVED, REJECTED], example: APPROVED }
 */
landlordRouter.patch(
  "/:id",
  validate(rentalIdSchema, "params"),
  validate(updateRentalStatusSchema),
  rentalController.updateStatus
);

export { landlordRouter };
