import { z } from "zod";
import { PropertyStatus } from "@prisma/client";

export const propertyFiltersSchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  bedrooms: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const propertyIdSchema = z.object({
  id: z.string().uuid("Invalid property ID"),
});

export const createPropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  address: z.string().min(5, "Address is required"),
  price: z.number().positive("Price must be positive"),
  bedrooms: z.number().int().positive("Bedrooms must be at least 1"),
  bathrooms: z.number().int().positive("Bathrooms must be at least 1"),
  area: z.number().positive().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url("Each image must be a valid URL")).default([]),
  categoryId: z.string().uuid("Invalid category ID"),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  status: z.nativeEnum(PropertyStatus).optional(),
});
