import { User } from "../models/User";
import { logger } from "../utils/logger";
import { Types } from "mongoose";

const crisisKeywords = [
  'want to die', 'kill myself', 'end my life', 'suicide', 'suicidal',
  'no reason to live', 'better off dead', 'can\'t go on', 'don\'t want to exist',
  'hurt myself', 'self harm', 'cutting myself', 'overdose',
  'goodbye forever', 'no one would miss me', 'world without me',
  'ending it all', 'not worth living', 'i give up on life'
];

export function isCrisisMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return crisisKeywords.some(keyword => lower.includes(keyword));
}

// In-memory counters for consecutive crisis messages
export const sessionCrisisCount: Record<string, number> = {};
// Key: userId, Value: count of consecutive crisis messages

export async function getEmergencyContact(userId: string): Promise<string | null> {
  try {
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) return null;
    
    return user.emergencyContact?.phone || null;
  } catch (error) {
    logger.error(`[Emergency Alert] Error fetching user ${userId}`, error);
    return null;
  }
}

export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Remove leading 91 (India country code) if present and number is 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

import { sendSMS } from "./twilio";

export const sendEmergencyAlert = async (userId: string, triggerType: 'auto' | 'sos' = 'auto') => {
  try {
    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
      console.error(`❌ [Emergency Alert] User not found: ${userId}`);
      return;
    }

    if (!user.emergencyContact?.phone) {
      console.warn(`⚠️ [Emergency Alert] No emergency contact found for user: ${userId}`);
      return;
    }

    const phone = normalizePhone(user.emergencyContact.phone);
    if (!phone) {
      console.warn(`⚠️ [Emergency Alert] Normalized emergency contact is empty for user: ${userId}`);
      return;
    }

    const message = triggerType === 'sos'
      ? `🆘 URGENT: ${user.name} has manually triggered an SOS alert.\nThey need immediate help. Please contact them right away.`
      : `🚨 EMERGENCY ALERT 🚨\n${user.name} may be in emotional distress.\nPlease check on them immediately.`;

    // Fire-and-forget but caught
    try {
      const response = await sendSMS(phone, message);
      console.log(`🚨 [Emergency Alert] Triggered for user: ${userId}, Twilio SID: ${response?.sid}`);
    } catch (smsError: any) {
      console.error(`❌ [Emergency Alert] Twilio SMS failed for user ${userId}:`, smsError.message);
    }
  } catch (err: any) {
    console.error("❌ [Emergency Alert] Fatal error:", err.message);
  }
};
