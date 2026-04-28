"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";
import WelcomeSplash from "@/src/components/WelcomeSplash";
import CrisisSupportModal from '@/components/CrisisSupportModal';

import {
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/static-dashboard-data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { getInsights, getMoodTierFromScore } from '@/lib/insightsUtils';
import { MoodTier, Suggestion } from '@/lib/insightsData';
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";

import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";
import io from "socket.io-client";
import toast from "react-hot-toast";
import CountUp from "react-countup";

// Add this type definition
type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

// Add this interface near the top with other interfaces
interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Add this interface for stats
interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

// Update the calculateDailyStats function to show correct stats
const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  // Calculate mood score (average of today's mood entries)
  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
        moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
        moodEntries.length
      )
      : null;

  // Count therapy sessions (all sessions ever)
  const therapySessions = activities.filter((a) => a.type === "therapy").length;

  return {
    moodScore: averageMood,
    completionRate: 100, // Always 100% as requested
    mindfulnessCount: therapySessions, // Total number of therapy sessions
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

// Rename the function
const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];

  // Get activities from last 7 days
  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );

  // Analyze mood patterns
  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

    if (latestMood > averageMood) {
      insights.push({
        title: "Mood Improvement",
        description:
          "Your recent mood scores are above your weekly average. Keep up the good work!",
        icon: Brain,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "Mood Change Detected",
        description:
          "I've noticed a dip in your mood. Would you like to try some mood-lifting activities?",
        icon: Heart,
        priority: "high",
      });
    }
  }

  // Analyze activity patterns
  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 0) {
    const dailyAverage = mindfulnessActivities.length / 7;
    if (dailyAverage >= 1) {
      insights.push({
        title: "Consistent Practice",
        description: `You've been regularly engaging in mindfulness activities. This can help reduce stress and improve focus.`,
        icon: Trophy,
        priority: "medium",
      });
    } else {
      insights.push({
        title: "Mindfulness Opportunity",
        description:
          "Try incorporating more mindfulness activities into your daily routine.",
        icon: Sparkles,
        priority: "low",
      });
    }
  }

  // Check activity completion rate
  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate =
    recentActivities.length > 0
      ? (completedActivities.length / recentActivities.length) * 100
      : 0;

  if (completionRate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(
        completionRate
      )}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  } else if (completionRate < 50) {
    insights.push({
      title: "Activity Reminder",
      description:
        "You might benefit from setting smaller, more achievable daily goals.",
      icon: Calendar,
      priority: "medium",
    });
  }

  // Time pattern analysis
  const morningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() < 12
  );
  const eveningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() >= 18
  );

  if (morningActivities.length > eveningActivities.length) {
    insights.push({
      title: "Morning Person",
      description:
        "You're most active in the mornings. Consider scheduling important tasks during your peak hours.",
      icon: Sun,
      priority: "medium",
    });
  } else if (eveningActivities.length > morningActivities.length) {
    insights.push({
      title: "Evening Routine",
      description:
        "You tend to be more active in the evenings. Make sure to wind down before bedtime.",
      icon: Moon,
      priority: "medium",
    });
  }

  // Sort insights by priority and return top 3
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

// ── Daily check-in rate helpers (no React deps, safe to live at module level) ──

/** Record today's date (YYYY-MM-DD) into localStorage `aura_checkins`. Idempotent — only adds once per day. */
function recordDailyCheckin(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem("aura_checkins");
  const checkins: string[] = stored ? JSON.parse(stored) : [];
  if (!checkins.includes(today)) checkins.push(today);
  // Trim to last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const filtered = checkins.filter((d) => new Date(d) >= cutoff);
  localStorage.setItem("aura_checkins", JSON.stringify(filtered));
}

