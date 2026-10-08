import express from "express";
import { getPopularMovies,searchMoviesController,getMovieDetailsController } from "../controllers/movie.controller.js";

const router = express.Router();

router.get("/popular", getPopularMovies);
router.get("/search", searchMoviesController);
router.get("/:imdbId", getMovieDetailsController);
export default router;