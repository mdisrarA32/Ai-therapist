import apiClient from "./client";

interface MoodEntry {
  score: number;
  note?: string;
}

interface MoodStats {
  average: number;
  count: number;
  highest: number;
  lowest: number;
  history: Array<{
    _id: string;
    score: number;
    note?: string;
    timestamp: string;
  }>;
}

export async function trackMood(
  data: MoodEntry
): Promise<{ success: boolean; data: any }> {
  try {
    const response = await apiClient.post("/mood", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to track mood");
  }
}

export async function getMoodHistory(params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<{ success: boolean; data: any[] }> {
  try {
    const response = await apiClient.get("/mood/history", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch mood history");
  }
}

export async function getMoodStats(
  period: "week" | "month" | "year" = "week"
): Promise<{
  success: boolean;
  data: MoodStats;
}> {
  try {
    const response = await apiClient.get("/mood/stats", { params: { period } });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch mood statistics");
  }
}
