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
 */
landlordRouter.patch(
  "/:id",
  validate(rentalIdSchema, "params"),
  validate(updateRentalStatusSchema),
  rentalController.updateStatus
);

export { landlordRouter };
