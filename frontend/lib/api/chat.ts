import apiClient from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  message: string;
  response?: string;
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
  };
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

export const createChatSession = async (): Promise<string> => {
  try {
    console.log("Creating new chat session...");
    const { data } = await apiClient.post("/chat/sessions");
    console.log("Chat session created:", data);
    return data.sessionId;
  } catch (error: any) {
    console.error("Error creating chat session:", error);
    throw new Error(error.response?.data?.error || "Failed to create chat session");
  }
};

export const sendChatMessageStream = async (
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void
): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("token");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Use native fetch for streaming since Axios struggles with robust chunking
    const response = await fetch(`${backendUrl}/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to send message stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        fullResponse += chunk;
        onChunk(chunk);
      }
    }

    return {
      message: fullResponse,
      response: fullResponse,
      metadata: {
        technique: "supportive",
        goal: "Provide support",
        progress: []
      }
    };
  } catch (error: any) {
    console.error("Error sending chat stream message:", error);
    throw new Error(error.message || "Failed to stream message");
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    console.log(`Sending message to session ${sessionId}:`, message);
    const { data } = await apiClient.post(`/chat/sessions/${sessionId}/messages`, { message });
    console.log("Message sent successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    throw new Error(error.response?.data?.error || "Failed to send message");
  }
};

export const getChatHistory = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    console.log(`Fetching chat history for session ${sessionId}`);
    const { data } = await apiClient.get(`/chat/sessions/${sessionId}/history`);
    console.log("Received chat history:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid chat history format:", data);
      throw new Error("Invalid chat history format");
    }

    // Ensure each message has the correct format
    return data.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata: msg.metadata,
    }));
  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch chat history");
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    console.log("Fetching all chat sessions...");
    const { data } = await apiClient.get("/chat/sessions");
    console.log("Received chat sessions:", data);

    return data.map((session: any) => {
      // Ensure dates are valid
      const createdAt = new Date(session.createdAt || Date.now());
      const updatedAt = new Date(session.updatedAt || Date.now());

      return {
        ...session,
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
        messages: (session.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now()),
        })),
      };
    });
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch chat sessions");
  }
};
