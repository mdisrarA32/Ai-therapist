"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";
import apiClient from "../../../lib/api/client";

export const StartTherapyButton: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const startNewSession = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.post("/api/therapy/analyze", {
                message: "Hello, I would like to start a new therapy session."
            });

            if (response.data?.sessionId) {
                router.push(`/therapy/session/${response.data.sessionId}`);
            }
        } catch (error) {
            console.error("Error creating new session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={startNewSession}
            disabled={isLoading}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: isLoading ? "#9ca3af" : "#0f172a",
                color: "white",
                fontWeight: 500,
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s"
            }}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <PlusCircle className="w-4 h-4" />
            )}{" "}
            Start New Therapy Session
        </button>
    );
};
