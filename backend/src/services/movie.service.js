import { createAppError } from "../utils/app-error.util.js";
import { fetchWithTimeout } from "../utils/fetch.util.js";
import cache from "../utils/cache.util.js";

export const getMovieDetails = async (imdbId) => {
  const response = await fetchWithTimeout(
    `https://imdb236.p.rapidapi.com/api/imdb/${imdbId}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    },
  );

  if (!response.ok) {
  
    throw createAppError(
      "Movie details service is temporarily unavailable",
      response.status === 429 ? 429 : 502,
    );
  }

  const movie = await response.json();

  return {
    id: movie.id,
    title: movie.primaryTitle,
    originalTitle: movie.originalTitle,
    description: movie.description,
    poster: movie.primaryImage,
    year: movie.startYear,
    rating: movie.averageRating,
    ratingCount: movie.numVotes,
    genres: movie.genres || [],
    runtime: movie.runtimeMinutes,
    contentRating: movie.contentRating,
    countries: movie.countriesOfOrigin || [],
    languages: movie.spokenLanguages || [],
  };
};

const getMostPopularMovies = async () => {
    const cachedMovies = cache.get("popular-movies");

if (cachedMovies) {
  return cachedMovies;
}
  const response = await fetchWithTimeout(
    "https://imdb236.p.rapidapi.com/api/imdb/most-popular-movies",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    },
  );

  if (!response.ok) {
   

    throw createAppError(
      "Movie service is temporarily unavailable",
      response.status === 429 ? 429 : 502,
    );
  }

const data = await response.json();

const movies = data.map((movie) => ({
  id: movie.id,
  title: movie.primaryTitle,
  description: movie.description,
  poster: movie.primaryImage,
}));

cache.set("popular-movies", movies);

return movies;
};

export const searchMovies = async ({ query, cursorMark, rows = 25 }) => {
  const params = new URLSearchParams({
    primaryTitleAutocomplete: query,
    type: "movie",
    rows: String(rows),
  });

  if (cursorMark) {
    params.append("cursorMark", cursorMark);
  }

  const response = await fetchWithTimeout(
    `https://imdb236.p.rapidapi.com/api/imdb/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    },
  );

  if (!response.ok) {
   

    throw createAppError(
      "Movie search service is temporarily unavailable",
      response.status === 429 ? 429 : 502,
    );
  }
  const data = await response.json();

  return {
    rows: data.rows,
    numFound: data.numFound,
    nextCursorMark: data.nextCursorMark || null,

    results: data.results.map((movie) => ({
      id: movie.id,
      title: movie.primaryTitle,
      description: movie.description,
      poster: movie.primaryImage,
      year: movie.startYear,
      rating: movie.averageRating,
      genres: movie.genres || [],
    })),
  };
};

export default getMostPopularMovies;
