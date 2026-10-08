const WAPIX_BASE_URL =
  process.env.WAPIX_API_URL || "https://api.wapix.sbs/api/v1";

export const sendWhatsAppOtp = async ({
  phone,
  otp,
}) => {
  const response = await fetch(`${WAPIX_BASE_URL}/send/otp`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      service: "otp",
      whatsaap_number: phone,
      otp,
      text: "Your verification code is:",
      api_key: process.env.WAPIX_API_KEY,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Failed to send WhatsApp OTP"
    );
  }

  return data;
};