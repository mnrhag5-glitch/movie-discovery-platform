
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://movie-discovery-platform-30u4.onrender.com"
).replace(/\/$/, "");

// Common helper for all backend requests
async function request(
  endpoint,
  { method = "GET", body, token, headers = {} } = {}
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        response.ok
          ? "Server returned an invalid response."
          : "Server request failed. Please try again."
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong.");
  }

  return data;
}

// Signup, login, phone verification and password reset
export const authApi = {
  signup: (payload) =>
    request("/auth/signup", {
      method: "POST",
      body: payload,
    }),

  sendSignupOtp: (phone) =>
    request("/auth/send-signup-otp", {
      method: "POST",
      body: { phone },
    }),

  verifyPhone: ({ phone, otp }) =>
    request("/auth/verify-phone", {
      method: "POST",
      body: { phone, otp },
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: payload,
    }),

  requestLoginOtp: (phone) =>
    request("/auth/request-login-otp", {
      method: "POST",
      body: { phone },
    }),

  verifyLoginOtp: ({ phone, otp }) =>
    request("/auth/verify-login-otp", {
      method: "POST",
      body: { phone, otp },
    }),

  requestPasswordReset: (phone) =>
    request("/auth/request-password-reset", {
      method: "POST",
      body: { phone },
    }),

  verifyPasswordReset: ({ phone, otp }) =>
    request("/auth/verify-password-reset", {
      method: "POST",
      body: { phone, otp },
    }),

  resetPassword: ({ phone, resetToken, newPassword }) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { phone, resetToken, newPassword },
    }),
};

// IMDb movie discovery and cursor-based search
export const movieApi = {
  getPopularMovies: () => request("/movies/popular"),

  searchMovies: (query, rows = 12, cursorMark) => {
    const params = new URLSearchParams({
      q: query,
      rows: String(rows),
    });

    if (cursorMark) {
      params.set("cursorMark", cursorMark);
    }

    return request(`/movies/search?${params.toString()}`);
  },
};

// User-specific saved movies
export const savedMovieApi = {
  getSavedMovies: (token) =>
    request("/saved-movies", { token }),

  saveMovie: (payload, token) =>
    request("/saved-movies", {
      method: "POST",
      body: payload,
      token,
    }),

  deleteSavedMovie: (externalMovieId, token) =>
    request(`/saved-movies/${encodeURIComponent(externalMovieId)}`, {
      method: "DELETE",
      token,
    }),
};
