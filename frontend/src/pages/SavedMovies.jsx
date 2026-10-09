import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { savedMovieApi } from "../services/api.js";
import Navbar from "../components/Navbar.jsx";

function SavedMovies() {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const fetchSavedMovies = useCallback(async () => {
    if (!token) {
      setSavedMovies([]);
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await savedMovieApi.getSavedMovies(token);
      setSavedMovies(response.data || []);
    } catch (submitError) {
      setError(submitError.message || "Unable to load saved movies.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchSavedMovies();
  }, [fetchSavedMovies]);

  const handleRemoveMovie = async (movieId) => {
    if (!token || removingId) return;

    setRemovingId(movieId);
    setError("");

    try {
      await savedMovieApi.deleteSavedMovie(movieId, token);

      setSavedMovies((currentMovies) =>
        currentMovies.filter(
          (movie) => movie.externalMovieId !== movieId
        )
      );
    } catch (submitError) {
      setError(submitError.message || "Unable to remove saved movie.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}
    >
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-wider text-orange-500">
              YOUR COLLECTION
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Saved Movies
            </h1>

            <p
              className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Your personal collection of movies worth watching.
            </p>
          </div>

          {!loading && savedMovies.length > 0 && (
            <div
              className={`flex w-fit items-center gap-3 rounded-xl border px-4 py-3 ${
                isDark
                  ? "border-zinc-800 bg-gray-800"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-xl text-orange-500">
                ♡
              </span>

              <div>
                <p className="text-xl font-bold tabular-nums">
                  {savedMovies.length}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Saved {savedMovies.length === 1 ? "movie" : "movies"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-300">{error}</p>

            <button
              type="button"
              onClick={fetchSavedMovies}
              disabled={loading}
              className="w-fit rounded-lg border border-red-800/70 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div
            aria-label="Loading saved movies"
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
          >
            {Array.from({ length: 5 }, (_, index) => (
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
                    className={`h-3 w-1/3 rounded ${
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
        ) : savedMovies.length === 0 && !error ? (
          /* Empty state */
          <div
            className={`mt-8 rounded-2xl border border-dashed px-5 py-16 text-center sm:py-20 ${
              isDark
                ? "border-zinc-800 bg-gray-800/40"
                : "border-zinc-300 bg-white"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-3xl">
              🎬
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Your watchlist is waiting
            </h2>

            <p
              className={`mx-auto mt-2 max-w-sm text-sm leading-6 ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              You haven't saved any movies yet. Explore the collection and
              keep your next favorite movie close.
            </p>

            <Link
              to="/movies"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 active:translate-y-0"
            >
              Discover Movies
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        ) : (
          /* Saved movie cards */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {savedMovies.map((movie) => (
              <article
                key={movie.externalMovieId}
                className={`group overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-950/10 ${
                  isDark
                    ? "border-zinc-800 bg-gray-800 hover:border-orange-600"
                    : "border-zinc-200 bg-white hover:border-orange-500"
                }`}
              >
                {/* Poster */}
                <div
                  className={`relative aspect-[2/3] overflow-hidden ${
                    isDark ? "bg-zinc-900" : "bg-zinc-200"
                  }`}
                >
                  <img
                    src={
                      movie.poster ||
                      "https://placehold.co/300x450/18181b/f5f5f5?text=Movie"
                    }
                    alt={`${movie.title} poster`}
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

                {/* Details */}
                <div className="p-3 sm:p-4">
                  <h2
                    title={movie.title}
                    className="truncate text-sm font-semibold transition-colors duration-200 group-hover:text-orange-500 sm:text-base"
                  >
                    {movie.title}
                  </h2>

                  <p
                    className={`mt-2 text-xs sm:text-sm ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {movie.year || "Year unavailable"}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemoveMovie(movie.externalMovieId)}
                    disabled={removingId !== null}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 py-2.5 text-xs font-medium text-red-300 transition-all duration-200 hover:border-red-700 hover:bg-red-950/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    {removingId === movie.externalMovieId ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300/30 border-t-red-300" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">×</span>
                        Remove from Saved
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default SavedMovies;