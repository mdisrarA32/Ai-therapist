export const LANGUAGE_MAP: Record<string, {name: string, speechCode: string, label: string}> = {
  hi: { name: 'Hindi',     speechCode: 'hi-IN', label: 'हिंदी' },
  pa: { name: 'Punjabi',   speechCode: 'pa-IN', label: 'ਪੰਜਾਬੀ' },
  bn: { name: 'Bengali',   speechCode: 'bn-IN', label: 'বাংলা' },
  ta: { name: 'Tamil',     speechCode: 'ta-IN', label: 'தமிழ்' },
  te: { name: 'Telugu',    speechCode: 'te-IN', label: 'తెలుగు' },
  mr: { name: 'Marathi',   speechCode: 'mr-IN', label: 'मराठी' },
  gu: { name: 'Gujarati',  speechCode: 'gu-IN', label: 'ગુજરાતી' },
  kn: { name: 'Kannada',   speechCode: 'kn-IN', label: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', speechCode: 'ml-IN', label: 'മലയാളം' },
  ur: { name: 'Urdu',      speechCode: 'ur-IN', label: 'اردو' },
  en: { name: 'English',   speechCode: 'en-US', label: 'English' },
};

const HINGLISH_KEYWORDS = [
  'mujhe', 'bahut', 'kya', 'nahi', 'hai', 'hoon', 'mere',
  'aur', 'main', 'tum', 'kyun', 'kaise', 'thoda', 'bohot',
  'accha', 'theek', 'zyada', 'dil', 'mann', 'pareshaan',
  'udaas', 'gussa', 'dara', 'akela', 'mushkil', 'takleef'
];

class LanguageService {
  detectLanguage(text: string): string {
    const counts: Record<string, number> = { hi: 0, pa: 0, bn: 0, ta: 0, te: 0, mr: 0, gu: 0, kn: 0, ml: 0, ur: 0 };
    
    for (const char of text) {
      if (char >= '\u0900' && char <= '\u097F') counts['hi']++;
      else if (char >= '\u0A00' && char <= '\u0A7F') counts['pa']++;
      else if (char >= '\u0980' && char <= '\u09FF') counts['bn']++;
      else if (char >= '\u0B80' && char <= '\u0BFF') counts['ta']++;
      else if (char >= '\u0C00' && char <= '\u0C7F') counts['te']++;
      else if (char >= '\u0A80' && char <= '\u0AFF') counts['gu']++;
      else if (char >= '\u0C80' && char <= '\u0CFF') counts['kn']++;
      else if (char >= '\u0D00' && char <= '\u0D7F') counts['ml']++;
      else if (char >= '\u0600' && char <= '\u06FF') counts['ur']++;
    }

    let maxLang = 'en';
    let maxCount = 0;
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxLang = lang;
      }
    }

    if (maxLang === 'en') {
      const lowerText = text.toLowerCase();
      let matchCount = 0;
      for (const word of HINGLISH_KEYWORDS) {
        if (new RegExp(`\\b${word}\\b`).test(lowerText)) {
          matchCount++;
        }
      }
      if (matchCount >= 2) {
        return 'hi';
      }
    }

    return maxLang;
  }

  getLanguageInstruction(langCode: string): string {
    const lang = LANGUAGE_MAP[langCode];
    if (langCode === 'en') {
       return "Respond natively in English.";
    }
    if (langCode === 'hi') {
       return `The user might be writing Hindi in Roman script (Hinglish) or natively. You must respond entirely in Hindi using the Devanagari script (${lang.label}). Use simple, conversational language.`;
    }
    return `You must respond entirely natively in ${lang.name} using its native script (${lang.label}). Use simple, conversational ${lang.name} that is easy to understand.`;
  }
}

export const languageService = new LanguageService();
