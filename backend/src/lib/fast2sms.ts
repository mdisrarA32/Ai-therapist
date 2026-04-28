// DEPRECATED: Fast2SMS is replaced by Twilio. Do not use.
import axios from "axios";

export const sendSMS = async (phone: string, message: string) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q", // transactional route (no DLT)
        message,
        language: "english",
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SMS sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ SMS failed:", error.response?.data || error.message);
    throw error;
  }
};
