import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: "careview-api",
    audience: "careview-web",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { issuer: "careview-api", audience: "careview-web" });
}