/** Count how many of the last 7 days have a check-in entry. */
function getWeeklyCheckinRate(): { count: number; total: number; label: string } {
  if (typeof window === "undefined") return { count: 0, total: 7, label: "Start today" };
  const stored = localStorage.getItem("aura_checkins");
  const checkins: string[] = stored ? JSON.parse(stored) : [];
  const last7: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(d.toISOString().split("T")[0]);
  }
  const count = last7.filter((day) => checkins.includes(day)).length;
  const label =
    count === 7 ? "Perfect week!"
      : count >= 5 ? "Great consistency"
        : count >= 3 ? "Keep it up"
          : count === 0 ? "Start today"
            : "Building the habit";
  return { count, total: 7, label };
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user } = useSession();

  // New Insights State
  const [insights, setInsights] = useState(() =>
    getInsights(getMoodTierFromScore(50))
  );

  const refreshInsights = useCallback((newScore: number) => {
    const tier = getMoodTierFromScore(newScore);
    setInsights(getInsights(tier));
  }, []);

  // New states for activities and wearables
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>([]);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  const [realtimeData, setRealtimeData] = useState({
    moodScore: null as number | null,
    totalActivities: 0,
    therapySessions: 0,
    lastUpdated: new Date()
  });

  // Lazy-initialised from localStorage so it's correct even before any mood save
  const [checkinRate, setCheckinRate] = useState(getWeeklyCheckinRate);

  const [externalGame, setExternalGame] = useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const emergencyContact = user?.emergencyContact;

  useEffect(() => {
    if (!mounted) return;
    const uId = user?._id || "default-user";

    const fetchDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/dashboard/${uId}`);
        const data = await res.json();
        if (data && data.userId) {
          setRealtimeData((prev) => ({
            ...prev,
            // Only replace moodScore if the API returned a real value;
            // if null/undefined, keep the last known score (e.g. from onMoodSaved)
            moodScore: data.moodScore ?? prev.moodScore,
            totalActivities: data.totalActivities,
            therapySessions: data.therapySessions,
            lastUpdated: new Date(data.lastUpdated),
          }));
        }
      } catch (err) { }
    };

    fetchDashboard();

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      transports: ["websocket"]
    });

    socket.on('dashboardUpdated', (data) => {
      setRealtimeData((prev) => ({
        ...prev,
        moodScore: data.moodScore ?? prev.moodScore,
        totalActivities: data.totalActivities,
        therapySessions: data.therapySessions,
        lastUpdated: new Date(data.lastUpdated),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [mounted, user]);

  // Add this function to transform activities into day activity format
  const transformActivitiesToDayActivity = (
    activities: Activity[]
  ): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();

    // Create array for last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = startOfDay(subDays(today, i));
      const dayActivities = activities.filter((activity) =>
        isWithinInterval(new Date(activity.timestamp), {
          start: date,
          end: addDays(date, 1),
        })
      );

      // Determine activity level based on number of activities
      let level: ActivityLevel = "none";
      if (dayActivities.length > 0) {
        if (dayActivities.length <= 2) level = "low";
        else if (dayActivities.length <= 4) level = "medium";
        else level = "high";
      }

      days.push({
        date,
        level,
        activities: dayActivities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          completed: activity.completed,
          time: format(new Date(activity.timestamp), "h:mm a"),
        })),
      });
    }

    return days;
  };

  // Modify the loadActivities function to use a default user ID
  const loadActivities = useCallback(async () => {
    try {
      const userActivities = await getUserActivities("default-user");
      setActivities(userActivities);
      setActivityHistory(transformActivitiesToDayActivity(userActivities));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Add this effect to update stats when activities change
  useEffect(() => {
    if (activities.length > 0) {
      setDailyStats(calculateDailyStats(activities));
    }
  }, [activities]);

  // Removed old insights generation effect

  // Add function to fetch daily stats
  const fetchDailyStats = useCallback(async () => {
    try {
      // Fetch therapy sessions using the chat API
      const sessions = await getAllChatSessions();

      // Fetch today's activities — safe: never throws, returns { count, activities }
      let activitiesData: Activity[] = [];
      let activitiesCount = 0;
      try {
        const activitiesResponse = await fetch("/api/activities/today");
        if (activitiesResponse.ok) {
          const data = await activitiesResponse.json();
          activitiesData = Array.isArray(data?.activities) ? data.activities : [];
          activitiesCount = data?.count ?? activitiesData.length;
        }
      } catch {
        activitiesCount = 0;
      }

      // Calculate mood score from activities
      const moodEntries = activitiesData.filter(
        (a: Activity) => a.type === "mood" && a.moodScore !== null
      );
      const averageMood =
        moodEntries.length > 0
          ? Math.round(
            moodEntries.reduce(
              (acc: number, curr: Activity) => acc + (curr.moodScore || 0),
              0
            ) / moodEntries.length
          )
          : null;

      setDailyStats({
        moodScore: averageMood,
        completionRate: 100,
        mindfulnessCount: sessions.length, // Total number of therapy sessions
        totalActivities: activitiesCount,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  }, []);

  // Fetch stats on mount and every 5 minutes
  useEffect(() => {
    fetchDailyStats();
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDailyStats]);

  // Update wellness stats to reflect the changes
  const getMoodLabel = (score: number): string => {
    if (score <= 20) return "Very low";
    if (score <= 40) return "Low";
    if (score <= 60) return "Neutral";
    if (score <= 80) return "Happy";
    return "Excited";
  };

  /** Maps a mood score (0-100) to the data-mood tier string. */
  const getMoodTier = (score: number): string => {
    if (score <= 20) return "too-low";
    if (score <= 40) return "low";
    if (score <= 60) return "neutral";
    if (score <= 80) return "happy";
    return "excited";
  };

  // Restore persisted mood tier from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("moodTier");
    if (saved && saved !== "neutral") {
      document.documentElement.setAttribute("data-mood", saved);
    }
  }, []);

  // Apply data-mood attribute + persist whenever the live score changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (realtimeData.moodScore === null) return;
    const tier = getMoodTier(realtimeData.moodScore);
    if (tier === "neutral") {
      document.documentElement.removeAttribute("data-mood");
    } else {
      document.documentElement.setAttribute("data-mood", tier);
    }
    localStorage.setItem("moodTier", tier);
    refreshInsights(realtimeData.moodScore);
  }, [realtimeData.moodScore, refreshInsights]);

  const wellnessStats = [
    {
      title: "Mood Score",
      value: realtimeData.moodScore !== null ? <CountUp end={realtimeData.moodScore} suffix="%" duration={1.5} /> : "No data",
      icon: Brain,
      color: "text-[#297194]",
      bgColor: "bg-[#D1E1F7]",
      description: realtimeData.moodScore !== null
        ? `${getMoodLabel(realtimeData.moodScore)} today`
        : "Today's average mood",
    },
    {
      title: "Daily Check-in",
      value: (
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span>{checkinRate.count}/{checkinRate.total}</span>
          <span style={{ fontSize: "13px", opacity: 0.7 }}>days</span>
        </div>
      ),
      icon: Calendar,
      color: "text-[#EC993D]",
      bgColor: "[background:var(--mood-surface)]",
      description: checkinRate.label,
    },
    {
      title: "Therapy Sessions",
      value: <div className="flex items-center gap-1"><CountUp end={realtimeData.therapySessions} duration={1.5} /> <span className="text-sm font-normal">sessions</span></div>,
      icon: Heart,
      color: "text-[#1e5870]",
      bgColor: "[background:var(--mood-surface)]",
      description: "Total sessions completed",
    },
    {
      title: "Total Activities",
      value: <CountUp end={realtimeData.totalActivities} duration={1.5} />,
      icon: Activity,
      color: "text-[#297194]",
      bgColor: "[background:var(--mood-surface)]",
      description: "Planned for today",
    },
  ];

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Add these action handlers
  const logDashboardActivity = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/dashboard/activity`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "default-user" })
      });
      toast.success("Activity logged!", { icon: "✅" });
    } catch (err) { }
  };

  const handleStartTherapy = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/dashboard/session`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "default-user" })
      });
    } catch (err) { }
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/dashboard/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "default-user", moodValue: data.moodScore })
      });
      toast.success("Mood updated successfully!", { icon: "✨" });
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  /**
   * Called by MoodForm immediately after a successful save.
   * Sets the Mood Score card directly to the saved percentage — no page
   * refresh needed. We intentionally skip a background re-fetch here because
   * the backend dashboard aggregate takes time to update and would race-overwrite
   * this optimistic update with stale data.
   */
  const handleMoodSaved = useCallback(
    (newPercentage: number) => {
      setRealtimeData((prev) => ({
        ...prev,
        moodScore: newPercentage,
        lastUpdated: new Date(),
      }));
      // Record today's check-in
      recordDailyCheckin();
      // Update the check-in rate card in real time
      setCheckinRate(getWeeklyCheckinRate());
      refreshInsights(newPercentage);
    },
    []
  );

  const handleAICheckIn = () => {
    logDashboardActivity();
    setShowActivityLogger(true);
  };

  // Add handler for game activities
  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          userId: "default-user",
          type: "game",
          name: gameName,
          description: description,
          duration: 0,
        });

        // Refresh activities after logging
        loadActivities();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );

  // WelcomeSplash must live outside any conditional branch so it is never
  // unmounted when `mounted` flips from false → true.
  if (!mounted) {
    return (
      <>
        <WelcomeSplash firstName={user?.name ? user.name.split(" ")[0] : "there"} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <WelcomeSplash firstName={user?.name ? user.name.split(" ")[0] : "there"} />
      <CrisisSupportModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        emergencyContact={emergencyContact}
        userName={user?.name || ''}
        onStartTherapy={() => router.push('/therapy/new')}
      />
      <div className="min-h-screen bg-background">
        <Container className="pt-20 pb-8 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name || "there"}
              </h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quick Actions Card */}
              <Card className="border-[#D1E1F7] bg-[#ffffff] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full [background:var(--mood-surface)] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#297194]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-[#1a4a5e]">Quick Actions</h3>
                        <p className="text-sm text-muted-foreground">
                          Start your wellness journey
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Button
                        variant="default"
                        className={cn(
                          "w-full justify-between items-center p-6 h-auto group/button",
                          "bg-[#297194] hover:bg-[#1e5870] text-[#ffffff]",
                          "transition-all duration-200 group-hover:translate-y-[-2px]"
                        )}
                        onClick={handleStartTherapy}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-[#ffffff]" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-[#ffffff]">
                              Start Therapy
                            </div>
                            <div className="text-xs text-[#ffffff]/80">
                              Begin a new session
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5 text-[#ffffff]" />
                        </div>
                      </Button>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className={cn(
                            "flex flex-col h-[120px] px-4 py-3 group/mood border-[#D1E1F7] hover:border-[#297194]/50 [background:var(--mood-bg)] hover:[background:var(--mood-surface)]",
                            "justify-center items-center text-center",
                            "transition-all duration-200 group-hover:translate-y-[-2px]"
                          )}
                          onClick={() => setShowMoodModal(true)}
                        >
                          <div className="w-10 h-10 rounded-full [background:var(--mood-surface)] flex items-center justify-center mb-2">
                            <Heart className="w-5 h-5 text-[#297194]" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Track Mood</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              How are you feeling?
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          className={cn(
                            "flex flex-col h-[120px] px-4 py-3 group/ai border-[#D1E1F7] hover:border-[#297194]/50 [background:var(--mood-bg)] hover:[background:var(--mood-surface)]",
                            "justify-center items-center text-center",
                            "transition-all duration-200 group-hover:translate-y-[-2px]"
                          )}
                          onClick={handleAICheckIn}
                        >
                          <div className="w-10 h-10 rounded-full [background:var(--mood-surface)] flex items-center justify-center mb-2">
                            <BrainCircuit className="w-5 h-5 text-[#297194]" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Check-in</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Quick wellness check
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Overview Card */}
              <Card className="border-[#D1E1F7] bg-[#ffffff]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Today's Overview</CardTitle>
                      <CardDescription>
                        Your wellness metrics for{" "}
                        {format(new Date(), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchDailyStats}
                      className="h-8 w-8"
                    >
                      <Loader2 className={cn("h-4 w-4", "animate-spin")} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {wellnessStats.map((stat) => (
                      <div
                        key={stat.title}
                        className={cn(
                          "p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]",
                          stat.bgColor
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon className={cn("w-5 h-5", stat.color)} />
                          <p className="text-sm font-medium">{stat.title}</p>
                        </div>
                        <div className="text-2xl font-bold mt-2">{stat.value}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground text-right relative">
                    <span className="relative z-10 transition-opacity flex items-center justify-end gap-1">
                      Last updated: {format(realtimeData.lastUpdated, "h:mm:ss a")}
                      <span className="flex rounded-full bg-[rgba(236,153,61,0.2)] px-1.5 py-0.5 animate-pulse text-[10px] text-[#EC993D] font-bold ml-1">LIVE</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Insights Card */}
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your activity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Suggestion card */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: '#e2e8f0', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {insights.suggestion.type === 'game' ? '🎮' : '✦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                            {insights.suggestion.title}
                          </h4>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                          {insights.suggestion.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                          {insights.suggestion.duration && (
                            <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                              ⏱ {insights.suggestion.duration}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const target = insights.suggestion.actionTarget;
                            if (!target) return;

                            if (target.startsWith('modal:')) {
                              const modalName = target.replace('modal:', '');

                              switch (modalName) {
                                case 'breathing':
                                  setExternalGame('breathing');
                                  document.getElementById('anxiety-activities')?.scrollIntoView({ behavior: 'smooth' });
                                  break;
                                case 'ocean-waves':
                                  setExternalGame('waves');
                                  document.getElementById('anxiety-activities')?.scrollIntoView({ behavior: 'smooth' });
                                  break;
                                case 'mindful-forest':
                                  setExternalGame('forest');
                                  document.getElementById('anxiety-activities')?.scrollIntoView({ behavior: 'smooth' });
                                  break;
                                case 'zen-garden':
                                  setExternalGame('garden');
                                  document.getElementById('anxiety-activities')?.scrollIntoView({ behavior: 'smooth' });
                                  break;
                                case 'support':
                                  setShowCrisisModal(true);
                                  break;
                              }
                            } else if (target.startsWith('/games/')) {
                              const gameRoutes: Record<string, string> = {
                                'Memory Tiles': '/games/memory-tiles',
                                'Reaction Challenge': '/games/reaction-challenge',
                                'Falling Leaves': '/games/falling-leaves',
                                'Bubble Pop': '/games/bubble-pop',
                              };
                              const route = gameRoutes[insights.suggestion.title];
                              if (route) {
                                router.push(route);
                              } else {
                                toast('Coming soon — this feature is being built!', { icon: '🚧' });
                              }
                            } else if (target.startsWith('/activities/')) {
                              toast('Coming soon — this feature is being built!', { icon: '🚧' });
                            } else {
                              try {
                                router.push(target);
                              } catch (e) {
                                toast('Coming soon — this feature is being built!', { icon: '🚧' });
                              }
                            }
                          }}
                          style={{
                            width: '100%', background: '#2563a8', color: '#fff',
                            border: 'none', borderRadius: '7px', padding: '6px 10px',
                            fontSize: '11px', fontWeight: 500, cursor: 'pointer'
                          }}
                        >
                          {insights.suggestion.actionLabel}
                        </button>
                      </div>
                    </div>

                    {/* Affirmation or Therapist Tip */}
                    <div style={{ background: insights.secondItem.type === 'tip' ? '#f0fdf4' : '#fffbeb', border: `1px solid ${insights.secondItem.type === 'tip' ? '#bbf7d0' : '#fef3c7'}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: insights.secondItem.type === 'tip' ? '#166534' : '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {insights.secondItem.type === 'tip' ? '💡 Therapist tip' : '🌱 Affirmation'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#334155', lineHeight: 1.4, fontStyle: 'italic' }}>
                        "{insights.secondItem.text}"
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left side - Spans 2 columns */}
              <div id="anxiety-activities" className="lg:col-span-3 space-y-6">
                {/* Anxiety Games - Now directly below Fitbit */}
                <AnxietyGames
                  onGamePlayed={handleGamePlayed}
                  externalActiveGame={externalGame}
                  onExternalGameHandled={() => setExternalGame(null)}
                />
                
                {/* Calming Mini-Games */}
                <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden transition-all duration-300">
                  <CardHeader className="pb-3 border-b border-slate-50/50 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#f0f6fc] rounded-lg">
                        <span className="text-xl">🍃</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-[#1e3a5f]">Calming Wellness Games</CardTitle>
                        <CardDescription className="text-[13px] text-slate-500">Low-pressure, touch-based games to help you unwind and focus.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Game 1 */}
                      <div 
                        onClick={() => router.push('/games/falling-leaves')}
                        className="group relative flex flex-col items-center justify-center p-6 border border-[#e2eaf4] rounded-xl bg-white hover:bg-[#f0f6fc] hover:border-[#2563a8] hover:shadow-[0_4px_16px_rgba(37,99,168,0.10)] hover:-translate-y-[2px] cursor-pointer transition-all duration-200"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-3xl">🍂</span>
                        </div>
                        <h3 className="font-semibold text-[#1e3a5f] mb-1">Falling Leaves</h3>
                        <p className="text-xs text-slate-500 text-center">Gently catch the falling leaves. No rush, no pressure.</p>
                      </div>
                      
                      {/* Game 2 */}
                      <div 
                        onClick={() => router.push('/games/bubble-pop')}
                        className="group relative flex flex-col items-center justify-center p-6 border border-[#e2eaf4] rounded-xl bg-white hover:bg-[#f0f6fc] hover:border-[#2563a8] hover:shadow-[0_4px_16px_rgba(37,99,168,0.10)] hover:-translate-y-[2px] cursor-pointer transition-all duration-200"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-3xl">🫧</span>
                        </div>
                        <h3 className="font-semibold text-[#1e3a5f] mb-1">Bubble Pop</h3>
                        <p className="text-xs text-slate-500 text-center">Pop the bubbles at your own pace. Just breathe and tap.</p>
                      </div>
                      
                      {/* Game 3 */}
                      <div 
                        onClick={() => router.push('/games/memory-tiles')}
                        className="group relative flex flex-col items-center justify-center p-6 border border-[#e2eaf4] rounded-xl bg-white hover:bg-[#f0f6fc] hover:border-[#2563a8] hover:shadow-[0_4px_16px_rgba(37,99,168,0.10)] hover:-translate-y-[2px] cursor-pointer transition-all duration-200"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-3xl">🧩</span>
                        </div>
                        <h3 className="font-semibold text-[#1e3a5f] mb-1">Memory Tiles</h3>
                        <p className="text-xs text-slate-500 text-center">Flip tiles and find matching pairs. A gentle brain workout.</p>
                      </div>
                      
                      {/* Game 4 */}
                      <div 
                        onClick={() => router.push('/games/reaction-challenge')}
                        className="group relative flex flex-col items-center justify-center p-6 border border-[#e2eaf4] rounded-xl bg-white hover:bg-[#f0f6fc] hover:border-[#2563a8] hover:shadow-[0_4px_16px_rgba(37,99,168,0.10)] hover:-translate-y-[2px] cursor-pointer transition-all duration-200"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-3xl">⚡</span>
                        </div>
                        <h3 className="font-semibold text-[#1e3a5f] mb-1">Reaction Challenge</h3>
                        <p className="text-xs text-slate-500 text-center">Tap the circle as fast as you can. Light, fun, satisfying.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer Area */}
            <div className="mt-12 mb-4 text-center">
              <button
                onClick={() => setShowCrisisModal(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: '#6b7280',
                  textDecoration: 'underline', textDecorationStyle: 'dotted'
                }}
              >
                🤝 Need support? Crisis helplines available 24/7
              </button>
            </div>
          </div>
        </Container>

        {/* Mood tracking modal */}
        <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>How are you feeling?</DialogTitle>
              <DialogDescription>
                Move the slider to track your current mood
              </DialogDescription>
            </DialogHeader>
            <MoodForm
              onSuccess={() => setShowMoodModal(false)}
              onMoodSaved={handleMoodSaved}
            />
          </DialogContent>
        </Dialog>

        {/* AI check-in chat */}
        {showCheckInChat && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-semibold">AI Check-in</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCheckInChat(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4"></div>
              </div>
            </div>
          </div>
        )}

        <ActivityLogger
          open={showActivityLogger}
          onOpenChange={setShowActivityLogger}
          onActivityLogged={loadActivities}
        />
      </div>
    </>
  );
}
