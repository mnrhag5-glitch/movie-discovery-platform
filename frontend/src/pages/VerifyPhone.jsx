
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

function VerifyPhone() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const fieldStyle = isDark
    ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
    : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400";

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!phone) {
      setError("Phone number is missing. Please sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setActiveAction("verify");

      await authApi.verifyPhone({ phone, otp });

      navigate("/login", {
        replace: true,
        state: {
          message: "Phone verified successfully. Please login.",
        },
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!phone) {
      setError("Phone number is missing. Please sign up again.");
      return;
    }

    try {
      setLoading(true);
      setActiveAction("resend");

      await authApi.sendSignupOtp(phone);

      setOtp("");
      setSuccess("A new OTP has been sent. Check your WhatsApp.");
    } catch (submitError) {
      setError(submitError.message || "Unable to resend OTP. Please try again.");
    } finally {
      setLoading(false);
      setActiveAction("");
    }
  };

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

      <section
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-3xl text-orange-500">
            ✉
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-orange-500">
            ACCOUNT VERIFICATION
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Verify Your Phone
          </h1>

          <p className={`mt-3 text-sm leading-6 ${mutedText}`}>
            Enter the 6-digit OTP sent to your WhatsApp number to activate
            your account.
          </p>

          {phone ? (
            <div
              className={`mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 ${
                isDark
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <span className="text-orange-500" aria-hidden="true">
                ✓
              </span>
              <span className="truncate text-sm font-medium">{phone}</span>
            </div>
          ) : null}
        </div>

        {!phone && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400"
          >
            Your phone number is missing. Please return to signup and try again.
          </div>
        )}

        <form className="space-y-5" onSubmit={handleVerify} noValidate>
          <div>
            <label
              htmlFor="verify-otp"
              className={`mb-2 block text-sm font-medium ${
                isDark ? "text-zinc-200" : "text-zinc-700"
              }`}
            >
              6-digit verification code
            </label>

            <input
              id="verify-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              required
              disabled={!phone || loading}
              placeholder="000000"
              className={`${inputClass} ${fieldStyle} py-4 text-center text-xl tracking-[0.55em] disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <p className={`mt-2 text-xs ${mutedText}`}>
              Enter the code exactly as received.
            </p>
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
            disabled={!phone || loading || otp.length !== 6}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && activeAction === "verify" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying...
              </>
            ) : (
              <>
                Verify Phone
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        <div
          className={`mt-7 border-t pt-6 text-center ${
            isDark ? "border-zinc-700" : "border-zinc-200"
          }`}
        >
          <p className={`text-sm ${mutedText}`}>
            Didn&apos;t receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={!phone || loading}
            className="mt-2 rounded-md px-2 py-1 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && activeAction === "resend"
              ? "Sending OTP..."
              : "Resend OTP"}
          </button>
        </div>

        <p className={`mt-5 text-center text-sm ${mutedText}`}>
          <Link
            to="/signup"
            className="font-medium transition-colors hover:text-orange-500"
          >
            ← Back to signup
          </Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyPhone;
