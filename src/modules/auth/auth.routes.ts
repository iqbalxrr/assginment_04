import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user (tenant or landlord)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [TENANT, LANDLORD] }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user and get JWT token
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, authController.getMe);

export default router;
