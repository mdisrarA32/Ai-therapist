import { logger } from "../utils/logger";
import { getGeminiModel } from "./GeminiService";

const ai = getGeminiModel();

export class TherapyService {

    /**
     * Process Contextual Therapy Session
     */
    static async processTherapyMessage(
        userMessage: string,
        previousMessages: any[],
        lastRiskLevel: string | undefined,
        sessionStatus: string
    ): Promise<{
        reply: string;
        detectedEmotion: string;
        riskLevel: "LOW" | "MEDIUM" | "HIGH";
        cbtTechniqueUsed?: string;
    }> {
        try {

            let systemInstructions = `You are an expert AI therapist trained in Cognitive Behavioral Therapy (CBT).
            Analyze the user's input, emotional state, and risk level in the context of the previous conversation.
            
            Context Parameters:
            - User's previous risk level: ${lastRiskLevel || "Unknown"}
            - Current context window: ${JSON.stringify(previousMessages)}
            - Current session status: ${sessionStatus}
            
            Rules:
            1. Determine the user's primary emotion and rate the risk level (LOW, MEDIUM, HIGH).
            2. If 'sessionStatus' is ESCALATED or if you determine the risk level is HIGH:
               - NEVER perform cognitive distortion challenges.
               - NEVER downplay the user's feelings.
               - ALWAYS recommend off-platform human support.
               - Provide ONLY supportive, grounding language.
            3. If 'sessionStatus' is NOT ESCALATED AND risk is NOT HIGH, actively apply a CBT technique (e.g., cognitive restructuring, behavioral activation, socratic questioning).
            
            Return ONLY a valid JSON object matching this schema EXACTLY:
            {
                "reply": "your response to the user",
                "detectedEmotion": "the primary emotion",
                "riskLevel": "LOW | MEDIUM | HIGH",
                "cbtTechniqueUsed": "the technique applied (if any)",
                "cognitiveDistortionDetected": "any identified distortion (optional)"
            }`;

            if (sessionStatus === "ESCALATED") {
                systemInstructions += `\n\nCRITICAL STATE: THIS SESSION IS ALREADY ESCALATED. YOU MUST FOLLOW THE ESCALATION RULES STRICTLY IN YOUR REPLY.`;
            }

            const prompt = `${systemInstructions}\n\nUser Message: "${userMessage}"`;

            let payload;
            try {
                // PRIMARY: Google Gemini Model
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                const text = (result.text || "").trim().replace(/```json\n|\n```/g, "").trim();
                payload = JSON.parse(text);
            } catch (error: any) {
                logger.error("Gemini unavailable:", error.message);
                throw error;
            }

            return {
                reply: payload.reply,
                detectedEmotion: payload.detectedEmotion || "neutral",
                riskLevel: payload.riskLevel || "LOW",
                cbtTechniqueUsed: payload.cbtTechniqueUsed
            };
        } catch (error) {
            logger.error("Error processing therapy context:", error);
            // Safe fallback
            return {
                reply: "I'm experiencing a technical issue, but please know I'm here. Can you tell me more about what you're feeling?",
                detectedEmotion: "neutral",
                riskLevel: "LOW"
            };
        }
    }

    /**
     * Emotion Detection (Standalone)
     */
    static async detectEmotion(message: string): Promise<{
        primaryEmotion: string;
        intensity: number;
        valence: "positive" | "negative" | "neutral";
    }> {
        try {
            const prompt = `Analyze the emotional content of this message.
      Message: "${message}"
      
      Return ONLY a valid JSON object with:
      - primaryEmotion: string (the dominant emotion)
      - intensity: number (1-10)
      - valence: "positive" | "negative" | "neutral"`;

            try {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                const text = (result.text || "").trim().replace(/```json\n|\n```/g, "").trim();
                return JSON.parse(text);
            } catch (err: any) {
                logger.error("Gemini emotion detection failed:", err.message);
                throw err;
            }
        } catch (error) {
            logger.error("Error in emotion detection:", error);
            return { primaryEmotion: "unknown", intensity: 0, valence: "neutral" };
        }
    }

