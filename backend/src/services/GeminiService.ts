import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export const getGeminiModel = () => {
  return ai;
};

export const analyzeMessage = async (message: string) => {
  try {
    const model = getGeminiModel();

    const prompt = `
    Analyze the following message and return JSON:
    {
      emotionalState: string,
      riskLevel: number (0-3),
      recommendedApproach: string,
      themes: string[]
    }

    Message: "${message}"
    `;

    const result = await model.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const raw = result.text || "";
    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    return {
      emotionalState: "neutral",
      riskLevel: 0,
      recommendedApproach: "supportive listening",
      themes: []
    };
  }
};
