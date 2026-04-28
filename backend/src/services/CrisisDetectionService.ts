export const CRISIS_KEYWORDS = {
  english: [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'self harm', 'self-harm', 'hurt myself', 'cut myself', 'no reason to live',
    'better off dead', 'cant go on', "can't go on", 'give up on life',
    'overdose', 'hang myself', 'jump off', 'slit my wrist', 'worthless',
    'nobody cares', 'disappear forever', 'end it all', 'not worth living'
  ],
  hindi: [
    'आत्महत्या', 'खुद को मार', 'मर जाना', 'मरना चाहता', 'मरना चाहती',
    'जीना नहीं', 'जिंदगी खत्म', 'खुद को खत्म', 'मर जाऊं', 'मर जाऊंगा',
    'मर जाऊंगी', 'जीवन समाप्त', 'सब खत्म', 'खुद को नुकसान',
    'जहर खाना', 'छत से कूद', 'नस काट', 'गला घोंट'
  ],
  hinglish: [
    'mar jaunga', 'mar jaaunga', 'khud ko maar', 'suicide karna',
    'jina nahi', 'marna chahta', 'marna chahti', 'zindagi khatam',
    'khud ko khatam', 'mar jau', 'khatam kar lu', 'khatam kar loon'
  ]
};

export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high';
  matchedKeywords: string[];
  detectedLanguage: string;
}

export function detectCrisis(message: string): CrisisDetectionResult {
  const lowerMessage = message.toLowerCase();
  const matchedKeywords: string[] = [];

  // Check all keyword categories
  [...CRISIS_KEYWORDS.english, ...CRISIS_KEYWORDS.hinglish].forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  });

  CRISIS_KEYWORDS.hindi.forEach(keyword => {
    if (message.includes(keyword)) {
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
