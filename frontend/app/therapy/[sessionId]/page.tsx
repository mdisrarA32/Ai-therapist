"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  PlusCircle,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CrisisModal from "@/components/CrisisModal";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessageStream,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

interface ApiResponse {
  message: string;
  metadata: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const COMPLETION_THRESHOLD = 5;

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useSession();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [showNFTCelebration, setShowNFTCelebration] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId as string
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisLanguage, setCrisisLanguage] = useState('en');

  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const handleSOS = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (sosSent || sosLoading) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to send an emergency alert to your emergency contact?"
    );
    if (!confirmed) return;

    setSosLoading(true);
    try {
      const token = localStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/chat/sos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        setSosSent(true);
        // Reset after 5 minutes to allow sending again
        setTimeout(() => setSosSent(false), 5 * 60 * 1000);
      }
    } catch (err) {
      console.error('SOS failed:', err);
    } finally {
      setSosLoading(false);
    }
  };

  // --- Voice Chat States & Logic ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const baseMessageRef = useRef("");

  // --- Voice Chat Language Variables ---
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [detectedLangLabel, setDetectedLangLabel] = useState('English');

  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis?.getVoices(); };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
    return () => {
        recognitionRef.current?.stop();
        window.speechSynthesis?.cancel();
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
    recognition.lang = currentLanguage;

    // Store whatever was already in the chat box before recording started
    baseMessageRef.current = message;

    recognition.onresult = (event: any) => {
        let currentSessionTranscript = '';

        // Iterate from 0 to capture the FULL transcript of this specific recording session
        for (let i = 0; i < event.results.length; i++) {
            currentSessionTranscript += event.results[i][0].transcript;
        }

        setTranscript(currentSessionTranscript);
        
        // Merge the original input string with the live transcript cleanly
        setMessage(() => {
            const base = baseMessageRef.current;
            const spacer = base.length > 0 && !base.endsWith(' ') ? ' ' : '';
            return base + spacer + currentSessionTranscript;
        });

        if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = setTimeout(() => {
            stopListening();
        }, 2000); 
    };

    recognition.onend = () => setIsListening(false);
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
       const submitBtn = document.getElementById("chat-submit-btn");
       if (submitBtn) submitBtn.click();
    }, 500);
  };

  const toggleListening = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }
    if (isListening) stopListening();
    else startListening();
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const langCodePrefix = currentLanguage.split('-')[0];
    const targetVoices = voices.filter(v => v.lang.startsWith(langCodePrefix));
    
    // Attempt female match in target language
    const femaleVoice = targetVoices.find(v => 
        v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Zira')
    ) || targetVoices[0] || voices.find(v => v.lang.includes('en'));
    
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.lang = currentLanguage;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      console.log("New session created:", newSessionId);

      // Update sessions list immediately
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update all state in one go
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      setMessages([]);

      // Update URL without refresh
      window.history.pushState({}, "", `/therapy/${newSessionId}`);

      // Force a re-render of the chat area
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize chat session and load history
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const initChat = async () => {
      try {
        setIsLoading(true);
        if (!sessionId || sessionId === "new") {
          console.log("Creating new chat session...");
          const newSessionId = await createChatSession();
          console.log("New session created:", newSessionId);
          setSessionId(newSessionId);
          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          console.log("Loading existing chat session:", sessionId);
          try {
            const history = await getChatHistory(sessionId);
            console.log("Loaded chat history:", history);
            if (Array.isArray(history)) {
              const formattedHistory = history.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }));
              console.log("Formatted history:", formattedHistory);
              setMessages(formattedHistory);
            } else {
              console.error("History is not an array:", history);
              setMessages([]);
            }
          } catch (historyError) {
            console.error("Error loading chat history:", historyError);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble loading the chat session. Please try refreshing the page.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [sessionId]);

  // Load all chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    const currentMessage = message.trim();
    console.log("Current message:", currentMessage);
    console.log("Session ID:", sessionId);
    console.log("Is typing:", isTyping);
    console.log("Is chat paused:", isChatPaused);

    if (!currentMessage || isTyping || isChatPaused || !sessionId) {
      console.log("Submission blocked:", {
        noMessage: !currentMessage,
        isTyping,
        isChatPaused,
        noSessionId: !sessionId,
      });
      return;
    }

    const now = Date.now();
    if (now - lastMessageTime < 3000) {
      console.log("Submission blocked: Debounce rate limit (wait 3 seconds)");
      return;
    }
    setLastMessageTime(now);

    setMessage("");
    setIsTyping(true);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Check for stress signals
      const stressCheck = detectStressSignals(currentMessage);
      if (stressCheck) {
        setStressPrompt(stressCheck);
        setIsTyping(false);
        return;
      }

      // Start streaming handling directly
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true
        } as any
      ]);

      const aiResponse = await sendChatMessageStream(sessionId, currentMessage, (chunk) => {
        setIsTyping(false); // Remove "typing" global loader immediately when stream starts
        setMessages((prev) => {
          const clone = [...prev];
          // the last message must be the assistant stream block we just appended
          const lastId = clone.length - 1;
          if (clone[lastId]?.role === "assistant") {
            clone[lastId] = {
              ...clone[lastId],
              content: clone[lastId].content + chunk
            };
          }
          return clone;
        });
      });

      // After streaming completes, embed the official metadata context blocks
      setMessages((prev) => {
        const newArr = [...prev];
        const lastId = newArr.length - 1;
        if (newArr[lastId]?.role === "assistant") {
          newArr[lastId] = {
            ...newArr[lastId],
            isStreaming: false, // turn off cursor/stream flag
            metadata: {
              analysis: (aiResponse.metadata as any)?.analysis || {
                emotionalState: "neutral",
                riskLevel: 0,
                themes: [],
                recommendedApproach: "supportive",
                progressIndicators: [],
              },
              technique: aiResponse.metadata?.technique || "supportive",
              goal: (aiResponse.metadata as any)?.currentGoal || "Provide support",
              progress: aiResponse.metadata?.progress || {
                emotionalState: "neutral",
                riskLevel: 0,
              },
            }
          } as any;
        }
        return newArr;
      });
      console.log("Stream successfully completed!");

      if (aiResponse && aiResponse.message) {
          if (aiResponse.isCrisis) {
             setCrisisLanguage(aiResponse.detectedLanguage || 'en');
             setShowCrisisModal(true);
          }
          if (aiResponse.detectedLanguage) {
             setDetectedLangLabel(aiResponse.languageLabel || 'English');
             const langMap: Record<string, string> = {
                hi: 'hi-IN', pa: 'pa-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
                mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', ur: 'ur-IN', en: 'en-US'
             };
             setCurrentLanguage(langMap[aiResponse.detectedLanguage] || 'en-US');
          }
          speakText(aiResponse.message);
      }

      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const detectStressSignals = (message: string): StressPrompt | null => {
    const stressKeywords = [
      "stress",
      "anxiety",
      "worried",
      "panic",
      "overwhelmed",
      "nervous",
      "tense",
      "pressure",
      "can't cope",
      "exhausted",
    ];

    const lowercaseMsg = message.toLowerCase();
    const foundKeyword = stressKeywords.find((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    if (foundKeyword) {
      const activities = [
        {
          type: "breathing" as const,
          title: "Breathing Exercise",
          description:
            "Follow calming breathing exercises with visual guidance",
        },
        {
          type: "garden" as const,
          title: "Zen Garden",
          description: "Create and maintain your digital peaceful space",
        },
        {
          type: "forest" as const,
          title: "Mindful Forest",
          description: "Take a peaceful walk through a virtual forest",
        },
        {
          type: "waves" as const,
          title: "Ocean Waves",
          description: "Match your breath with gentle ocean waves",
        },
      ];

      return {
        trigger: foundKeyword,
        activity: activities[Math.floor(Math.random() * activities.length)],
      };
    }

    return null;
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      router.push(`/therapy/${newSessionId}`);
    }

    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      setShowNFTCelebration(true);
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        detectedLanguage={crisisLanguage}
      />
      <div className="flex h-[calc(100vh-4rem)] mt-20 gap-6">
        {/* Sidebar with chat history */}
        <div className="w-80 flex flex-col border-r border-[#D1E1F7] bg-[#ffffff]">
          <div className="p-4 border-b border-[#D1E1F7]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat Sessions</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="hover:bg-[#E7F2F7] hover:text-[#297194]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              New Session
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={cn(
                    "p-3 rounded-lg text-sm cursor-pointer hover:bg-[#E7F2F7] transition-colors",
                    session.sessionId === sessionId
                      ? "bg-[#E7F2F7] text-[#297194]"
                      : "bg-[#ffffff] text-muted-foreground"
                  )}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">
                      {session.messages[0]?.content.slice(0, 30) || "New Chat"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground">
                    {session.messages[session.messages.length - 1]?.content ||
                      "No messages yet"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const date = new Date(session.updatedAt);
                          if (isNaN(date.getTime())) {
                            return "Just now";
                          }
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                          });
                        } catch (error) {
                          return "Just now";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#E7F2F7] rounded-lg border border-[#D1E1F7]">
          {/* Chat header */}
          <div className="p-4 border-b border-[#D1E1F7] bg-[#ffffff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E7F2F7] text-[#297194] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">AI Therapist</h2>
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages
                </p>
              </div>
            </div>
          </div>

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-[#D1E1F7]/50 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-2 text-2xl font-semibold">
                      <div className="relative">
                        <Sparkles className="w-6 h-6 text-[#297194]" />
                        <motion.div
                          className="absolute inset-0 text-[#297194]"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                      </div>
                      <span className="text-[#297194]">
                        AI Therapist
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      How can I assist you today?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-[#D1E1F7]/50 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-4 px-6 text-left justify-start bg-[#ffffff] border-[#D1E1F7] hover:bg-[#E7F2F7] hover:border-[#297194] transition-all duration-300"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        {q.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-6 py-8",
                        msg.role === "assistant"
                          ? "bg-[#D1E1F7] text-[#1a4a5e]"
                          : "bg-[#297194] text-[#ffffff]"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-8 h-8 rounded-full bg-[#ffffff] text-[#297194] flex items-center justify-center ring-1 ring-[#D1E1F7]">
                              <Bot className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#ffffff] text-[#297194] flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {msg.role === "assistant"
                                ? "AI Therapist"
                                : "You"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm dark:prose-invert leading-relaxed relative flex items-start gap-2 max-w-full">
                            <div className="flex-1 overflow-hidden" dir={currentLanguage === 'ur-IN' && msg.role === 'assistant' ? "rtl" : "ltr"}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                              {(msg as any).isStreaming && (
                                <span className="ml-1 inline-block w-1.5 h-4 bg-[#297194] rounded-sm animate-pulse align-middle" />
                              )}
                            </div>
                            {msg.role === "assistant" && !(msg as any).isStreaming && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full shrink-0 mt-0.5 opacity-50 hover:opacity-100 hover:bg-muted/50"
                                onClick={() => speakText(msg.content)}
                                title="Replay Audio"
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {msg.metadata?.goal && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Goal: {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-8 flex gap-4 bg-[#D1E1F7] text-[#1a4a5e]"
                  >
                    <div className="w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#ffffff] text-[#297194] flex items-center justify-center ring-1 ring-[#D1E1F7]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">AI Therapist</p>
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-[#D1E1F7] bg-[#ffffff]/80 backdrop-blur supports-[backdrop-filter]:bg-[#ffffff]/80 p-4 relative z-10">
            <style dangerouslySetInnerHTML={{__html: `
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
            `}} />
            
            <div className="max-w-3xl mx-auto relative cursor-default">
              {detectedLangLabel !== 'English' && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#D1E1F7] text-[#1a4a5e] rounded-full text-xs font-medium z-10 shadow-sm border border-[#297194] whitespace-nowrap">
                  🌐 Chatting in {detectedLangLabel}
                </div>
              )}
              {isListening && (
                <div className="absolute bottom-full mb-3 left-0 right-0 bg-red-50 dark:bg-red-950 text-red-500 border border-red-200 dark:border-red-900 shadow-sm rounded-lg py-2 px-4 text-sm flex items-center z-50">
                    <span className="recording-dot" /> Listening...
                    <span className="ml-2 text-red-400 dark:text-red-300 italic truncate">"{transcript}"</span>
                </div>
              )}
            <form
              onSubmit={handleSubmit}
              className="flex gap-4 items-end relative w-full"
            >
              <div className="flex-1 relative group w-full">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Complete the activity to continue..."
                      : "Ask me anything..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border border-[#D1E1F7] bg-[#ffffff]",
                    "p-3 pr-[160px] min-h-[48px] max-h-[200px] text-[#297194]",
                    "focus:outline-none focus:border-[#297194] focus:ring-1 focus:ring-[#297194]",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                    "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1.5">
                    <button
                      onClick={handleSOS}
                      style={{
                        backgroundColor: sosSent ? '#16a34a' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: (sosSent || sosLoading) ? 'not-allowed' : 'pointer',
                        opacity: sosLoading ? 0.7 : 1,
                        height: '36px',
                        transition: 'all 0.2s'
                      }}
                      disabled={sosSent || sosLoading}
                      title="Trigger Emergency Alert"
                    >
                      {sosLoading ? 'Sending...' : sosSent ? 'Help notified ✅' : '🆘 SOS'}
                    </button>
                    <select
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                      className="h-[36px] bg-background border border-border text-xs rounded-xl px-2 focus:outline-none focus:ring-1 focus:ring-primary/50 text-muted-foreground w-[72px]"
                      title="Force Language"
                    >
                      <option value="en-US">EN</option>
                      <option value="hi-IN">हिंदी</option>
                      <option value="pa-IN">ਪੰਜਾਬੀ</option>
                      <option value="bn-IN">বাংলা</option>
                      <option value="ta-IN">தமிழ்</option>
                      <option value="te-IN">తెలుగు</option>
                      <option value="mr-IN">मराठी</option>
                      <option value="gu-IN">ગુજરાતી</option>
                      <option value="kn-IN">ಕನ್ನಡ</option>
                      <option value="ml-IN">മലയാളം</option>
                      <option value="ur-IN">اردو</option>
                    </select>

                    <Button
                      type="button"
                      size="icon"
                      onClick={toggleListening}
                      disabled={isSpeaking}
                      className={cn(
                        "h-[36px] w-[36px] rounded-xl transition-all duration-200",
                        isListening ? "bg-red-500 hover:bg-red-600 mic-active text-white border-red-500" : "bg-muted/50 hover:bg-muted text-muted-foreground",
                        isSpeaking && "opacity-50 cursor-not-allowed"
                      )}
                      title="Click to speak"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>

                    <Button
                      id="chat-submit-btn"
                      type="submit"
                      size="icon"
                      className={cn(
                        "h-[36px] w-[36px]",
                        "rounded-xl transition-all duration-200",
                        "bg-[#297194] text-[#ffffff] hover:bg-[#1e5870]",
                        "shadow-sm",
                        (isTyping || isChatPaused || !message.trim()) &&
                        "opacity-50 cursor-not-allowed",
                        "group-hover:scale-105 group-focus-within:scale-105"
                      )}
                      disabled={isTyping || isChatPaused || (!message.trim() && !isListening)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </form>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Press <kbd className="px-2 py-0.5 rounded bg-muted">Enter ↵</kbd>{" "}
              to send,
              <kbd className="px-2 py-0.5 rounded bg-muted ml-1">
                Shift + Enter
              </kbd>{" "}
              for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
