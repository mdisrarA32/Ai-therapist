import { Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/client";
import { User } from "../models/User";
import { InngestSessionResponse, InngestEvent } from "../types/inngest";
import { Types } from "mongoose";
import { getGeminiModel, analyzeMessage } from "../services/GeminiService";

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

// Send a message in the chat session
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = new Types.ObjectId(req.user.id);

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
          userProfile: { emotionalState: [], riskLevel: 0, preferences: {} },
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

    const ai = getGeminiModel();

    const prompt = `
You are an empathetic AI therapist.

Rules:
- Be calm, supportive, non-judgmental
- Keep responses short (2-4 sentences)
- Do NOT give medical diagnosis
- Ask one gentle follow-up question

User emotional state: ${analysis.emotionalState}
Risk level: ${analysis.riskLevel}

User message:
"${message}"
`;

    try {
      logger.info("Attempting Gemini API for chat response streaming...");
      const result = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          response += text;
          res.write(text);
        }
      }
      res.end();
    } catch (apiError: any) {
      logger.error("API Error (Gemini):", apiError);
      if (!res.headersSent) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
      }
      try {
        const fallback = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        response = fallback.text || "";
        res.write(response);
        res.end();
      } catch (fallbackError) {
        const fallback = "I'm having a brief moment of difficulty processing, but I am still here and listening. Please continue to share whenever you feel ready.";
        response = fallback;
        res.write(fallback);
        res.end();
      }
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
