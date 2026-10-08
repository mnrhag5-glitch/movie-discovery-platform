import SavedMovie from "../models/savedMovie.model.js";

export const getSavedMovies = async (req, res, next) => {
  try {
    const savedMovies = await SavedMovie.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: savedMovies,
    });
  } catch (error) {
    next(error);
  }
};

export const saveMovie = async (req, res, next) => {
  try {
    const {
      externalMovieId,
      title,
      poster,
      year,
      rating,
    } = req.body;

    const existingMovie = await SavedMovie.findOne({
      userId: req.user.id,
      externalMovieId,
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: "Movie is already saved",
      });
    }

    const savedMovie = await SavedMovie.create({
      userId: req.user.id,
      externalMovieId,
      title,
      poster,
      year,
      rating,
    });

    return res.status(201).json({
      success: true,
      message: "Movie saved successfully",
      data: savedMovie,
    });
  } catch (error) {
    // Handles duplicate insert race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Movie is already saved",
      });
    }

    next(error);
  }
};

export const deleteSavedMovie = async (req, res, next) => {
  try {
    const { externalMovieId } = req.params;

    const deletedMovie = await SavedMovie.findOneAndDelete({
      userId: req.user.id,
      externalMovieId,
    });

    if (!deletedMovie) {
      return res.status(404).json({
        success: false,
        message: "Saved movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie removed from saved movies",
    });
  } catch (error) {
    next(error);
  }
};