import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getParam } from "../../utils/getParam";
import { sendSuccess } from "../../utils/response";
import * as rentalService from "./rental.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.createRentalRequest(req.user!.id, req.body);
  sendSuccess(res, 201, "Rental request submitted successfully", rental);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await rentalService.getUserRentals(
    req.user!.id,
    req.user!.role,
    (req.validatedQuery ?? req.query) as never
  );
  sendSuccess(res, 200, "Rental requests retrieved successfully", result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.getRentalById(
    getParam(req.params.id),
    req.user!.id,
    req.user!.role
  );
  sendSuccess(res, 200, "Rental request retrieved successfully", rental);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const rental = await rentalService.updateRentalStatus(
    getParam(req.params.id),
    req.user!.id,
    req.body.status
  );
  sendSuccess(res, 200, `Rental request ${req.body.status.toLowerCase()} successfully`, rental);
});

export const getLandlordRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await rentalService.getUserRentals(
    req.user!.id,
    req.user!.role,
    (req.validatedQuery ?? req.query) as never
  );
  sendSuccess(res, 200, "Landlord rental requests retrieved successfully", result);
});
