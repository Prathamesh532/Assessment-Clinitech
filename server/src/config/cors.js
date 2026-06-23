import { env } from "./env.js";
import { HttpError } from "../lib/http-error.js";

const splitOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

export const allowedOrigins = [...new Set([...splitOrigins(env.CLIENT_ORIGINS), env.CLIENT_ORIGIN])];

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new HttpError(403, "Origin is not allowed by CORS policy"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  optionsSuccessStatus: 204,
  maxAge: 60 * 60,
};
