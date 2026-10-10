
const WAPIX_BASE_URL = (
  process.env.WAPIX_API_URL ||
  "https://api.wapix.sbs/api/v1"
).replace(/\/+$/, "");

export const sendWhatsAppOtp = async ({ phone, otp }) => {
  const apiKey = process.env.WAPIX_API_KEY;

  if (!apiKey) {
    console.error("[Wapix] WAPIX_API_KEY is missing");
    throw new Error("Wapix API key is missing");
  }

  console.info("[Wapix] OTP request started");

  let response;

  try {
    response = await fetch(`${WAPIX_BASE_URL}/send/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "otp",
        whatsaap_number: phone,
        otp,
        text: "Your verification code is:",
        api_key: apiKey,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("[Wapix] Network request failed:", error.message);
    throw new Error("Unable to connect to Wapix. Please try again.");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    console.error("[Wapix] Non-JSON response. HTTP:", response.status);
    throw new Error(
      `Wapix returned an invalid response (HTTP ${response.status})`
    );
  }

  console.info("[Wapix] Response received:", {
    status: response.status,
    success: data?.success === true,
    message:
      typeof data?.message === "string"
        ? data.message
        : undefined,
  });

  if (!response.ok || data?.success !== true) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Wapix OTP request failed (HTTP ${response.status})`
    );
  }

  console.info("[Wapix] OTP request accepted");
  return data;
};
