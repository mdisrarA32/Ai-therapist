import mongoose, { Document, Schema } from "mongoose";

export interface ITherapyMessage {
    role: "user" | "assistant";
    content: string;
    detectedEmotion?: string;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    cbtTechniqueUsed?: string;
    timestamp: Date;
}

export interface ITherapySession extends Document {
    userId: mongoose.Types.ObjectId;
    messages: ITherapyMessage[];
    sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
    lastRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
    escalationTriggeredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const therapyMessageSchema = new Schema<ITherapyMessage>(
    {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        detectedEmotion: { type: String },
        riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        cbtTechniqueUsed: { type: String },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const therapySessionSchema = new Schema<ITherapySession>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        messages: [therapyMessageSchema],
        sessionStatus: {
            type: String,
            enum: ["ACTIVE", "ESCALATED", "CLOSED"],
            default: "ACTIVE"
        },
        lastRiskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        escalationTriggeredAt: { type: Date },
    },
    { timestamps: true }
);

export const TherapySession = mongoose.model<ITherapySession>(
    "TherapySession",
    therapySessionSchema
);
