import { HttpError } from "../lib/http-error.js";

export const validate = (target, schema) => (request, _response, next) => {
  const result = schema.safeParse(request[target]);
  if (!result.success) return next(new HttpError(400, "Request validation failed", result.error.flatten()));
  request.validated ??= {};
  request.validated[target] = result.data;
  next();
};
