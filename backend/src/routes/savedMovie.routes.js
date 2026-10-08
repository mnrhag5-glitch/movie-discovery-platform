import express from "express";

import {
  getSavedMovies,
  saveMovie,
  deleteSavedMovie,
} from "../controllers/savedMovie.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { saveMovieSchema } from "../validators/saved-movie.validator.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getSavedMovies
);

router.post(
  "/",
  authMiddleware,
  validate(saveMovieSchema),
  saveMovie
);

router.delete(
  "/:externalMovieId",
  authMiddleware,
  deleteSavedMovie
);

export default router;