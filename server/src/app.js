import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { corsOptions } from "./config/cors.js";
import { authRouter } from "./routes/auth.routes.js";
import { userReportRouter } from "./routes/user-report.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(pinoHttp());
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8" }));
  app.get("/health", (_request, response) => response.json({ status: "ok", service: "careview-api", timestamp: new Date().toISOString() }));
  app.use("/api/auth", authRouter);
  app.use("/api/reports/me", userReportRouter);
  app.use("/api/admin", adminRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
