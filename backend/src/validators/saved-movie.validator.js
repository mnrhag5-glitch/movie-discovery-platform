import { z } from "zod";

export const saveMovieSchema = z.object({
  externalMovieId: z
    .string()
    .trim()
    .min(1, "Movie ID is required"),

  title: z
    .string()
    .trim()
    .min(1, "Movie title is required"),

  poster: z
    .string()
    .url("Poster must be a valid URL")
    .nullable()
    .optional(),

  year: z
    .string()
    .nullable()
    .optional(),

  rating: z
    .number()
    .min(0)
    .max(10)
    .nullable()
    .optional(),
});