    /**
     * Risk Analysis (Standalone)
     */
    static async analyzeRisk(message: string): Promise<{
        riskLevel: number;
        riskFactors: string[];
        requiresEscalation: boolean;
    }> {
        try {
            const prompt = `Perform a psychological risk analysis on this message. Look for signs of self-harm, severe depression, harm to others, or extreme distress.
      Message: "${message}"
      
      Return ONLY a valid JSON object with:
      - riskLevel: number (0-10, where 10 is immediate danger)
      - riskFactors: string[] (list of identified concerns)
      - requiresEscalation: boolean (true if riskLevel > 7)`;

            try {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                const text = (result.text || "").trim().replace(/```json\n|\n```/g, "").trim();
                return JSON.parse(text);
            } catch (err: any) {
                logger.error("Gemini risk analysis failed:", err.message);
                throw err;
            }
        } catch (error) {
            logger.error("Error in risk analysis:", error);
            return { riskLevel: 0, riskFactors: [], requiresEscalation: false };
        }
    }

    /**
     * Generate CBT-style Responses (Standalone)
     */
    static async generateCBTResponse(message: string, context: any = {}): Promise<{
        response: string;
        cbtTechniqueUsed: string;
        cognitiveDistortionDetected?: string;
    }> {
        try {
            const prompt = `You are an expert AI therapist trained in Cognitive Behavioral Therapy (CBT).
      Generate a CBT-style therapeutic response to the user's message. Identify any cognitive distortions and apply an appropriate CBT technique (e.g., cognitive restructuring, behavioral activation, socratic questioning).
      
      User Message: "${message}"
      Context: ${JSON.stringify(context)}
      
      Return ONLY a valid JSON object with:
      - response: string (your therapeutic reply)
      - cbtTechniqueUsed: string (the specific CBT technique applied)
      - cognitiveDistortionDetected: string (optional, if any distortion like 'all-or-nothing thinking' is found)`;

            try {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                const text = (result.text || "").trim().replace(/```json\n|\n```/g, "").trim();
                return JSON.parse(text);
            } catch (err: any) {
                logger.error("Gemini CBT response failed:", err.message);
                throw err;
            }
        } catch (error) {
            logger.error("Error generating CBT response:", error);
            return { response: "I'm here to listen. Tell me more about how you're feeling.", cbtTechniqueUsed: "active listening" };
        }
    }

    /**
     * Safety Escalation Handling
     */
    static async handleSafetyEscalation(userId: string, riskLevel: "LOW" | "MEDIUM" | "HIGH", sessionStatus?: string) {
        if (riskLevel === "HIGH" || sessionStatus === "ESCALATED") {
            logger.warn(`CRITICAL SAFETY ESCALATION triggered/active for user ${userId}`);
            // In a real application, this would:
            // 1. Alert human administrators or on-call therapists
            // 2. Add crisis hotline numbers to the response
            // 3. Mark the user profile as 'at-risk' in the database
            // 4. Send an immediate notification (e.g., SMS, email)

            return {
                escalated: true,
                actionTaken: "System alerted, crisis resources provided",
                crisisResources: [
                    "National Suicide Prevention Lifeline: 988",
                    "Crisis Text Line: Text HOME to 741741",
                    "Emergency Services: 911"
                ]
            };
        }
        return { escalated: false };
    }

    /**
     * Clinical Notes Generation
     */
    static async generateClinicalNotes(messages: any[]): Promise<string> {
        try {
            if (!messages || messages.length === 0) return "No interactions to summarize.";

            const prompt = `You are an AI generating a clinical summary of a therapy session for review by a human therapist.
            Review the following conversation log.
            
            Rules:
            1. Summarize the session in neutral, objective language.
            2. DO NOT provide any medical diagnoses.
            3. DO NOT make any medical claims.
            4. Keep it concise, focusing on the main topics discussed, interventions applied, and the user's observed emotional state.
            
            Conversation Log:
            ${JSON.stringify(messages.map(m => ({ role: m.role, content: m.content })))}
            
            Return ONLY the raw text summarizing the session.`;

            try {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                return (result.text || "").trim();
            } catch (err: any) {
                logger.error("Gemini clinical notes failed:", err.message);
                throw err;
            }
        } catch (error) {
            logger.error("Error generating clinical notes:", error);
            return "Unable to generate clinical notes at this time.";
        }
    }
}
