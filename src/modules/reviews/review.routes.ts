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
 */
router.get(
  "/property/:propertyId",
  validate(propertyReviewsSchema, "params"),
  reviewController.getByProperty
);

export default router;
