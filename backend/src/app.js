import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import savedMovieRoutes from "./routes/savedMovie.routes.js";




const app = express();
app.use(errorMiddleware);

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/saved-movies", savedMovieRoutes);



app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Movie Discovery API is running",
  });
});

export default app;