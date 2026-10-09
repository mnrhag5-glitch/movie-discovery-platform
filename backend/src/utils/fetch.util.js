import { createAppError } from "./app-error.util.js";

export const fetchWithTimeout = async (
  url,
  options = {},
  timeoutMs = 8000
) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw createAppError(
        "External movie service timed out",
        504
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};