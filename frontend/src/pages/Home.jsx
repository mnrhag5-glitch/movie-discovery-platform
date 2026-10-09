import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useEffect, useState } from "react";
import { movieApi } from "../services/api.js";

const features = [
  {
    icon: "⌕",
    title: "Discover Movies",
    description:
      "Search and explore movies with ratings, release information and posters.",
  },
  {
    icon: "♡",
    title: "Save Favorites",
    description:
      "Build your personal collection and keep track of movies you want to watch.",
  },
  {
    icon: "⚡",
    title: "A Smooth Experience",
    description:
      "Enjoy a responsive interface designed to make movie discovery simple.",
  },
];

function Home() {
  const { isDark } = useTheme();
  const [featuredMovies, setFeaturedMovies] = useState([]);

useEffect(() => {
  let cancelled = false;

  const fetchFeaturedMovies = async () => {
    try {
      const response = await movieApi.getPopularMovies();

      if (!cancelled) {
        setFeaturedMovies(
          (Array.isArray(response.data) ? response.data : []).slice(0, 4)
        );
      }
    } catch (error) {
      console.error("Unable to load featured movies:", error);
    }
  };

  fetchFeaturedMovies();

  return () => {
    cancelled = true;
  };
}, []);

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-16 -z-10 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl sm:h-96 sm:w-96"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl sm:h-96 sm:w-96"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[690px] lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-24">
          {/* Hero copy */}
          <div className="max-w-2xl">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                isDark
                  ? "border-orange-500/20 bg-orange-500/5 text-orange-400"
                  : "border-orange-300 bg-orange-50 text-orange-700"
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
              Discover something worth watching
            </div>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Your next
              <span className="block text-orange-500">
                favorite movie
              </span>
              is waiting.
            </h1>

            <p
              className={`mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Search for movies, discover new favorites, and build a
              collection of films you want to watch next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-1 hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-900/20 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Start Exploring
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/login"
                className={`inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  isDark
                    ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                    : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-200"
                }`}
              >
                I already have an account
              </Link>
            </div>

            {/* Product highlights */}
            <div
              className={`mt-10 grid grid-cols-3 gap-3 border-t pt-7 sm:gap-6 ${
                isDark ? "border-zinc-800" : "border-zinc-300"
              }`}
            >
              <div>
                <p className="text-lg font-bold sm:text-xl">Discover</p>
                <p
                  className={`mt-1 text-xs leading-5 sm:text-sm ${
                    isDark ? "text-zinc-500" : "text-zinc-600"
                  }`}
                >
                  Find movies
                </p>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Explore</p>
                <p
                  className={`mt-1 text-xs leading-5 sm:text-sm ${
                    isDark ? "text-zinc-500" : "text-zinc-600"
                  }`}
                >
                  See ratings
                </p>
              </div>

              <div>
                <p className="text-lg font-bold sm:text-xl">Save</p>
                <p
                  className={`mt-1 text-xs leading-5 sm:text-sm ${
                    isDark ? "text-zinc-500" : "text-zinc-600"
                  }`}
                >
                  Build a watchlist
                </p>
              </div>
            </div>
          </div>

          {/* Movie showcase */}
          <div className="relative mx-auto w-full max-w-lg pb-7 lg:ml-auto">
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {featuredMovies.map((movie, index) => (
                <article
                  key={movie.title}
                  className={`group overflow-hidden rounded-2xl border shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                    index === 0 || index === 2 ? "mt-7" : ""
                  } ${
                    isDark
                      ? "border-zinc-800 bg-gray-800 hover:border-orange-600/70 hover:shadow-orange-950/20"
                      : "border-zinc-200 bg-white hover:border-orange-400 hover:shadow-orange-900/10"
                  }`}
                >
                  <div
                    className={`relative flex aspect-[2/3] items-center justify-center overflow-hidden ${
                      isDark ? "bg-zinc-900" : "bg-zinc-200"
                    }`}
                  >
                 {movie.poster ? (
  <img
    src={movie.poster}
    alt={`${movie.title || "Movie"} poster`}
    loading="lazy"
 
onError={(event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src =
    "https://placehold.co/300x450/18181b/f5f5f5?text=Poster+Unavailable";
}}

    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
) : (
  <span className="text-5xl opacity-25 sm:text-6xl">
    🎬
  </span>
)}

                    <span className="absolute right-2 top-2 rounded-full border border-white/10 bg-zinc-950/85 px-2.5 py-1 text-xs font-semibold text-orange-300 shadow-lg backdrop-blur-sm sm:right-3 sm:top-3">
                      ★ {movie.rating}
                    </span>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-xs font-semibold transition-colors duration-200 group-hover:text-orange-500 sm:text-sm">
                        {movie.title}
                      </h2>
                    </div>

                    <p
                      className={`mt-1 text-xs ${
                        isDark ? "text-zinc-500" : "text-zinc-500"
                      }`}
                    >
                      {movie.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Floating collection card */}
            <div
              className={`absolute -bottom-1 left-1/2 flex w-max max-w-[95%] -translate-x-1/2 items-center gap-3 rounded-xl border px-3 py-3 shadow-2xl transition-transform duration-300 hover:-translate-y-1 sm:bottom-0 sm:left-5 sm:translate-x-0 sm:px-4 ${
                isDark
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xl text-orange-500">
                ♡
              </div>

              <div>
                <p className="text-xs font-semibold sm:text-sm">
                  Your personal watchlist
                </p>
                <p
                  className={`mt-1 text-[11px] sm:text-xs ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}
                >
                  Keep your favorites together
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className={`border-t px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${
          isDark
            ? "border-zinc-800 bg-zinc-950"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wider text-orange-500">
              BUILT FOR MOVIE LOVERS
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need for your next movie night.
            </h2>

            <p
              className={`mt-3 text-sm leading-6 sm:text-base ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              Discover films, explore details, and keep your favorites
              organized in one place.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                  isDark
                    ? "border-zinc-800 bg-gray-800 hover:border-orange-600/60 hover:bg-zinc-800"
                    : "border-zinc-200 bg-zinc-50 hover:border-orange-400 hover:bg-orange-50/40"
                }`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl text-orange-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>

                <h3 className="font-semibold">{feature.title}</h3>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {feature.description}
                </p>

                <div
                  className={`mt-5 h-0.5 w-8 rounded-full bg-orange-500 transition-all duration-300 group-hover:w-14 ${
                    index === 1 ? "group-hover:w-16" : ""
                  }`}
                />
              </article>
            ))}
          </div>

          {/* Final CTA */}
          <div
            className={`mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border p-6 sm:p-8 md:flex-row md:items-center ${
              isDark
                ? "border-zinc-800 bg-gray-800"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <div>
              <h3 className="text-xl font-bold">
                Ready to find your next favorite?
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Create an account and start building your watchlist.
              </p>
            </div>

            <Link
              to="/signup"
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 active:translate-y-0"
            >
              Create Account
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t px-4 py-7 text-center ${
          isDark
            ? "border-zinc-800 bg-zinc-950"
            : "border-zinc-200 bg-zinc-100"
        }`}
      >
        <Link
          to="/"
          className="text-sm font-bold tracking-tight transition-colors hover:text-orange-500"
        >
          Movie<span className="text-orange-500">Hub</span>
        </Link>

        <p
          className={`mt-2 text-xs ${
            isDark ? "text-zinc-500" : "text-zinc-500"
          }`}
        >
          Discover your next favorite movie.
        </p>
      </footer>
    </main>
  );
}

export default Home;