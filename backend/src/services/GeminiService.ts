import Groq from 'groq-sdk';

export const analyzeMessage = async (message: string) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

    const prompt = `
    Analyze the following message and return JSON:
    {
      "emotionalState": "string",
      "riskLevel": 0,
      "recommendedApproach": "string",
      "themes": ["string"]
    }

    Message: "${message}"
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 512,
      temperature: 0.1
    });

    const raw = completion.choices[0]?.message?.content || "";
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
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

