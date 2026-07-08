import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as categoryService from "./category.service";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  sendSuccess(res, 200, "Categories retrieved successfully", categories);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(getParam(req.params.id));
  sendSuccess(res, 200, "Category retrieved successfully", category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, 201, "Category created successfully", category);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(getParam(req.params.id), req.body);
  sendSuccess(res, 200, "Category updated successfully", category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(getParam(req.params.id));
  sendSuccess(res, 200, "Category deleted successfully");
});
