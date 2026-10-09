import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const initialState = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

function Signup() {
  const { isDark } = useTheme();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanedName = form.name.trim();
    const cleanedEmail = form.email.trim();
    const cleanedPhone = form.phone.trim();

    if (!cleanedName || !cleanedEmail || !cleanedPhone || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (cleanedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        name: cleanedName,
        email: cleanedEmail,
        phone: cleanedPhone,
        password: form.password,
      };

  await authApi.signup(signupData);

navigate("/login", {
  state: {
    message: "Account created successfully. Please log in.",
  },
});
    } catch (submitError) {
      setError(submitError.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 transition-colors duration-300 sm:px-6 ${
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}
    >
      {/* Subtle background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"
      />

      {/* Signup card */}
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-colors duration-300 sm:p-8 ${
          isDark
            ? "border-zinc-800 bg-gray-800 shadow-black/20"
            : "border-zinc-200 bg-white shadow-zinc-300/30"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="mx-auto mb-7 block w-fit text-xl font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          Movie<span className="text-orange-500">Hub</span>
        </Link>

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500">
            ✦
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create Account
          </h1>

          <p
            className={`mt-2 text-sm leading-6 ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Join MovieHub and build your personal watchlist.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div>
            <label
              htmlFor="signup-name"
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              Full name
            </label>

            <input
              id="signup-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={50}
              required
              placeholder="Enter your name"
              className={`${inputClass} ${
                isDark
                  ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                  : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400"
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              Email address
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
              placeholder="you@example.com"
              className={`${inputClass} ${
                isDark
                  ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                  : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400"
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="signup-phone"
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              WhatsApp phone number
            </label>

            <input
              id="signup-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              inputMode="tel"
              maxLength={16}
              required
              placeholder="+91XXXXXXXXXX"
              className={`${inputClass} ${
                isDark
                  ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                  : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400"
              }`}
            />

            <p
              className={`mt-2 text-xs ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              We’ll use this number for WhatsApp OTP verification.
            </p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              Password
            </label>

            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                placeholder="Create a strong password"
                className={`${inputClass} pr-20 ${
                  isDark
                    ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
                    : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={`absolute inset-y-0 right-3 my-auto h-fit rounded-md px-2 py-1 text-xs font-medium transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p
              className={`mt-2 text-xs ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              Use at least 8 characters.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p
          className={`mt-7 text-center text-sm ${
            isDark ? "text-zinc-400" : "text-zinc-600"
          }`}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-500 underline-offset-4 transition-colors hover:text-orange-400 hover:underline"
          >
            Login
          </Link>
        </p>

        {/* Footer note */}
        <p
          className={`mt-6 border-t pt-5 text-center text-xs leading-5 ${
            isDark
              ? "border-zinc-700 text-zinc-500"
              : "border-zinc-200 text-zinc-500"
          }`}
        >
          By creating an account, you can save movies to your personal
          collection.
        </p>
      </div>
    </main>
  );
}

export default Signup;