import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.string().email().default("admin@rentnest.com"),
  ADMIN_PASSWORD: z.string().min(6).default("admin123"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  console.error("Invalid environment variables:", fieldErrors);
  throw new Error(
    `Missing or invalid environment variables: ${Object.keys(fieldErrors).join(", ")}`
  );
}

export const env = parsed.data;
