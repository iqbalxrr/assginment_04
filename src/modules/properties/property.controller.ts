import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as propertyService from "./property.service";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await propertyService.getProperties(req.query as never);
  sendSuccess(res, 200, "Properties retrieved successfully", result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(getParam(req.params.id));
  sendSuccess(res, 200, "Property retrieved successfully", property);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.createProperty(req.user!.id, req.body);
  sendSuccess(res, 201, "Property created successfully", property);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const property = await propertyService.updateProperty(
    getParam(req.params.id),
    req.user!.id,
    req.body
  );
  sendSuccess(res, 200, "Property updated successfully", property);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await propertyService.deleteProperty(getParam(req.params.id), req.user!.id);
  sendSuccess(res, 200, "Property deleted successfully");
});

export const getMyProperties = asyncHandler(async (req: Request, res: Response) => {
  const properties = await propertyService.getLandlordProperties(req.user!.id);
  sendSuccess(res, 200, "Your properties retrieved successfully", properties);
});
