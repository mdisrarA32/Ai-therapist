// using native fetch which is available in Node 18+
import { sendSMS } from "../lib/twilio";

interface EmergencyContact {
  name: string;
  phone: string; // Indian mobile number
}

export async function sendEmergencyAlert(
  emergencyContact: EmergencyContact,
  userName: string,
  detectedLanguage: string
): Promise<boolean> {
  
  const message = detectedLanguage === 'hi'
    ? `AURA 3.0 ALERT: ${userName} को मानसिक स्वास्थ्य संकट का सामना करना पड़ रहा है। कृपया तुरंत उनसे संपर्क करें। ASHA helpline: 0172-2660078`
    : `AURA 3.0 ALERT: ${userName} may be experiencing a mental health crisis. Please contact them immediately. ASHA helpline: 0172-2660078`;

  try {
    const result = await sendSMS(emergencyContact.phone, message);
    console.log('Emergency SMS result SID:', result.sid);
    return true;
  } catch (error) {
    console.error('Emergency SMS failed:', error);
    return false;
  }
}
