import { describe, expect, it, mock } from "bun:test";
import { app } from "../src/index";

// Mocking the users-service module
mock.module("../src/services/users-service", () => ({
  registerUser: async (name: string, email: string) => {
    if (email === "duplicate@example.com") {
      throw new Error("Email sudah terdaftar");
    }
    return { success: true };
  },
  loginUser: async (email: string) => {
    if (email === "wrong@example.com") {
      throw new Error("Email atau Password salah");
    }
    return "mocked-token";
  },
  getCurrentUser: async (token: string) => {
    if (token === "invalid-token") {
      throw new Error("Unauthorized");
    }
    return { id: 1, email: "test@example.com", name: "Test User" };
  },
  logoutUser: async (token: string) => {
    return { success: true };
  }
}));

describe("Users API Endpoints", () => {
  describe("POST /api/users/", () => {
    it("should register successfully with valid data", async () => {
      const res = await app.handle(new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "User", email: "user@example.com", password: "password" })
      }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ Data: "OK" });
    });

    it("should fail with duplicate email", async () => {
      const res = await app.handle(new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "User", email: "duplicate@example.com", password: "password" })
      }));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Email sudah terdaftar" });
    });

    it("should fail validation if name is too long", async () => {
      const res = await app.handle(new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "a".repeat(300), email: "long@example.com", password: "pass" })
      }));
      expect(res.status).toBe(422);
    });

    it("should fail validation if email format is invalid", async () => {
      const res = await app.handle(new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "User", email: "invalid-email", password: "pass" })
      }));
      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login successfully", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", password: "password" })
      }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: "mocked-token" });
    });

    it("should fail with wrong credentials", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "wrong@example.com", password: "password" })
      }));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Email atau Password salah" });
    });
  });

  describe("GET /api/users/current", () => {
    it("should fetch current user with valid token", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/current", {
        headers: { "Authorization": "Bearer valid-token" }
      }));
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.Data.email).toBe("test@example.com");
    });

    it("should fail without token", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/current"));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    });

    it("should fail with invalid token", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/current", {
        headers: { "Authorization": "Bearer invalid-token" }
      }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    });
  });

  describe("DELETE /api/users/logout", () => {
    it("should logout successfully", async () => {
      const res = await app.handle(new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: { "Authorization": "Bearer valid-token" }
      }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ Data: "OK" });
    });
  });
});
