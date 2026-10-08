import getMostPopularMovies, {searchMovies,getMovieDetails} from "../services/movie.service.js";


export const getPopularMovies = async (req, res, next) => {
  try {
    const movies = await getMostPopularMovies();

    return res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

export const searchMoviesController = async (req, res, next) => {
  try {
    const { q, cursorMark } = req.query;

    let { rows = 25 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    rows = Number(rows);

    if (!Number.isInteger(rows) || rows < 1 || rows > 100) {
      return res.status(400).json({
        success: false,
        message: "Rows must be a number between 1 and 100",
      });
    }

    const movies = await searchMovies({
      query: q.trim(),
      cursorMark,
      rows,
    });

    return res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieDetailsController = async (req, res, next) => {
  try {
    const { imdbId } = req.params;

    if (!imdbId || !imdbId.trim()) {
      return res.status(400).json({
        success: false,
        message: "IMDb movie ID is required",
      });
    }

    const movie = await getMovieDetails(imdbId.trim());

    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};