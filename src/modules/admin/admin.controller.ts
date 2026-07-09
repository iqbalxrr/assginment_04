import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as adminService from "./admin.service";
import * as propertyService from "../properties/property.service";
import * as rentalService from "../rentals/rental.service";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsers((req.validatedQuery ?? req.query) as never);
  sendSuccess(res, 200, "Users retrieved successfully", result);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(getParam(req.params.id), req.body.status);
  sendSuccess(res, 200, "User status updated successfully", user);
});

export const getProperties = asyncHandler(async (_req: Request, res: Response) => {
  const properties = await propertyService.getAllPropertiesAdmin();
  sendSuccess(res, 200, "All properties retrieved successfully", properties);
});

export const getRentals = asyncHandler(async (_req: Request, res: Response) => {
  const rentals = await rentalService.getAllRentalsAdmin();
  sendSuccess(res, 200, "All rental requests retrieved successfully", rentals);
});

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, 200, "Dashboard stats retrieved successfully", stats);
});
