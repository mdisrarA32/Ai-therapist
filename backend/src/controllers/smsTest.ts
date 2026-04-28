import { Request, Response } from "express";
import { sendSMS } from "../lib/twilio";

export const testSMS = async (req: Request, res: Response) => {
  try {
    const phone = "+91XXXXXXXXXX"; // verified number
    const message = "Test SMS from Aura 3.0";

    await sendSMS(phone, message);

    res.status(200).json({ success: true, message: "SMS sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "SMS failed" });
  }
};
