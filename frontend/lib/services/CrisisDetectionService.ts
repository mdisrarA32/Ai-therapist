export const CRISIS_KEYWORDS = {
  english: [
    'kill my self', 'kill myself', 'want to die', 'suicide', 'suicidal',
    'end my life', 'end it all', 'end my pain', 'end the pain',
    'hurt myself', 'hurt my self', 'harm myself', 'harm my self',
    'no reason to live', 'no point living', 'no point in living',
    'not worth living', 'life is not worth', 'life isnt worth',
    'better off dead', 'better off without me', 'world is better without me',
    'everyone would be better without me', 'nobody would miss me',
    'cant go on', "can't go on", 'cannot go on', 'cant do this anymore',
    "can't do this anymore", 'cannot take this anymore', 'cant take it anymore',
    "can't take it anymore", 'i give up', 'giving up on life',
    'give up on life', 'given up on life', 'dont want to be here',
    "don't want to be here", 'dont want to exist', "don't want to exist",
    'wish i was dead', 'wish i were dead', 'want to be dead',
    'rather be dead', 'want it to stop', 'make it stop',
    'disappear forever', 'disappear from this world', 'just disappear',
    'never wake up', 'not wake up', 'dont wake up', "don't wake up",
    'overdose', 'take pills', 'take all the pills', 'swallow pills',
    'hang myself', 'hanging myself', 'hang my self',
    'jump off', 'jump from', 'jump off a bridge', 'jump off building',
    'slit my wrist', 'slit my wrists', 'cut my wrist', 'cut my wrists',
    'cut myself', 'cut my self', 'self harm', 'self-harm', 'self mutilate',
    'shoot myself', 'shoot my self', 'gun to my head',
    'drown myself', 'drowning myself', 'poison myself',
    'starve myself', 'stop eating',
  ],
  hindi: [
    'आत्महत्या', 'खुद को मार', 'मर जाना', 'मर जाऊं', 'मर जाऊंगा', 'मर जाऊंगी',
    'मरना चाहता', 'मरना चाहती', 'मरना चाहता हूं', 'मरना चाहती हूं',
    'जीना नहीं', 'जीना नहीं चाहता', 'जीना नहीं चाहती',
    'जिंदगी खत्म', 'जिंदगी खत्म करना', 'जिंदगी से थक गया', 'जिंदगी से थक गई',
    'खुद को खत्म', 'खुद को नुकसान', 'खुद को तकलीफ',
    'अपने आप को मार', 'अपने आप को खत्म',
    'जहर खाना', 'जहर पीना', 'नस काट', 'नसें काटना',
    'छत से कूद', 'पुल से कूद', 'गला घोंट',
    'कोई नहीं मेरा', 'कोई नहीं समझता', 'कोई केयर नहीं करता',
    'मैं बेकार हूं', 'मैं बोझ हूं', 'सब पर बोझ हूं',
    'बहुत थक गया हूं', 'बहुत थक गई हूं', 'अब नहीं जी सकता', 'अब नहीं जी सकती',
    'हार गया हूं', 'हार गई हूं', 'टूट गया हूं', 'टूट गई हूं',
    'अंदर से खाली हूं', 'अंदर से मर गया हूं',
    'अलविदा', 'अंतिम बात', 'यह मेरी आखिरी बात',
    'दर्द बर्दाश्त नहीं होता', 'दर्द सहना मुश्किल है',
    'जीवन समाप्त', 'जीवन व्यर्थ है', 'जीने का मन नहीं',
    'सब छोड़ के जाना चाहता', 'सब छोड़ के जाना चाहती',
    'इस दुनिया से जाना चाहता', 'इस दुनिया से जाना चाहती',
  ],
  hinglish: [
    'mar jaunga', 'mar jaaunga', 'mar jaungi', 'mar jaaoungi',
    'khud ko maar', 'mujhe khud ko maar', 'apne aap ko maar',
    'khud ko khatam', 'apne aap ko khatam', 'khud ko khatam karna',
    'suicide karna', 'suicide kar lunga', 'suicide kar lungi',
    'suicide karne ka soch raha', 'suicide ki soch rahi',
    'jina nahi', 'jeena nahi', 'jina nahi chahta', 'jeena nahi chahti',
    'marna chahta', 'marna chahti', 'marna chahta hoon', 'marna chahti hoon',
    'mar jana chahta', 'mar jana chahti',
    'zindagi khatam', 'zindagi khatam karna', 'zindagi se thak gaya',
    'zindagi se thak gayi', 'zindagi nahi chahiye', 'zindagi bekar hai',
    'mar jau', 'mar jao', 'khatam kar lu', 'khatam kar loon',
    'khatam kar lunga', 'khatam kar lungi', 'khud ko dalna',
    'khud ko hurt karna', 'khud ko nuksaan', 'apne aap ko nuksaan',
    'neend nahi aati aur marna chahta', 'rona aa raha hai aur marna',
    'iss duniya se jaana chahta', 'iss duniya se jaana chahti',
    'sab chod ke jaana chahta', 'sab chhod ke jana chahti',
    'koi nahi hai mera', 'koi care nahi karta', 'koi nahi samjhega',
    'akela hoon aur marna chahta', 'akeli hoon aur marna chahti',
  ]
};

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high';
  matchedKeywords: string[];
  detectedLanguage: string;
}

export function detectCrisis(message: string): CrisisDetectionResult {
  // Normalize whitespace so "kill my self" matches "kill myself" and vice-versa
  const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
  const lowerMessage = message.toLowerCase();
  const matchedKeywords: string[] = [];

  // Check English and Hinglish keywords against the normalized message
  [...CRISIS_KEYWORDS.english, ...CRISIS_KEYWORDS.hinglish].forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalizedMessage.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    }
  });

  // Hindi — check original message (Unicode, no space-normalization needed)
  CRISIS_KEYWORDS.hindi.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase()) || message.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  });

  const isCrisis = matchedKeywords.length > 0;

  // Determine severity
  const highSeverityWords = ['suicide', 'kill myself', 'आत्महत्या', 'खुद को मार', 'end my life', 'mar jaunga'];
  const isHighSeverity = matchedKeywords.some(k =>
    highSeverityWords.some(h => k.toLowerCase().includes(h.toLowerCase()))
  );

  return {
    isCrisis,
    severity: isHighSeverity ? 'high' : matchedKeywords.length > 1 ? 'medium' : 'low',
    matchedKeywords,
    detectedLanguage: message.match(/[\u0900-\u097F]/) ? 'hi' : 'en'
  };
}
