"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic } from "lucide-react";

interface TherapyMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    detectedEmotion?: string;
    riskLevel?: string;
}

interface Session {
    _id: string;
    sessionStatus: "ACTIVE" | "ESCALATED" | "CLOSED";
    messages: TherapyMessage[];
    lastRiskLevel?: string;
}

const TherapySessionPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<TherapyMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Voice tracking states
    const [isRecording, _setIsRecording] = useState(false);
    const isRecordingRef = useRef(false);
    const setIsRecording = (val: boolean) => {
        isRecordingRef.current = val;
        _setIsRecording(val);
    };

    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const latestTranscriptRef = useRef("");
    const lastSpeechTimestampRef = useRef<number>(0);
    const isSendingRef = useRef(false);
    const executeSendRef = useRef<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    /* ===========================
       FETCH SESSION ON LOAD
    ============================ */
    useEffect(() => {
        if (!sessionId) return;

        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/therapy/sessions/${sessionId}`);
                const data = await res.json();
                setSession(data.session);
                setMessages(data.session.messages || []);
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    /* ===========================
       AUTO SCROLL
    ============================ */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ===========================
       VOICE INTERACTION SETUP
    ============================ */
    useEffect(() => {
        executeSendRef.current = executeSend;
    });

    useEffect(() => {
        const SpeechRecognition = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
        if (!SpeechRecognition) {
            setIsSpeechSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            let finalOutput = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const confidence = event.results[i][0].confidence;
                    if (confidence > 0.7) {
                        finalOutput += event.results[i][0].transcript;
                    } else {
                        console.log("Ignored low-confidence transcript:", event.results[i][0].transcript, "(Confidence:", confidence, ")");
                    }
                }
            }
            
            const newText = finalOutput.trim();
            if (newText) {
                console.log("Final Transcript:", newText);
                setInputValue(prev => {
                    const combined = prev ? prev + " " + newText : newText;
                    latestTranscriptRef.current = combined;
                    return combined;
                });
                lastSpeechTimestampRef.current = Date.now();
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
            isSendingRef.current = false;
            lastSpeechTimestampRef.current = 0;
            if (event.error === 'not-allowed') {
                alert("Microphone access required. Please allow permissions.");
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            isSendingRef.current = false;
        };
        recognitionRef.current = recognition;

        // SMART SILENCE DETECTION POLLING
        silenceIntervalRef.current = setInterval(() => {
            if (!isRecordingRef.current || isSendingRef.current) return;
            
            const timeSinceLastSpeech = Date.now() - lastSpeechTimestampRef.current;
            
            if (lastSpeechTimestampRef.current > 0 && timeSinceLastSpeech >= 3000 && latestTranscriptRef.current.trim().length >= 5) {
                console.log("Silence detected, auto-sending...");
                isSendingRef.current = true;
                recognition.stop();
                setIsRecording(false);
                lastSpeechTimestampRef.current = 0;
                
                if (executeSendRef.current) {
                    // Added 300ms distinct human hesitation padding
                    setTimeout(() => {
                        executeSendRef.current(latestTranscriptRef.current);
                        latestTranscriptRef.current = "";
                    }, 300);
                }
            }
        }, 500);

        return () => {
            recognition.stop();
            if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
        };
    }, []);

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();

        if (recognitionRef.current && isRecordingRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        console.log("AI speaking...");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            // Subtle transition decay to prevent harsh popup snapping
            setTimeout(() => setIsSpeaking(false), 300);
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            isSendingRef.current = false;
            lastSpeechTimestampRef.current = 0;
        } else {
            console.log("Voice started");
            latestTranscriptRef.current = "";
            isSendingRef.current = false;
            lastSpeechTimestampRef.current = Date.now();
            setInputValue("");
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    /* ===========================
       STREAMING SEND MESSAGE
    ============================ */
    const executeSend = async (userText: string) => {
        if (!userText.trim() || isSending || session?.sessionStatus === "CLOSED") return;
        
        window.speechSynthesis.cancel();
        isSendingRef.current = true;
        setInputValue("");
        setIsSending(true);

        // 1️⃣ Add user message instantly
        const userMsg: TherapyMessage = {
            role: "user",
            content: userText,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);

        // 2️⃣ Empty assistant bubble (BEFORE fetch)
        setMessages(prev => [
            ...prev,
            { role: "assistant", content: "", timestamp: new Date().toISOString() },
        ]);

        let aiText = "";

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const token = localStorage.getItem("token");
            const res = await fetch(`${backendUrl}/chat/sessions/${sessionId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userText }),
            });

            if (!res.body) throw new Error("No stream body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            // 3️⃣ STREAM LOOP
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;

                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: aiText,
                    };
                    return updated;
                });
            }
        } catch (err) {
            console.error("Streaming error:", err);
            aiText = "I'm here with you. Please try again.";
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: aiText,
                };
                return updated;
            });
        } finally {
            setIsSending(false);
            isSendingRef.current = false;
            // Add slight timing buffer allowing UI processing tag to settle elegantly
            if (aiText) {
                setTimeout(() => speak(aiText), 400);
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent manual duplicate sends
        if (isSendingRef.current) return;
        
        await executeSend(inputValue);
    };

    /* ===========================
       UI STATES
    ============================ */
    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Loading session...</div>;
    }

    if (!session) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Session not found.</div>;
    }

    return (
        <div style={{
            maxWidth: "650px",
            margin: "2rem auto",
            display: "flex",
            flexDirection: "column",
            height: "80vh",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            overflow: "hidden"
        }}>
            {/* HEADER */}
            <div style={{
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <button onClick={() => router.back()}>← Back</button>
                <span>{session.sessionStatus}</span>
            </div>

            {/* ESCALATION BANNER */}
            {session.sessionStatus === "ESCALATED" && (
                <div style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    padding: "0.75rem",
                    textAlign: "center",
                    fontWeight: 600
                }}>
                    If you feel unsafe, please contact local emergency services immediately.
                </div>
            )}

            {/* MESSAGES */}
            <div style={{
                flex: 1,
                padding: "1rem",
                overflowY: "auto",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "8px",
                            maxWidth: "80%",
                            background: msg.role === "user" ? "#000" : "#f3f4f6",
                            color: msg.role === "user" ? "#fff" : "#111",
                            whiteSpace: "pre-wrap"
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {(isRecording || isSpeaking || isSending) && (
                    <div style={{ alignSelf: "center", fontStyle: "italic", fontSize: "14px", marginTop: "8px", color: isSpeaking ? "#8b5cf6" : isSending ? "#9ca3af" : "#ef4444" }}>
                        {isSpeaking ? "Speaking..." : isSending ? "Processing..." : "Listening..."}
                    </div>
                )}
                
                {/* Speaking indicator when AI speaks the response natively via SpeechSynthesis. Native callback runs via onEnd */}
                
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={handleSendMessage} style={{
                padding: "1rem",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: "0.5rem",
                position: "relative"
            }}>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                        value={inputValue}
                        onChange={e => {
                            setInputValue(e.target.value);
                            latestTranscriptRef.current = e.target.value;
                        }}
                        disabled={isSending || session.sessionStatus === "CLOSED"}
                        placeholder="Type or speak your message..."
                        style={{ width: "100%", padding: "0.75rem", paddingRight: "40px", boxSizing: "border-box" }}
                    />
                    {isSpeechSupported && (
                        <button
                            type="button"
                            onClick={toggleRecording}
                            style={{
                                position: "absolute",
                                right: "12px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: isRecording ? "#ef4444" : "#9ca3af",
                                padding: 0,
                                display: "flex"
                            }}
                            title={isRecording ? "Stop listening" : "Start speaking"}
                        >
                            <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isSending}
                    style={{ padding: "0.75rem 1.25rem", background: "#000", color: "#fff" }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default TherapySessionPage;