import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("cors policy", () => {
  const app = createApp();

  it("allows configured browser origins", async () => {
    const response = await request(app).options("/api/auth/login").set("Origin", "http://localhost:5173").set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-headers"]).toContain("Authorization");
  });

  it("allows requests without Origin headers for server tools and health checks", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("blocks unknown browser origins", async () => {
    const response = await request(app).options("/api/auth/login").set("Origin", "https://unknown.example").set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.body.error.message).toBe("Origin is not allowed by CORS policy");
  });
});
