interface ActivityEntry {
  type: string;
  name: string;
  description?: string;
  duration?: number;
}

import apiClient from "./client";

export async function logActivity(
  data: ActivityEntry
): Promise<{ success: boolean; data: any }> {
  try {
    const response = await apiClient.post("/activity", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to log activity");
  }
}
