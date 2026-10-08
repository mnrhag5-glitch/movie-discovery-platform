

export const getMovieDetails = async (imdbId) => {
  const response = await fetch(
    `https://imdb236.p.rapidapi.com/api/imdb/${imdbId}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `IMDb details request failed: ${response.status} ${errorText}`
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
  const response = await fetch(
    "https://imdb236.p.rapidapi.com/api/imdb/most-popular-movies",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `IMDb API request failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  // IMDb response ko frontend-friendly format me convert karna
  return data.map((movie) => ({
    id: movie.id,
    title: movie.primaryTitle,
    description: movie.description,
    poster: movie.primaryImage,
  }));
};


export const searchMovies = async ({
  query,
  cursorMark,
  rows = 25,
}) => {
  const params = new URLSearchParams({
    primaryTitleAutocomplete: query,
    type: "movie",
    rows: String(rows),
  });

  if (cursorMark) {
    params.append("cursorMark", cursorMark);
  }

  const response = await fetch(
    `https://imdb236.p.rapidapi.com/api/imdb/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `IMDb search request failed: ${response.status} ${errorText}`
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