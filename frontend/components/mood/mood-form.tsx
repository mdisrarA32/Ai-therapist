"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface MoodFormProps {
  onSuccess?: () => void;
  /** Called with the saved mood percentage (0-100) immediately after a successful save */
  onMoodSaved?: (percentage: number) => void;
}

// Maps the 5 mood positions to display percentages
const MOOD_PERCENTAGES = [10, 30, 50, 75, 100] as const;

export function MoodForm({ onSuccess, onMoodSaved }: MoodFormProps) {
  // Index into MOOD_PERCENTAGES (0 = Very Low, 4 = Excited)
  const [moodIndex, setMoodIndex] = useState(2); // default: Neutral → 50%
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

  const moodPercentage = MOOD_PERCENTAGES[moodIndex];

  const emotions = [
    { index: 0, label: "😔", description: "Very Low",  percentage: 10  },
    { index: 1, label: "😕", description: "Low",       percentage: 30  },
    { index: 2, label: "😊", description: "Neutral",   percentage: 50  },
    { index: 3, label: "😃", description: "Happy",     percentage: 75  },
    { index: 4, label: "🤗", description: "Excited",   percentage: 100 },
  ];

  const currentEmotion = emotions[moodIndex];

  const handleSubmit = async () => {
    console.log("MoodForm: Starting submission");
    console.log("MoodForm: Auth state:", { isAuthenticated, loading, user });

    if (!isAuthenticated) {
      console.log("MoodForm: User not authenticated");
      toast({
        title: "Authentication required",
        description: "Please log in to track your mood",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      // Save the percentage value (10/30/50/75/100) to the backend
      const response = await apiClient.post("/mood", { score: moodPercentage });
      console.log("MoodForm: Response status:", response.status);

      const data = response.data;
      console.log("MoodForm: Success response:", data);

      toast({
        title: "Mood tracked successfully!",
        description: `Mood saved as ${moodPercentage}% (${currentEmotion.description}).`,
      });

      // Notify the dashboard with the actual percentage so it can update instantly
      onMoodSaved?.(moodPercentage);
      // Close the modal
      onSuccess?.();
    } catch (error) {
      console.error("MoodForm: Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to track mood",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.index}
              className={`cursor-pointer transition-opacity ${
                moodIndex === em.index ? "opacity-100" : "opacity-50"
              }`}
              onClick={() => setMoodIndex(em.index)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        {/* 5-step slider snapping to the 5 positions */}
        <Slider
          value={[moodIndex]}
          onValueChange={(value) => setMoodIndex(value[0])}
          min={0}
          max={4}
          step={1}
          className="py-4"
        />
        <p className="text-xs text-center text-muted-foreground">
          Score: {moodPercentage}%
        </p>
      </div>

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
}
