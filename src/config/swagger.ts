import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const getServerUrl = () => {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${env.PORT}`;
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RentNest API",
      version: "1.0.0",
      description:
        "RentNest - Rental Property Marketplace Backend API. Find & list rental properties with ease.",
      contact: {
        name: "RentNest Support",
      },
    },
    servers: [
      {
        url: getServerUrl(),
        description: env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errorDetails: { type: "object", nullable: true },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/modules/**/*.routes.ts"),
    path.join(process.cwd(), "src/app.ts"),
    path.join(process.cwd(), "dist/modules/**/*.routes.js"),
    path.join(process.cwd(), "dist/app.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
