import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { stripeWebhook } from "./modules/payments/payment.controller";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());

// Stripe webhook requires raw body for signature verification
/**
 * @swagger
 * /api/payments/webhook/stripe:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook endpoint (payment_intent events)
 *     description: Configure this URL in Stripe Dashboard. Requires STRIPE_WEBHOOK_SECRET.
 */
app.post(
  "/api/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API health check
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "RentNest API is running",
    data: {
      version: "1.0.0",
      docs: "/api-docs",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.get("/api-docs", (_req, res) => {
  res.redirect(301, "/api-docs/");
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "RentNest API Docs",
  })
);
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
