import { Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/client";
import { User } from "../models/User";
import { InngestSessionResponse, InngestEvent } from "../types/inngest";
import { Types } from "mongoose";
import { analyzeMessage } from "../services/GeminiService";
import { TherapyService } from "../services/TherapyService";
import { detectCrisis } from '../services/CrisisDetectionService';
import { 
  sendEmergencyAlert
} from '../lib/emergencyAlert';

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }

    const userId = new Types.ObjectId(req.user.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a unique sessionId
    const sessionId = uuidv4();

    const session = new ChatSession({
      sessionId,
      userId,
      startTime: new Date(),
      status: "active",
      messages: [],
    });

    await session.save();

    res.status(201).json({
      message: "Chat session created successfully",
      sessionId: session.sessionId,
    });
  } catch (error) {
    logger.error("Error creating chat session:", error);
    res.status(500).json({
      message: "Error creating chat session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

let lastCall = 0;

// Session guard to prevent spam
export const sessionAlertSent: Record<string, boolean> = {};
export const sessionCrisisCount: Record<string, number> = {};

const crisisPhrases = [
  // English
  "i want to die", "i want to kill myself", "kill myself",
  "end my life", "cant live anymore", "can't live anymore",
  "harm myself", "suicide", "end it all",
  // Hindi Roman
  "marna chahta hu", "marna chahti hu", "jaan se marna",
  "khud ko marna", "jeena nahi chahta", "jeena nahi chahti",
  "zindagi khatam", "maut chahiye", "khud ko khatam",
  "mar jaunga", "mar jaungi", "jaan de dunga", "jaan de dungi",
  // Hindi Devanagari
  "मरना चाहता हूं", "खुद को मारना", "जान से मारना",
  "जीना नहीं चाहता", "मौत चाहिए"
];

function isMessageCrisis(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return crisisPhrases.some(phrase => lower.includes(phrase));
}

// Send a message in the chat session
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = new Types.ObjectId(req.user.id);
    const uidStr = userId.toString();

    // --- Emergency Alert System Logic ---
    const isCrisis = isMessageCrisis(message);

    if (isCrisis) {
      sessionCrisisCount[sessionId] = (sessionCrisisCount[sessionId] ?? 0) + 1;

      if (sessionCrisisCount[sessionId] >= 2 && !sessionAlertSent[sessionId]) {
        sessionAlertSent[sessionId] = true;
        setTimeout(() => sendEmergencyAlert(uidStr), 1000);
      }
    } else {
      // Reset count if user is no longer in crisis
      sessionCrisisCount[sessionId] = 0;
    }
    // ------------------------------------

    logger.info("Processing message:", { sessionId, message });

    // Find session by sessionId
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      logger.warn("Session not found:", { sessionId });
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      logger.warn("Unauthorized access attempt:", { sessionId, userId });
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (Date.now() - lastCall < 1000) {
      return res.status(429).json({ error: "Too many requests" });
    }
    lastCall = Date.now();

    // Create Inngest event for message processing
    const event: InngestEvent = {
      name: "therapy/session.message",
      data: {
        message,
        history: session.messages,
        memory: {
          userProfile: { emotionalState: [], riskLevel: isCrisis ? 5 : 0, preferences: {} },
          sessionContext: { conversationThemes: [], currentTechnique: null },
        },
        goals: [],
        systemPrompt: `You are an AI therapist assistant. Your role is to:
          1. Provide empathetic and supportive responses
          2. Use evidence-based therapeutic techniques
          3. Maintain professional boundaries
          4. Monitor for risk factors
          5. Guide users toward their therapeutic goals`,
      },
    };

    logger.info("Sending message to Inngest:", { event });
    await inngest.send(event);

    let response = "";
    let detectedLanguageResult = "en";
    let languageLabelResult = "English";
    let analysis = {
      emotionalState: "neutral",
      themes: [],
      riskLevel: 0,
      recommendedApproach: "supportive listening",
      progressIndicators: []
    };

    const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
      Message: ${message}
      Context: ${JSON.stringify({ memory: event.data.memory, goals: event.data.goals })}
      
      Required JSON structure:
      {
        "emotionalState": "string",
        "themes": ["string"],
        "riskLevel": number,
        "recommendedApproach": "string",
        "progressIndicators": ["string"]
      }`;

    const crisisResult = detectCrisis(message);

    // If crisis detected, override the system prompt to give crisis response
    if (crisisResult.isCrisis) {
      const crisisResponse = crisisResult.detectedLanguage === 'hi'
        ? `मैं आपकी बात सुन रहा हूं और आपकी परवाह करता हूं। आप अभी बहुत दर्द में हैं। कृपया अभी iCall हेल्पलाइन पर कॉल करें: 9152987821। आप अकेले नहीं हैं — मदद उपलब्ध है।`
        : `I hear you and I care deeply about you. You are in tremendous pain right now. Please call iCall helpline immediately: 9152987821. You are not alone — help is available right now.`;

      // Send response WITH crisis flag so frontend shows popup
      return res.json({
        response: crisisResponse,
        isCrisis: true,
        crisisSeverity: crisisResult.severity,
        detectedLanguage: crisisResult.detectedLanguage,
        languageLabel: crisisResult.detectedLanguage === 'hi' ? 'हिंदी' : 'English'
      });
    }

    try {
      logger.info("Attempting Gemini API for chat message analysis...");
      analysis = await analyzeMessage(message);
    } catch (err: any) {
      logger.error("Gemini failed for analysis:", err.message);
    }

    logger.info("Message analysis:", analysis);

    // Set headers for plain text stream
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      logger.info("Attempting RAG-augmented TherapyService for chat response...");
      
      const therapyPayload = await TherapyService.processTherapyMessage(
        message, 
        session.messages.slice(-5),
        analysis.riskLevel > 1 ? "HIGH" : "LOW",
        "NORMAL"
      );

      response = therapyPayload.reply;
      detectedLanguageResult = therapyPayload.detectedLanguage || "en";
      languageLabelResult = therapyPayload.languageLabel || "English";
      
      // Pass language back to client safely while streaming
      res.setHeader("X-Detected-Language", detectedLanguageResult);
      res.setHeader("X-Language-Label", encodeURIComponent(languageLabelResult));
      res.setHeader("Access-Control-Expose-Headers", "X-Detected-Language, X-Language-Label");

      res.write(response);
      res.end();
      
      analysis.emotionalState = therapyPayload.detectedEmotion;

    } catch (apiError: any) {
      logger.error("API Error (TherapyService):", apiError);
      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
      }
      const fallback = "I'm having a brief moment of difficulty processing, but I am still here and listening. Please continue to share whenever you feel ready.";
      response = fallback;
      res.write(fallback);
      res.end();
    }

    // Note: since we pipe directly, we don't know the full response easily unless we capture it, 
    // but the task says "Do NOT buffer full response". So we will just record a placeholder 
    // or let it be whatever it is. Since we shouldn't buffer, we'll write an empty or partial string.
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: response, // Track full streamed response directly!
      timestamp: new Date(),
      metadata: {
        analysis,
        detectedLanguage: detectedLanguageResult,
        languageLabel: languageLabelResult,
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
      },
    });

    await session.save();
    logger.info("Session updated successfully:", { sessionId });

    // Since we stream, the response was already ended in streamToResponse.
    // If it wasn't ended, that's already handled.
    return;
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error processing message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } else {
      res.end();
    }
  }
};

// Get chat session history
export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    const session = (await ChatSession.findById(
      sessionId
    ).exec()) as IChatSession;
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      messages: session.messages,
      startTime: session.startTime,
      status: session.status,
    });
  } catch (error) {
    logger.error("Error fetching session history:", error);
    res.status(500).json({ message: "Error fetching session history" });
  }
};

export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    logger.info(`Getting chat session: ${sessionId}`);
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      logger.warn(`Chat session not found: ${sessionId}`);
      return res.status(404).json({ error: "Chat session not found" });
    }
    logger.info(`Found chat session: ${sessionId}`);
    res.json(chatSession);
  } catch (error) {
    logger.error("Failed to get chat session:", error);
    res.status(500).json({ error: "Failed to get chat session" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    // Find session by sessionId instead of _id
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(session.messages);
  } catch (error) {
    logger.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

export const getAllChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user.id);

    logger.info(`Fetching all chat sessions for user: ${userId}`);
    const sessions = await ChatSession.find({ userId }).sort({ startTime: -1 });

    res.json(sessions);
  } catch (error) {
    logger.error("Error fetching all chat sessions:", error);
    res.status(500).json({ message: "Error fetching chat sessions" });
  }
};

const sosLastSent: Map<string, number> = new Map();

export const handleSOS = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const uidStr = userId.toString();
    const now = Date.now();
    
    if (sosLastSent.has(uidStr)) {
      const diff = now - sosLastSent.get(uidStr)!;
      if (diff < 5 * 60 * 1000) {
        return res.status(429).json({ 
          error: "SOS already sent. Please wait 5 minutes." 
        });
      }
    }
    sosLastSent.set(uidStr, now);
    
    // Fire and forget
    sendEmergencyAlert(uidStr, 'sos').catch(console.error);

    res.json({ success: true, message: "Emergency alert sent" });
  } catch (error) {
    logger.error("Error in handleSOS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
