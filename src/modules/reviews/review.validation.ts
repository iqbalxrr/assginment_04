import { z } from "zod";

export const createReviewSchema = z.object({
  rentalRequestId: z.string().uuid("Invalid rental request ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(1000).optional(),
});

export const reviewIdSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
});

export const propertyReviewsSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
});
