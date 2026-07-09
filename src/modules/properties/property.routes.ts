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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid, example: "9cb220c8-f4b0-4185-8b77-28b04b6bae96" }
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, address, price, bedrooms, bathrooms, categoryId]
 *             properties:
 *               title: { type: string, example: "Modern 2BR Apartment" }
 *               description: { type: string, example: "Beautiful apartment with city views and amenities" }
 *               location: { type: string, example: "Gulshan" }
 *               address: { type: string, example: "Road 45, Gulshan-2, Dhaka" }
 *               price: { type: number, example: 45000 }
 *               bedrooms: { type: integer, example: 2 }
 *               bathrooms: { type: integer, example: 2 }
 *               area: { type: number, example: 1200 }
 *               amenities: { type: array, items: { type: string }, example: ["WiFi", "Parking"] }
 *               images: { type: array, items: { type: string }, example: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"] }
 *               categoryId: { type: string, format: uuid }
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
 *             properties:
 *               title: { type: string }
 *               price: { type: number }
 *               status: { type: string, enum: [AVAILABLE, UNAVAILABLE, RENTED] }
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
landlordRouter.delete(
  "/:id",
  validate(propertyIdSchema, "params"),
  propertyController.remove
);

export { landlordRouter };
