import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as categoryController from "./category.controller";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all property categories
 */
router.get("/", categoryController.getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 */
router.get(
  "/:id",
  validate(categoryIdSchema, "params"),
  categoryController.getById
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(categoryIdSchema, "params"),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(categoryIdSchema, "params"),
  categoryController.remove
);

export default router;
