import express from "express";
import { getPopularMovies,searchMoviesController,getMovieDetailsController } from "../controllers/movie.controller.js";
import { movieRateLimiter } from "../middleware/rate-limit.middleware.js";


const router = express.Router();

router.get("/popular", movieRateLimiter, getPopularMovies);
router.get("/search", movieRateLimiter, searchMoviesController);
router.get("/:imdbId", movieRateLimiter, getMovieDetailsController);
export default router;