"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/api/client";

interface Session {
    _id: string;
    createdAt: string;
    updatedAt: string;
    sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
    lastRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export const TherapySessionList: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const { data } = await apiClient.get("/api/therapy/sessions");
                setSessions(data.sessions || []);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Loading therapy sessions...</div>;
    }

    if (sessions.length === 0) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed #ccc", borderRadius: "8px", margin: "2rem auto", maxWidth: "600px" }}>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>Start your first therapy session</p>
                <button
                    onClick={() => router.push("/therapy/new")}
                    style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px" }}
                >
                    Begin Session
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Your Therapy Sessions</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {sessions.map((session) => (
                    <li
                        key={session._id}
                        onClick={() => router.push(`/therapy/session/${session._id}`)}
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            border: "1px solid #eaeaea",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "box-shadow 0.2s ease"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)")}
                        onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <span style={{ fontWeight: 600 }}>
                                {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                            <span style={{ fontSize: "0.875rem", color: "#666" }}>
                                {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <span style={{
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "999px",
                                background: session.lastRiskLevel === "HIGH" ? "#fee2e2" : session.lastRiskLevel === "MEDIUM" ? "#ffedd5" : "#d1fae5",
                                color: session.lastRiskLevel === "HIGH" ? "#991b1b" : session.lastRiskLevel === "MEDIUM" ? "#9a3412" : "#065f46"
                            }}>
                                Risk: {session.lastRiskLevel || "LOW"}
                            </span>

                            <span style={{
                                fontSize: "0.8rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "999px",
                                background: session.sessionStatus === "ESCALATED" ? "#fef2f2" : session.sessionStatus === "CLOSED" ? "#f3f4f6" : "#eff6ff",
                                color: session.sessionStatus === "ESCALATED" ? "#b91c1c" : session.sessionStatus === "CLOSED" ? "#374151" : "#1d4ed8",
                                border: `1px solid ${session.sessionStatus === "ESCALATED" ? "#fca5a5" : "transparent"}`
                            }}>
                                {session.sessionStatus}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TherapySessionList;
