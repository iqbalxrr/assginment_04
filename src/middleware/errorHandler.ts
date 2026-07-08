import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errorDetails);
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, "Validation failed", err.errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, "A record with this value already exists", {
        field: err.meta?.target,
      });
    }
    if (err.code === "P2025") {
      return sendError(res, 404, "Record not found");
    }
  }

  console.error("Unhandled error:", err);
  return sendError(res, 500, "Internal server error");
};
