import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateSessionToken,
  verifySessionToken,
  extractTokenFromRequest,
  UserPayload,
} from "./auth";

// Mock paseto-ts
vi.mock("paseto-ts/v4", () => ({
  generateKeys: vi.fn(() => ({ secretKey: "secret", publicKey: "public" })),
  sign: vi.fn(async () => "mock-token"),
  verify: vi.fn(async () => ({
    payload: { id: "123", email: "test@example.com" },
  })),
}));

describe("auth.ts", () => {
  const mockUser: UserPayload = {
    id: "123",
    ref: "ref",
    email: "test@example.com",
    username: "testuser",
    department: "math",
  };

  describe("generateSessionToken", () => {
    it("should generate a token for a user", async () => {
      const token = await generateSessionToken(mockUser);
      expect(token).toBe("mock-token");
    });
  });

  describe("verifySessionToken", () => {
    it("should verify and return payload for a valid token", async () => {
      const payload = await verifySessionToken("mock-token");
      expect(payload).toEqual({ id: "123", email: "test@example.com" });
    });

    it("should return null for an invalid token", async () => {
      const { verify } = await import("paseto-ts/v4");
      // @ts-ignore
      verify.mockRejectedValueOnce(new Error("Invalid token"));

      const payload = await verifySessionToken("invalid-token");
      expect(payload).toBeNull();
    });
  });

  describe("extractTokenFromRequest", () => {
    it("should extract token from Authorization header", () => {
      const request = new Request("http://localhost", {
        headers: { Authorization: "Bearer test-token" },
      });
      const token = extractTokenFromRequest(request);
      expect(token).toBe("test-token");
    });

    it("should extract token from cookies", () => {
      const request = new Request("http://localhost", {
        headers: { Cookie: "session=cookie-token" },
      });
      const token = extractTokenFromRequest(request);
      expect(token).toBe("cookie-token");
    });

    it("should return null if no token is found", () => {
      const request = new Request("http://localhost");
      const token = extractTokenFromRequest(request);
      expect(token).toBeNull();
    });
  });
});
