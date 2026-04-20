import { Request, Response } from 'express';
import { TherapyService } from '../services/TherapyService';
import { TherapySession } from '../models/TherapySession';
import { logger } from '../utils/logger';

export const analyzeTherapySession = async (req: Request, res: Response) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // --- Fetch or Create Session ---
        let session;
        if (sessionId) {
            session = await TherapySession.findOne({ _id: sessionId, userId });
            if (!session) {
                return res.status(404).json({ error: "Session not found." });
            }
        } else {
            session = new TherapySession({
                userId,
                messages: []
            });
        }

        // --- Extract Context (Last 6 messages) ---
        const lastMessages = session.messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
            emotion: m.detectedEmotion,
            risk: m.riskLevel
        }));

        // Use the new consolidated process that accepts context
        // This generates a unified CBT response based on context and current status
        const therapyResult = await TherapyService.processTherapyMessage(
            message,
            lastMessages,
            session.lastRiskLevel,
            session.sessionStatus
        );

        let risk = therapyResult.riskLevel;
        let emotion = therapyResult.detectedEmotion;

        // --- Add User Message to Session ---
        // Storing the individual user inputs chronologically
        session.messages.push({
            role: "user",
            content: message,
            detectedEmotion: emotion,
            riskLevel: risk,
            timestamp: new Date()
        });

        // --- Safety Escalation & Status ---
        // If risk level becomes HIGH at any time, persist escalation state
        if (risk === "HIGH" && session.sessionStatus !== "ESCALATED") {
            session.sessionStatus = "ESCALATED";
            session.escalationTriggeredAt = new Date();
        }

        // Once escalated, session cannot revert to ACTIVE automatically
        if (session.sessionStatus === "ESCALATED") {
            session.sessionStatus = "ESCALATED";
        }

        session.lastRiskLevel = risk;

        const escalation = await TherapyService.handleSafetyEscalation(userId, risk, session.sessionStatus);

        let reply = therapyResult.reply;
        if (escalation.escalated) {
            reply = `IMPORTANT: Your safety is our priority. Please contact immediate help:\n- ` +
                escalation.crisisResources?.join('\n- ') +
                `\n\nTherapist: ${reply}`;
        }

        // --- Add Assistant Message to Session ---
        // Save the system's generated CBT response to the chronological log
        session.messages.push({
            role: "assistant",
            content: reply,
            cbtTechniqueUsed: therapyResult.cbtTechniqueUsed,
            timestamp: new Date()
        });

        await session.save();

        // --- Return Structured JSON ---
        // Returns required contract: sessionId, reply, emotion, risk, sessionStatus
        // Also returns 'message' and 'response' for frontend backwards compatibility
        return res.status(200).json({
            message: reply,
            response: reply,
            sessionId: session._id,
            reply,
            emotion,
            risk,
            sessionStatus: session.sessionStatus
        });
    } catch (error) {
        logger.error("Error in therapy analysis controller:", error);
        return res.status(500).json({ error: "Server error processing therapy input." });
    }
};

export const getTherapySessions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const sessions = await TherapySession.find({ userId })
            .select('-messages')
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, sessions });
    } catch (error) {
        logger.error("Error fetching therapy sessions:", error);
        return res.status(500).json({ error: "Server error fetching sessions." });
    }
};

export const getTherapySessionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const session = await TherapySession.findOne({ _id: id, userId });

        if (!session) {
            return res.status(404).json({ error: "Session not found." });
        }

        return res.status(200).json({ success: true, session });
    } catch (error) {
        logger.error("Error fetching therapy session:", error);
        return res.status(500).json({ error: "Server error fetching session." });
    }
};

export const getTherapySessionSummary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const session = await TherapySession.findOne({ _id: id, userId });

        if (!session) {
            return res.status(404).json({ error: "Session not found." });
        }

        const userMessages = session.messages.filter(m => m.role === "user");
        const assistantMessages = session.messages.filter(m => m.role === "assistant");

        const totalMessages = session.messages.length;

        // Calculate dominant emotion directly from occurrences structure
        const emotionCounts: Record<string, number> = {};
        let dominantEmotion = "neutral";
        let maxCount = 0;

        const riskProgression: string[] = [];
        const cbtTechniquesUsed: Set<string> = new Set();

        userMessages.forEach(msg => {
            if (msg.detectedEmotion) {
                emotionCounts[msg.detectedEmotion] = (emotionCounts[msg.detectedEmotion] || 0) + 1;
                if (emotionCounts[msg.detectedEmotion] > maxCount) {
                    maxCount = emotionCounts[msg.detectedEmotion];
                    dominantEmotion = msg.detectedEmotion;
                }
            }
            if (msg.riskLevel) {
                riskProgression.push(msg.riskLevel);
            }
        });

        assistantMessages.forEach(msg => {
            if (msg.cbtTechniqueUsed) {
                cbtTechniquesUsed.add(msg.cbtTechniqueUsed);
            }
        });

        // Determine Emotional Trend
        let emotionalTrend = "stable";
        if (riskProgression.length >= 2) {
            const firstRisk = riskProgression[0];
            const lastRisk = riskProgression[riskProgression.length - 1];

            const riskWeight = { "LOW": 1, "MEDIUM": 2, "HIGH": 3 };
            const firstWeight = riskWeight[firstRisk as keyof typeof riskWeight] || 1;
            const lastWeight = riskWeight[lastRisk as keyof typeof riskWeight] || 1;

            if (lastWeight > firstWeight) {
                emotionalTrend = "declining";
            } else if (lastWeight < firstWeight) {
                emotionalTrend = "improving";
            }
        }

        // Generate Clinical Summary Notes
        const clinicalNotes = await TherapyService.generateClinicalNotes(session.messages);

        const summary = {
            totalMessages,
            dominantEmotion,
            riskProgression,
            emotionalTrend,
            cbtTechniquesUsed: Array.from(cbtTechniquesUsed),
            sessionStatus: session.sessionStatus,
            clinicalNotes
        };

        return res.status(200).json({ success: true, summary });
    } catch (error) {
        logger.error("Error fetching therapy session summary:", error);
        return res.status(500).json({ error: "Server error fetching summary." });
    }
};
