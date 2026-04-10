import { describe, expect, it, mock } from "bun:test";
import { app } from "../src/index";

// Mocking the database module
mock.module("../src/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: async () => ({})
    }),
    select: () => ({
      from: async () => [{ id: 1, message: "Mocked Message" }]
    })
  })
}));

describe("App Utility Endpoints", () => {
  it("should return Hello World from index", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello World from Elysia & Bun!");
  });

  it("should return database connection success status", async () => {
    const response = await app.handle(new Request("http://localhost/test-db"));
    const data = await response.json() as any;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Database connected and query successful");
    expect(data.data[0].message).toBe("Mocked Message");
  });
});
