import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as reviewController from "./review.controller";
import { createReviewSchema, propertyReviewsSchema } from "./review.validation";

const router = Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review after completed rental
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, propertyId, rentalRequestId]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, example: "Great property and landlord!" }
 *               propertyId: { type: string, format: uuid }
 *               rentalRequestId: { type: string, format: uuid }
 */
router.post(
  "/",
  authenticate,
  authorize(Role.TENANT),
  validate(createReviewSchema),
  reviewController.create
);

/**
 * @swagger
 * /api/reviews/property/{propertyId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get all reviews for a property
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string, format: uuid, example: "9cb220c8-f4b0-4185-8b77-28b04b6bae96" }
 */
router.get(
  "/property/:propertyId",
  validate(propertyReviewsSchema, "params"),
  reviewController.getByProperty
);

export default router;
