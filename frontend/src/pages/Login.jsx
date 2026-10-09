
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { authApi } from "../services/api.js";

const initialEmailForm = { email: "", password: "" };
const initialPhoneForm = { phone: "", otp: "" };

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

function Login() {
  const { isDark } = useTheme();
  const { login } = useAuth();

  const [emailForm, setEmailForm] = useState(initialEmailForm);
  const [phoneForm, setPhoneForm] = useState(initialPhoneForm);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleEmailChange = (event) => {
    const { name, value } = event.target;

    setEmailForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handlePhoneChange = (event) => {
    const { name, value } = event.target;

    setPhoneForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!emailForm.email.trim() || !emailForm.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setActiveAction("email");

      const response = await authApi.login({
        email: emailForm.email.trim(),
        password: emailForm.password,
      });

      login(response.data);
      navigate("/movies", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const handleRequestOtp = async () => {
    setError("");
    setSuccess("");

    const phone = phoneForm.phone.trim();

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);
      setActiveAction("request-otp");

      await authApi.requestLoginOtp(phone);

      setOtpSent(true);
      setPhoneForm((previous) => ({ ...previous, otp: "" }));
      setSuccess("If the account is eligible, an OTP will be sent.");
    } catch (submitError) {
      setError(submitError.message || "Unable to request OTP. Please try again.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const handleVerifyPhoneOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const phone = phoneForm.phone.trim();
    const otp = phoneForm.otp.trim();

    if (!phone || !otp) {
      setError("Please enter your phone number and OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setActiveAction("verify-otp");

      const response = await authApi.verifyLoginOtp({ phone, otp });

      login(response.data);
      navigate("/movies", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const labelText = isDark ? "text-zinc-200" : "text-zinc-700";
  const fieldStyle = isDark
    ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
    : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400";

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 transition-colors duration-300 sm:px-6 ${
        isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-colors duration-300 sm:p-8 ${
          isDark
            ? "border-zinc-800 bg-gray-800 shadow-black/20"
            : "border-zinc-200 bg-white shadow-zinc-300/30"
        }`}
      >
        <Link
          to="/"
          className="mx-auto mb-7 block w-fit text-xl font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          Movie<span className="text-orange-500">Hub</span>
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500">
            ↗
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>

          <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
            Sign in to discover movies and manage your watchlist.
          </p>
        </div>

        {/* Email and password login */}
        <form className="space-y-5" onSubmit={handleEmailLogin} noValidate>
          <div>
            <label
              htmlFor="login-email"
              className={`mb-2 block text-sm font-medium ${labelText}`}
            >
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={emailForm.email}
              onChange={handleEmailChange}
              autoComplete="email"
              maxLength={254}
              required
              placeholder="you@example.com"
              className={`${inputClass} ${fieldStyle}`}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="login-password"
                className={`text-sm font-medium ${labelText}`}
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-medium text-orange-500 transition-colors hover:text-orange-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={emailForm.password}
                onChange={handleEmailChange}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className={`${inputClass} pr-20 ${fieldStyle}`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={`absolute inset-y-0 right-3 my-auto h-fit rounded-md px-2 py-1 text-xs font-medium transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  mutedText
                }`}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-500"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && activeAction === "email" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                Login
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3">
          <div className={`h-px flex-1 ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
          <span className={`text-xs font-medium ${mutedText}`}>
            OR CONTINUE WITH PHONE
          </span>
          <div className={`h-px flex-1 ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
        </div>

        {/* Phone OTP login */}
        <form className="space-y-4" onSubmit={handleVerifyPhoneOtp} noValidate>
          <div>
            <label
              htmlFor="login-phone"
              className={`mb-2 block text-sm font-medium ${labelText}`}
            >
              Phone number
            </label>

            <input
              id="login-phone"
              type="tel"
              name="phone"
              value={phoneForm.phone}
              onChange={handlePhoneChange}
              autoComplete="tel"
              inputMode="tel"
              maxLength={16}
              required
              placeholder="+91XXXXXXXXXX"
              readOnly={otpSent}
              className={`${inputClass} ${fieldStyle} ${
                otpSent ? "cursor-not-allowed opacity-70" : ""
              }`}
            />
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={loading}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:border-orange-500 hover:text-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                isDark
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-300 bg-zinc-50"
              }`}
            >
              {loading && activeAction === "request-otp"
                ? "Sending OTP..."
                : "Request OTP"}
            </button>
          ) : (
            <>
              <div>
                <label
                  htmlFor="login-otp"
                  className={`mb-2 block text-sm font-medium ${labelText}`}
                >
                  6-digit OTP
                </label>

                <input
                  id="login-otp"
                  type="text"
                  name="otp"
                  value={phoneForm.otp}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setPhoneForm((previous) => ({
                      ...previous,
                      otp: value,
                    }));
                    setError("");
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="Enter OTP"
                  className={`${inputClass} ${fieldStyle} tracking-[0.3em]`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || phoneForm.otp.length !== 6}
                className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && activeAction === "verify-otp"
                  ? "Verifying..."
                  : "Verify OTP & Login"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtpSent(false);
                  setPhoneForm((previous) => ({ ...previous, otp: "" }));
                  setError("");
                  setSuccess("");
                }}
                className={`w-full py-2 text-sm font-medium transition-colors hover:text-orange-500 disabled:opacity-50 ${mutedText}`}
              >
                Change phone number
              </button>
            </>
          )}
        </form>

        <p className={`mt-7 text-center text-sm ${mutedText}`}>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-orange-500 transition-colors hover:text-orange-400 hover:underline"
          >
            Create Account
          </Link>
        </p>

        <p
          className={`mt-6 border-t pt-5 text-center text-xs ${
            isDark
              ? "border-zinc-700 text-zinc-500"
              : "border-zinc-200 text-zinc-500"
          }`}
        >
          Your account, your watchlist, your next favorite movie.
        </p>
      </div>
    </main>
  );
}

export default Login;
