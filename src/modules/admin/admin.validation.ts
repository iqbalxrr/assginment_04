import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const userIdSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ message: "Status must be ACTIVE or BANNED" }),
  }),
});

export const userFiltersSchema = z.object({
  role: z.enum(["TENANT", "LANDLORD", "ADMIN"]).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
