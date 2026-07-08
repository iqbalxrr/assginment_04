import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum([Role.TENANT, Role.LANDLORD], {
    errorMap: () => ({ message: "Role must be TENANT or LANDLORD" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
