import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("./models/savedMovie.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("./middleware/auth.middleware.js", () => ({
  default: (req, res, next) => {
    req.user = {
      id: "507f1f77bcf86cd799439011",
    };

    next();
  },
}));

import app from "./app.js";
import SavedMovie from "./models/savedMovie.model.js";

describe("Saved Movies API", () => {
  it("should save a movie successfully", async () => {
    SavedMovie.findOne.mockResolvedValueOnce(null);

    SavedMovie.create.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439012",
      userId: "507f1f77bcf86cd799439011",
      externalMovieId: "tt1234567",
      title: "Test Movie",
      poster: "https://example.com/poster.jpg",
      year: "2026",
      rating: 8.5,
    });

    const response = await request(app)
      .post("/api/saved-movies")
      .send({
        externalMovieId: "tt1234567",
        title: "Test Movie",
        poster: "https://example.com/poster.jpg",
        year: "2026",
        rating: 8.5,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.externalMovieId).toBe(
      "tt1234567"
    );
    expect(response.body.data.title).toBe("Test Movie");
  });

  it("should reject duplicate movie", async () => {
    SavedMovie.findOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439012",
      externalMovieId: "tt1234567",
    });

    const response = await request(app)
      .post("/api/saved-movies")
      .send({
        externalMovieId: "tt1234567",
        title: "Test Movie",
        poster: "https://example.com/poster.jpg",
        year: "2026",
        rating: 8.5,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Movie is already saved"
    );
  });

  it("should return saved movies", async () => {
    const savedMovies = [
      {
        _id: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439011",
        externalMovieId: "tt1234567",
        title: "Test Movie",
        year: "2026",
        rating: 8.5,
      },
    ];

    SavedMovie.find.mockReturnValueOnce({
      sort: vi.fn().mockResolvedValue(savedMovies),
    });

    const response = await request(app).get(
      "/api/saved-movies"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("Test Movie");
  });

  it("should delete a saved movie", async () => {
    SavedMovie.findOneAndDelete.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439012",
      externalMovieId: "tt1234567",
    });

    const response = await request(app).delete(
      "/api/saved-movies/tt1234567"
    );

    

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Movie removed from saved movies"
    );
  });
});