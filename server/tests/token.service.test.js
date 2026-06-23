import { describe, expect, it } from "vitest";
import { createAccessToken, verifyAccessToken } from "../src/services/token.service.js";

describe("access tokens", () => {
  it("retains authorization claims", () => {
    const payload = verifyAccessToken(createAccessToken({ sub: "user-1", role: "USER", clientId: 42 }));
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("USER");
    expect(payload.clientId).toBe(42);
  });
});
