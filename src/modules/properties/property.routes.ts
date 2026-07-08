import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as propertyController from "./property.controller";
import {
  createPropertySchema,
  propertyFiltersSchema,
  propertyIdSchema,
  updatePropertySchema,
} from "./property.validation";

const router = Router();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     tags: [Properties]
 *     summary: Get all properties with filters
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 */
router.get("/", validate(propertyFiltersSchema, "query"), propertyController.getAll);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     tags: [Properties]
 *     summary: Get property details by ID
 */
router.get(
  "/:id",
  validate(propertyIdSchema, "params"),
  propertyController.getById
);

export default router;

const landlordRouter = Router();

landlordRouter.use(authenticate, authorize(Role.LANDLORD));

/**
 * @swagger
 * /api/landlord/properties:
 *   post:
 *     tags: [Landlord]
 *     summary: Create a new property listing
 *     security:
 *       - bearerAuth: []
 */
landlordRouter.post(
  "/",
  validate(createPropertySchema),
  propertyController.create
);

landlordRouter.get("/", propertyController.getMyProperties);

/**
 * @swagger
 * /api/landlord/properties/{id}:
 *   put:
 *     tags: [Landlord]
 *     summary: Update a property listing
 */
landlordRouter.put(
  "/:id",
  validate(propertyIdSchema, "params"),
  validate(updatePropertySchema),
  propertyController.update
);

/**
 * @swagger
 * /api/landlord/properties/{id}:
 *   delete:
 *     tags: [Landlord]
 *     summary: Delete a property listing
 */
landlordRouter.delete(
  "/:id",
  validate(propertyIdSchema, "params"),
  propertyController.remove
);

export { landlordRouter };
