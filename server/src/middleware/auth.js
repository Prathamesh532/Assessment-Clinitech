import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken } from "../services/token.service.js";

export function requireAuth(request, _response, next) {
  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) return next(new HttpError(401, "Authentication required"));
  try {
    const payload = verifyAccessToken(authorization.slice(7));
    request.auth = { userId: payload.sub, role: payload.role, clientId: payload.clientId };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired access token"));
  }
}

export const requireRole = (...roles) => (request, _response, next) => {
  if (!request.auth || !roles.includes(request.auth.role)) return next(new HttpError(403, "You do not have permission to access this resource"));
  next();
};
