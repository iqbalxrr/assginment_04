import { Request, Response } from "express";
import { sendError } from "../utils/response";

export const notFound = (_req: Request, res: Response) => {
  sendError(res, 404, "Route not found");
};
