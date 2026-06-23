import { HttpError } from "../lib/http-error.js";

export const notFound = (request, _response, next) => next(new HttpError(404, `Route ${request.method} ${request.path} was not found`));

export function errorHandler(error, request, response, _next) {
  request.log?.error?.({ err: error }, "request failed");
  if (error instanceof HttpError) {
    return response.status(error.status).json({ error: { message: error.message, ...(error.details ? { details: error.details } : {}) } });
  }
  if (error?.code === "23505") return response.status(409).json({ error: { message: "A record with this value already exists" } });
  response.status(500).json({ error: { message: "An unexpected error occurred" } });
}
