import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("./services/movie.service.js", () => ({
  default: vi.fn().mockResolvedValue([
    {
      id: "tt1234567",
      title: "Test Movie",
      description: "Test description",
      poster: "https://example.com/poster.jpg",
    },
  ]),

  searchMovies: vi.fn(),

  getMovieDetails: vi.fn().mockResolvedValue({
    id: "tt1234567",
    title: "Test Movie",
    originalTitle: "Test Movie Original",
    description: "Test description",
    poster: "https://example.com/poster.jpg",
    year: 2026,
    rating: 8.5,
    ratingCount: 1000,
    genres: ["Drama"],
    runtime: 120,
    contentRating: "PG-13",
    countries: ["USA"],
    languages: ["English"],
  }),
}));

import app from "./app.js";

describe("Popular Movies API", () => {
  it("should return popular movies", async () => {
    const response = await request(app).get("/api/movies/popular");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("Test Movie");
  });
});

describe("Search Movies API", () => {
  it("should return search results", async () => {
    const { searchMovies } = await import(
      "./services/movie.service.js"
    );

    searchMovies.mockResolvedValueOnce({
      rows: 25,
      numFound: 100,
      nextCursorMark: "next-cursor-123",
      results: [
        {
          id: "tt1234567",
          title: "Test Movie",
          description: "Test description",
          poster: "https://example.com/poster.jpg",
          year: 2026,
          rating: 8.5,
          genres: ["Drama"],
        },
      ],
    });

    const response = await request(app)
      .get("/api/movies/search")
      .query({
        q: "test",
        rows: 25,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.rows).toBe(25);
    expect(response.body.data.numFound).toBe(100);
    expect(response.body.data.nextCursorMark).toBe(
      "next-cursor-123"
    );

    expect(response.body.data.results).toHaveLength(1);
    expect(response.body.data.results[0].title).toBe(
      "Test Movie"
    );
  });

  it("should reject search without a query", async () => {
    const response = await request(app)
      .get("/api/movies/search")
      .query({
        rows: 25,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Search query is required"
    );
  });
});

describe("Movie Details API", () => {
  it("should return movie details", async () => {
    const response = await request(app).get(
      "/api/movies/tt1234567"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.id).toBe("tt1234567");
    expect(response.body.data.title).toBe("Test Movie");
    expect(response.body.data.year).toBe(2026);
    expect(response.body.data.rating).toBe(8.5);
    expect(response.body.data.genres).toEqual(["Drama"]);
  });
});