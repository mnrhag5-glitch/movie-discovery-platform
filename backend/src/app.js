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

console.log("Frontend URL:", process.env.FRONTEND_URL)
app.use(
  cors({
origin: [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://movie-discovery-platform-paf2.vercel.app"
], 
    credentials: true,
  })
);


app.use(express.json({ limit: "10kb" }));
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