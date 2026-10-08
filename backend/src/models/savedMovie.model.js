import mongoose from "mongoose";

const savedMovieSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    externalMovieId: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    poster: {
      type: String,
      default: null,
      trim: true,
    },

    year: {
      type: String,
      default: null,
      trim: true,
    },

    rating: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

savedMovieSchema.index(
  { userId: 1, externalMovieId: 1 },
  { unique: true }
);

const SavedMovie = mongoose.model("SavedMovie", savedMovieSchema);

export default SavedMovie;