
const WAPIX_BASE_URL = (
  process.env.WAPIX_API_URL ||
  "https://api.wapix.sbs/api/v1"
).replace(/\/+$/, "");

export const sendWhatsAppOtp = async ({ phone, otp }) => {
  const apiKey = process.env.WAPIX_API_KEY;

  if (!apiKey) {
    throw new Error("Wapix API key is missing");
  }

  const response = await fetch(
    `${WAPIX_BASE_URL}/send/otp`,
    {
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
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Wapix returned an invalid response (HTTP ${response.status})`
    );
  }


if (!response.ok || data.success !== true) {
  console.error("Wapix OTP failure:", {
    status: response.status,
    response: data,
  });

  throw new Error(
    data.message ||
      `Wapix OTP request failed (HTTP ${response.status})`
  );
}


  return data;
};
