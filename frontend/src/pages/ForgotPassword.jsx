
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

function ForgotPassword() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState("request");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const mutedText = isDark ? "text-zinc-400" : "text-zinc-600";
  const labelText = isDark ? "text-zinc-200" : "text-zinc-700";

  const fieldStyle = isDark
    ? "border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
    : "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400";

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanedPhone = phone.trim();

    if (!cleanedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);

      await authApi.requestPasswordReset(cleanedPhone);

      setPhone(cleanedPhone);
      setStep("verify");
      setSuccess("If the account is eligible, an OTP will be sent.");
    } catch (submitError) {
      setError(submitError.message || "Unable to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.verifyPasswordReset({
        phone,
        otp,
      });

      if (!response.data?.resetToken) {
        throw new Error("Reset token was not returned. Please try again.");
      }

      setResetToken(response.data.resetToken);
      setOtp("");
      setStep("reset");
      setSuccess("OTP verified. You can now set a new password.");
    } catch (submitError) {
      setError(submitError.message || "Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await authApi.resetPassword({
        phone,
        resetToken,
        newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successful. Please login with your new password.",
        },
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "request", label: "Phone" },
    { id: "verify", label: "Verify OTP" },
    { id: "reset", label: "New password" },
  ];

  const currentStepIndex = steps.findIndex((item) => item.id === step);

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

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-500">
            {step === "request" ? "?" : step === "verify" ? "✉" : "🔒"}
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {step === "request"
              ? "Forgot Password?"
              : step === "verify"
                ? "Verify Your OTP"
                : "Create New Password"}
          </h1>

          <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
            {step === "request"
              ? "Enter your phone number to start recovering your account."
              : step === "verify"
                ? "Enter the 6-digit OTP sent to your phone."
                : "Choose a strong password for your account."}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((item, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={item.id} className="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    isComplete || isCurrent
                      ? "bg-orange-500"
                      : isDark
                        ? "bg-zinc-700"
                        : "bg-zinc-200"
                  }`}
                />

                <span
                  className={`truncate text-center text-[11px] font-medium sm:text-xs ${
                    isCurrent
                      ? "text-orange-500"
                      : isComplete
                        ? mutedText
                        : isDark
                          ? "text-zinc-500"
                          : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-500"
          >
            {success}
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === "request" && (
          <form className="space-y-5" onSubmit={handleRequestOtp} noValidate>
            <div>
              <label
                htmlFor="reset-phone"
                className={`mb-2 block text-sm font-medium ${labelText}`}
              >
                Phone number
              </label>

              <input
                id="reset-phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setError("");
                }}
                autoComplete="tel"
                inputMode="tel"
                maxLength={16}
                required
                placeholder="+91XXXXXXXXXX"
                className={`${inputClass} ${fieldStyle}`}
              />

              <p className={`mt-2 text-xs leading-5 ${mutedText}`}>
                Use the phone number associated with your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-500 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === "verify" && (
          <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
            <div>
              <label
                htmlFor="reset-otp"
                className={`mb-2 block text-sm font-medium ${labelText}`}
              >
                6-digit OTP
              </label>

              <input
                id="reset-otp"
                type="text"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="Enter OTP"
                className={`${inputClass} ${fieldStyle} text-center tracking-[0.4em]`}
              />

              <p className={`mt-2 text-xs ${mutedText}`}>
                Verifying the OTP lets you continue to password reset.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("request");
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className={`w-full py-2 text-sm font-medium transition-colors hover:text-orange-500 disabled:opacity-50 ${mutedText}`}
            >
              Change phone number
            </button>
          </form>
        )}

        {/* Step 3: Reset password */}
        {step === "reset" && (
          <form className="space-y-5" onSubmit={handleResetPassword} noValidate>
            <div>
              <label
                htmlFor="reset-new-password"
                className={`mb-2 block text-sm font-medium ${labelText}`}
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  placeholder="Enter your new password"
                  className={`${inputClass} pr-20 ${fieldStyle}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute inset-y-0 right-3 my-auto h-fit rounded-md px-2 py-1 text-xs font-medium transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${mutedText}`}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className={`mt-2 text-xs ${mutedText}`}>
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className={`mt-7 border-t pt-5 ${isDark ? "border-zinc-700" : "border-zinc-200"}`}>
          <p className={`text-center text-sm ${mutedText}`}>
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-500 transition-colors hover:text-orange-400 hover:underline"
            >
              Login
            </Link>
          </p>

          <p className={`mt-3 text-center text-sm ${mutedText}`}>
            New to MovieHub?{" "}
            <Link
              to="/signup"
              className="font-semibold text-orange-500 transition-colors hover:text-orange-400 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
