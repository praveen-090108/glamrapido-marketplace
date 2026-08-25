import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.routes.js";
import { bookingsRouter } from "./routes/bookings.routes.js";
import { salonsRouter } from "./routes/salons.routes.js";
import { openApiDocument } from "./docs/openapi.js";

export function createApp() {
  const app = express();
  const allowedOrigins = env.WEB_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "glam-rapido-api" }));
  app.use("/api/auth", authRouter);
  app.use("/api/salons", salonsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(errorHandler);

  return app;
}
