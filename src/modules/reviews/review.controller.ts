import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as reviewService from "./review.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!.id, req.body);
  sendSuccess(res, 201, "Review submitted successfully", review);
});

export const getByProperty = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.getPropertyReviews(getParam(req.params.propertyId));
  sendSuccess(res, 200, "Property reviews retrieved successfully", result);
});
