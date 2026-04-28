"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, Volume2 } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const recognitionRef = useRef<any>(null);
    const isSendingRef = useRef(false);
    const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    /* ===========================
       VOICE INTERACTION SETUP
    ============================ */
    useEffect(() => {
        const loadVoices = () => { window.speechSynthesis.getVoices(); };
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }

        return () => {
            recognitionRef.current?.stop();
            window.speechSynthesis.cancel();
            if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
        };
    }, []);

    const startListening = () => {
        const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
        if (!SpeechRecognition) {
            alert("For voice features, please use Chrome browser.");
            return;
        }

        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimText = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                } else {
                    interimText += event.results[i][0].transcript;
                }
            }

            const currentSpeech = finalText || interimText;
            setTranscript(currentSpeech);
            setInputValue(prev => {
                const base = prev.endsWith(' ') ? prev : prev ? prev + ' ' : '';
                return base + currentSpeech;
            });

            // Reset auto-send timeout
            if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
            autoSendTimeoutRef.current = setTimeout(() => {
                stopListening();
            }, 2500); // Wait 2.5 seconds of silence before auto-submitting
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);

        setTimeout(() => {
            const form = document.getElementById("chat-form");
            if (form) {
                // Safely trigger standard React submit
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }, 500);
    };

    const toggleListening = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
            v.lang.includes('en') && 
            (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira'))
        );
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
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
            // Removed the old delay speak(aiText) because prompt says call speakText automatically.
            if (aiText) {
                setTimeout(() => speakText(aiText), 50);
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
            border: "1px solid #D1E1F7",
            borderRadius: "10px",
            overflow: "hidden"
        }}>
            <style>
                {`
                @keyframes pulse-ring {
                  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
                  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .mic-active {
                  animation: pulse-ring 1.2s infinite;
                  background-color: #ef4444 !important;
                  color: white !important;
                  border-color: #ef4444 !important;
                }
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
                .recording-dot {
                  display: inline-block;
                  width: 8px;
                  height: 8px;
                  background-color: #ef4444;
                  border-radius: 50%;
                  margin-right: 6px;
                  animation: blink 1s infinite;
                }
                .live-transcript {
                  padding: 8px 12px;
                  font-size: 14px;
                  color: #ef4444;
                  background-color: #fef2f2;
                  border-radius: 6px;
                  margin-bottom: 8px;
                  font-style: italic;
                  display: flex;
                  align-items: center;
                }
                `}
            </style>
            {/* HEADER */}
            <div style={{
                padding: "1rem",
                borderBottom: "1px solid #D1E1F7",
                background: "#E7F2F7",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <button onClick={() => router.back()}>← Back</button>
                <span>{session.sessionStatus}</span>
            </div>

            {/* ESCALATION BANNER */}
            {session.sessionStatus === "ESCALATED" && (
                <div style={{
                    background: "#fdecd5",
                    color: "#d4842e",
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
                background: "#E7F2F7",
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
                            background: msg.role === "user" ? "#297194" : "#ffffff",
                            color: msg.role === "user" ? "#fff" : "#1a4a5e",
                            whiteSpace: "pre-wrap",
                            border: msg.role === "assistant" ? "1px solid #D1E1F7" : "none"
                        }}>
                            {msg.content}
                            
                            {/* Replay voice button for bot messages */}
                            {msg.role === "assistant" && (
                                <button
                                    type="button"
                                    onClick={() => speakText(msg.content)}
                                    style={{
                                        marginLeft: "8px",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        padding: "4px"
                                    }}
                                    title="Replay Audio"
                                >
                                    <Volume2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Visual Speaking Indicator */}
                {(isListening || isSpeaking || isSending) && (
                    <div style={{ alignSelf: "center", fontStyle: "italic", fontSize: "14px", marginTop: "8px", color: isSpeaking ? "#297194" : isSending ? "#1a4a5e" : "#EC993D" }}>
                        {isSpeaking ? "Speaking..." : isSending ? "Processing..." : "Listening..."}
                    </div>
                )}
                
                {/* Speaking indicator when AI speaks the response natively via SpeechSynthesis. Native callback runs via onEnd */}
                
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div style={{ padding: "1rem", borderTop: "1px solid #D1E1F7", position: "relative", background: "#ffffff" }}>
                
                {/* Live Transcript Display */}
                {isListening && (
                    <div className="live-transcript">
                        <span className="recording-dot" /> Listening...
                        {transcript && <span style={{ marginLeft: "6px", color: "#666" }}>"{transcript}"</span>}
                    </div>
                )}

                <form id="chat-form" onSubmit={handleSendMessage} style={{
                    display: "flex",
                    gap: "0.5rem"
                }}>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                        value={inputValue}
                        onChange={e => {
                            setInputValue(e.target.value);
                        }}
                        disabled={isSending || session.sessionStatus === "CLOSED"}
                        placeholder="Type or speak your message..."
                        style={{ width: "100%", padding: "0.75rem", paddingRight: "40px", boxSizing: "border-box" }}
                    />
                    <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isSpeaking}
                        className={isListening ? "mic-active" : ""}
                        style={{
                            position: "absolute",
                            right: "12px",
                            background: isListening ? "#ef4444" : "transparent",
                            border: "none",
                            borderRadius: "50%",
                            cursor: isSpeaking ? "not-allowed" : "pointer",
                            color: isListening ? "#fff" : "#9ca3af",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: isSpeaking ? 0.5 : 1
                        }}
                        title="Click to speak"
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={isSending || isListening}
                    style={{ padding: "0.75rem 1.25rem", background: "#297194", color: "#fff", border: "none", borderRadius: "6px", cursor: isSending || isListening ? "not-allowed" : "pointer", opacity: isSending || isListening ? 0.5 : 1 }}
                >
                    Send
                </button>
                </form>
            </div>
        </div>
    );
};

export default TherapySessionPage;