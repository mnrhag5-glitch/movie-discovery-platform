import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-zinc-950 shadow-sm"
        : "text-white hover:bg-white/15 hover:text-orange-100"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-900/40 bg-gradient-to-r from-orange-700 to-orange-800 shadow-lg shadow-black/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/movies" : "/"}
          className="group text-xl font-bold tracking-tight text-white transition-transform duration-200 hover:scale-[1.02]"
        >
          Movie<span className="text-orange-200 transition-colors duration-200 group-hover:text-white">Hub</span>
        </Link>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/movies" className={navLinkClass}>
                Discover
              </NavLink>

              <NavLink to="/saved-movies" className={navLinkClass}>
                Saved Movies
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/15 hover:text-orange-100 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/15"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-100 active:translate-y-0"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Shared theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;