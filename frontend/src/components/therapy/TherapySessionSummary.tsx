"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import apiClient from "../../../lib/api/client";

interface SessionSummary {
    totalMessages: number;
    dominantEmotion: string;
    riskProgression: string[];
    emotionalTrend: "improving" | "declining" | "stable";
    cbtTechniquesUsed: string[];
    sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
    clinicalNotes?: string;
}

interface TherapySessionSummaryProps {
    sessionId: string;
}

export const TherapySessionSummary: React.FC<TherapySessionSummaryProps> = ({ sessionId }) => {
    const [summary, setSummary] = useState<SessionSummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!sessionId) return;

        const fetchSummary = async () => {
            try {
                const { data } = await apiClient.get(`/api/therapy/sessions/${sessionId}/summary`);
                if (data.success) {
                    setSummary(data.summary);
                }
            } catch (error) {
                console.error("Error fetching session summary:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                Loading clinical summary...
            </div>
        );
    }

    if (!summary) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#991b1b" }}>
                Unable to load session summary.
            </div>
        );
    }

    // Map risk progression to numeric values for Recharts
    const riskData = summary.riskProgression.map((risk, idx) => {
        let numericRisk = 1;
        if (risk === "MEDIUM") numericRisk = 2;
        if (risk === "HIGH") numericRisk = 3;

        return {
            step: `Msg ${idx + 1}`,
            riskLevel: numericRisk,
            label: risk
        };
    });

    const getStatusColor = (status: string) => {
        if (status === "ESCALATED") return "#dc2626";
        if (status === "CLOSED") return "#4b5563";
        return "#2563eb";
    };

    const getTrendColor = (trend: string) => {
        if (trend === "improving") return "#16a34a"; // green
        if (trend === "declining") return "#dc2626"; // red
        return "#ca8a04"; // yellow
    };

    return (
        <div style={{
            maxWidth: "700px",
            margin: "2rem auto",
            padding: "2rem",
            backgroundColor: "#fcfcfc",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontFamily: "system-ui, sans-serif"
        }}>
            <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, color: "#111827", fontSize: "1.5rem", fontWeight: 600 }}>Session Clinical Summary</h2>
                <div style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "white",
                    backgroundColor: getStatusColor(summary.sessionStatus)
                }}>
                    {summary.sessionStatus}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ padding: "1rem", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Total Interactions</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}>{summary.totalMessages}</div>
                </div>

                <div style={{ padding: "1rem", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Dominant Emotion</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>
                        {summary.dominantEmotion}
                    </div>
                </div>

                <div style={{ padding: "1rem", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Historical Trend</div>
                    <div style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: getTrendColor(summary.emotionalTrend),
                        textTransform: "capitalize"
                    }}>
                        {summary.emotionalTrend}
                    </div>
                </div>
            </div>

            {summary.riskProgression.length > 0 && (
                <div style={{ marginBottom: "2rem", backgroundColor: "#fff", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#374151", fontSize: "1.125rem", fontWeight: 500 }}>Risk Progression</h3>
                    <div style={{ height: "200px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={riskData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="step" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                                <YAxis
                                    domain={[0, 4]}
                                    ticks={[1, 2, 3]}
                                    tickFormatter={(val) => {
                                        if (val === 1) return "LOW";
                                        if (val === 2) return "MED";
                                        if (val === 3) return "HIGH";
                                        return "";
                                    }}
                                    tick={{ fontSize: 12, fill: "#6b7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(val: number) => {
                                        if (val === 1) return ["LOW", "Risk Level"];
                                        if (val === 2) return ["MEDIUM", "Risk Level"];
                                        if (val === 3) return ["HIGH", "Risk Level"];
                                        return [val, "Risk"];
                                    }}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="riskLevel"
                                    stroke={getTrendColor(summary.emotionalTrend)}
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {summary.cbtTechniquesUsed && summary.cbtTechniquesUsed.length > 0 && (
                <div style={{ backgroundColor: "#fff", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.125rem", fontWeight: 500 }}>Therapeutic Techniques Applied</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {summary.cbtTechniquesUsed.map((technique, idx) => (
                            <span key={idx} style={{
                                padding: "0.375rem 0.75rem",
                                backgroundColor: "#f3f4f6",
                                color: "#4b5563",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                border: "1px solid #e5e7eb"
                            }}>
                                {technique}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {summary.clinicalNotes && (
                <div style={{ backgroundColor: "#fff", padding: "1.5rem", border: "1px solid #e5e7eb", borderRadius: "8px", marginTop: "2rem" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.125rem", fontWeight: 500 }}>Clinical Notes</h3>
                    <div style={{
                        color: "#4b5563",
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        padding: "1rem",
                        backgroundColor: "#f9fafb",
                        borderRadius: "6px",
                        border: "1px solid #f3f4f6"
                    }}>
                        {summary.clinicalNotes}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapySessionSummary;
