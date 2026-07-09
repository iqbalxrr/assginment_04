import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as adminController from "./admin.controller";
import {
  updateUserStatusSchema,
  userFiltersSchema,
  userIdSchema,
} from "./admin.validation";

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform dashboard statistics
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", adminController.getDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
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
 *         name: role
 *         schema: { type: string, enum: [TENANT, LANDLORD, ADMIN] }
 */
router.get("/users", validate(userFiltersSchema, "query"), adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user status (ban/unban)
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
 *               status: { type: string, enum: [ACTIVE, BANNED], example: BANNED }
 */
router.patch(
  "/users/:id",
  validate(userIdSchema, "params"),
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);

/**
 * @swagger
 * /api/admin/properties:
 *   get:
 *     tags: [Admin]
 *     summary: Get all properties
 *     security:
 *       - bearerAuth: []
 */
router.get("/properties", adminController.getProperties);

/**
 * @swagger
 * /api/admin/rentals:
 *   get:
 *     tags: [Admin]
 *     summary: Get all rental requests
 *     security:
 *       - bearerAuth: []
 */
router.get("/rentals", adminController.getRentals);

export default router;
