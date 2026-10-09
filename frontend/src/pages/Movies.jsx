import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { movieApi, savedMovieApi } from "../services/api.js";

const PAGE_SIZE = 12;

function Movies() {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [movies, setMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");

  const [nextCursorMark, setNextCursorMark] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const requestIdRef = useRef(0);

  const isSearching = Boolean(debouncedSearch);
  const isSearchPending = search.trim() !== debouncedSearch;

  const savedMovieIds = new Set(
    savedMovies.map((movie) => movie.externalMovieId)
  );

  // Debounce search to avoid calling the API on every keystroke.
  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setDebouncedSearch("");
      return;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(query);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Fetch popular movies or the first page of search results.
  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      setMovies([]);
      setNextCursorMark(null);
      setTotalResults(0);

      try {
        if (debouncedSearch) {
          const response = await movieApi.searchMovies(
            debouncedSearch,
            PAGE_SIZE
          );

          if (cancelled) return;

          const result = response.data;

          setMovies(result.results || []);
          setNextCursorMark(result.nextCursorMark || null);
          setTotalResults(Number(result.numFound) || 0);
        } else {
          const response = await movieApi.getPopularMovies();

          if (cancelled) return;

          const popularMovies = Array.isArray(response.data)
            ? response.data
            : [];

          setMovies(popularMovies);
          setTotalResults(popularMovies.length);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError.message || "Unable to load movies. Please try again."
          );
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  // Load the current user's saved movies.
  useEffect(() => {
    let cancelled = false;

    const fetchSavedMovies = async () => {
      if (!token) {
        setSavedMovies([]);
        setSavedError("");
        return;
      }

      try {
        const response = await savedMovieApi.getSavedMovies(token);

        if (cancelled) return;

        setSavedMovies(
          Array.isArray(response.data) ? response.data : []
        );
        setSavedError("");
      } catch (fetchError) {
        if (!cancelled) {
          setSavedError(
            fetchError.message || "Unable to load your saved movie status."
          );
        }
      }
    };

    fetchSavedMovies();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fetch the next cursor-based search page.
  const handleLoadMore = useCallback(async () => {
    if (
      !debouncedSearch ||
      !nextCursorMark ||
      loading ||
      loadingMore ||
      isSearchPending
    ) {
      return;
    }

    const requestId = requestIdRef.current;

    setLoadingMore(true);
    setError("");

    try {
      const response = await movieApi.searchMovies(
        debouncedSearch,
        PAGE_SIZE,
        nextCursorMark
      );

      if (requestId !== requestIdRef.current) return;

      const result = response.data;
      const nextMovies = result.results || [];

      setMovies((currentMovies) => {
        const existingIds = new Set(currentMovies.map((movie) => movie.id));

        const uniqueMovies = nextMovies.filter(
          (movie) => !existingIds.has(movie.id)
        );

        return [...currentMovies, ...uniqueMovies];
      });

      setNextCursorMark(result.nextCursorMark || null);
      setTotalResults(Number(result.numFound) || 0);
    } catch (fetchError) {
      if (requestId === requestIdRef.current) {
        setError(
          fetchError.message || "Unable to load more movies. Please retry."
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [
    debouncedSearch,
    nextCursorMark,
    loading,
    loadingMore,
    isSearchPending,
  ]);

  // Save or remove a movie from the logged-in user's collection.
  const handleToggleSaved = async (movie) => {
    if (!token) {
      navigate("/login", {
        state: { message: "Please login to save movies." },
      });
      return;
    }

    if (savingId !== null) return;

    const movieId = movie.id;

    if (!movieId) {
      setSavedError("This movie cannot be saved because its ID is missing.");
      return;
    }

    setSavingId(movieId);
    setSavedError("");

    try {
      if (savedMovieIds.has(movieId)) {
        await savedMovieApi.deleteSavedMovie(movieId, token);

        setSavedMovies((currentMovies) =>
          currentMovies.filter(
            (savedMovie) => savedMovie.externalMovieId !== movieId
          )
        );
      } else {
        const moviePayload = {
          externalMovieId: movieId,
          title: movie.title,
          poster: movie.poster || "",
          year: movie.year ?? null,
          rating: movie.rating ?? null,
        };

        const response = await savedMovieApi.saveMovie(moviePayload, token);

        setSavedMovies((currentMovies) => {
          if (
            currentMovies.some(
              (savedMovie) => savedMovie.externalMovieId === movieId
            )
          ) {
            return currentMovies;
          }

          const savedMovie = response.data;

          return [
            ...currentMovies,
            savedMovie &&
            savedMovie.externalMovieId === movieId
              ? savedMovie
              : moviePayload,
          ];
        });
      }
    } catch (saveError) {
      setSavedError(
        saveError.message || "Unable to update your saved movies."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleRetry = () => {
    // Trigger a fresh request without changing the search query.
    setDebouncedSearch((current) => `${current}\u0000`);
    setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 0);
  };

  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}
    >
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wider text-orange-500">
            MOVIE DISCOVERY
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Movies
          </h1>

          <p className={`mt-2 max-w-xl text-sm leading-6 sm:text-base ${mutedText}`}>
            Discover movies, explore ratings and save your next watch.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <label htmlFor="movie-search" className="sr-only">
            Search movies
          </label>

          <div className="relative w-full sm:max-w-2xl">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500"
            >
              ⌕
            </span>

            <input
              id="movie-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search movie titles..."
              autoComplete="off"
              className={`w-full rounded-xl border py-3.5 pl-11 pr-12 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
                  : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400"
              }`}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-zinc-500 transition hover:text-orange-500"
              >
                ×
              </button>
            )}
          </div>

          <p className={`mt-2 text-xs ${mutedText}`}>
            Search updates automatically as you type.
          </p>
        </div>

        {/* Error messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-400">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="w-fit rounded-lg border border-red-800/70 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/30 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {savedError && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-sm text-amber-500"
          >
            {savedError}
          </div>
        )}

        {/* Results heading */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              {isSearchPending
                ? "Searching..."
                : isSearching
                  ? "Search Results"
                  : "Popular Movies"}
            </h2>

            {!loading && !error && isSearching && (
              <p className={`mt-1 text-xs ${mutedText}`}>
                Showing {movies.length} of {totalResults.toLocaleString()} results
              </p>
            )}
          </div>

          {!loading && (
            <span className={`text-xs sm:text-sm ${mutedText}`}>
              {movies.length} {movies.length === 1 ? "movie" : "movies"}
            </span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div
            aria-label="Loading movies"
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
          >
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className={`animate-pulse overflow-hidden rounded-xl border ${
                  isDark
                    ? "border-zinc-800 bg-gray-800"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <div
                  className={`aspect-[2/3] ${
                    isDark ? "bg-zinc-800" : "bg-zinc-200"
                  }`}
                />

                <div className="space-y-3 p-3 sm:p-4">
                  <div
                    className={`h-4 w-3/4 rounded ${
                      isDark ? "bg-zinc-700" : "bg-zinc-200"
                    }`}
                  />
                  <div
                    className={`h-3 w-1/2 rounded ${
                      isDark ? "bg-zinc-700" : "bg-zinc-200"
                    }`}
                  />
                  <div
                    className={`h-9 rounded-lg ${
                      isDark ? "bg-zinc-700" : "bg-zinc-200"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            {/* Movie grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {movies.map((movie) => {
                const isSaved = savedMovieIds.has(movie.id);
                const isSaving = savingId === movie.id;

                return (
                  <article
                    key={movie.id}
                    className={`group overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10 ${
                      isDark
                        ? "border-zinc-800 bg-gray-800 hover:border-orange-600"
                        : "border-zinc-200 bg-white hover:border-orange-500"
                    }`}
                  >
                    {/* Real IMDb poster */}
                    <div
                      className={`relative aspect-[2/3] overflow-hidden ${
                        isDark ? "bg-zinc-900" : "bg-zinc-200"
                      }`}
                    >
                      <img
                        src={
                          movie.poster ||
                          "https://placehold.co/300x450/18181b/f5f5f5?text=Poster+Unavailable"
                        }
                        alt={`${movie.title || "Movie"} poster`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            "https://placehold.co/300x450/18181b/f5f5f5?text=Poster+Unavailable";
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {movie.rating != null && (
                        <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-zinc-950/85 px-2.5 py-1 text-xs font-medium text-orange-400 shadow-lg backdrop-blur-sm">
                          ★ {Number(movie.rating).toFixed(1)}
                        </span>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Movie details */}
                    <div className="p-3 sm:p-4">
                      <h3
                        title={movie.title}
                        className="truncate text-sm font-semibold transition-colors duration-200 group-hover:text-orange-500 sm:text-base"
                      >
                        {movie.title || "Untitled movie"}
                      </h3>

                      <div className={`mt-2 flex items-center justify-between gap-2 text-xs sm:text-sm ${mutedText}`}>
                        <span>{movie.year || "Year unavailable"}</span>

                        <span>
                          {movie.rating != null
                            ? "IMDb rating"
                            : "Not rated"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSaved(movie)}
                        disabled={savingId !== null}
                        aria-label={
                          isSaved
                            ? `Remove ${movie.title} from saved movies`
                            : `Save ${movie.title}`
                        }
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
                          isSaved
                            ? "border-orange-500/40 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                            : isDark
                              ? "border-zinc-700 bg-zinc-900 hover:border-orange-500 hover:text-orange-500"
                              : "border-zinc-300 bg-zinc-50 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {isSaving
                          ? "Updating..."
                          : isSaved
                            ? "✓ Saved · Remove"
                            : "+ Save Movie"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Cursor pagination for search results */}
            {isSearching && nextCursorMark && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className={`text-xs ${mutedText}`}>
                  {movies.length.toLocaleString()} movies loaded
                </p>

                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore || loading || isSearchPending}
                  className="flex min-w-44 items-center justify-center gap-2 rounded-xl border border-orange-600/50 bg-orange-600/10 px-6 py-3 text-sm font-semibold text-orange-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500 hover:bg-orange-600/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
                      Loading more...
                    </>
                  ) : (
                    "Load More Movies ↓"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div
            className={`rounded-2xl border border-dashed px-5 py-16 text-center ${
              isDark
                ? "border-zinc-800 bg-gray-800/40"
                : "border-zinc-300 bg-white"
            }`}
          >
            <div className="text-4xl">🎬</div>

            <h2 className="mt-4 text-lg font-semibold">
              {error
                ? "Movies couldn't be loaded"
                : isSearching
                  ? "No movies found"
                  : "No movies available"}
            </h2>

            <p className={`mt-2 text-sm ${mutedText}`}>
              {error
                ? "Check your connection and try again."
                : "Try another title or clear your search."}
            </p>

            {isSearching && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Movies;