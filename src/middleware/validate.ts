import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[part]);

    if (part === "query") {
      req.validatedQuery = parsed as Record<string, unknown>;
      return next();
    }

    req[part] = parsed;
    next();
  };
