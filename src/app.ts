import express from "express";
import cors from "cors";
import helmet from "helmet";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { stripeWebhook } from "./modules/payments/payment.controller";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>RentNest API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api-docs.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>`;

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

const serveSwaggerDocs = (_req: express.Request, res: express.Response) => {
  res.type("html").send(swaggerHtml);
};

app.get("/api-docs", serveSwaggerDocs);
app.get("/api-docs/", serveSwaggerDocs);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
