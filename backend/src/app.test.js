import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("Health API", () => {
  it("should return API running message", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Movie Discovery API is running"
    );
  });
});