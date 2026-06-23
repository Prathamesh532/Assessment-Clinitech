const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("careview_token");
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(payload?.error?.message ?? "The request could not be completed", response.status, payload?.error?.details);
  return payload;
}
