import { z } from "zod";
import { RentalStatus } from "@prisma/client";

export const createRentalSchema = z
  .object({
    propertyId: z.string().uuid("Invalid property ID"),
    startDate: z.string().datetime({ message: "Invalid start date" }),
    endDate: z.string().datetime({ message: "Invalid end date" }),
    message: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const rentalIdSchema = z.object({
  id: z.string().uuid("Invalid rental request ID"),
});

export const updateRentalStatusSchema = z.object({
  status: z.enum([RentalStatus.APPROVED, RentalStatus.REJECTED], {
    errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
  }),
});

export const rentalFiltersSchema = z.object({
  status: z.nativeEnum(RentalStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
