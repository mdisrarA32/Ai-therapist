import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/mood/today
 *
 * Returns today's average mood score for the authenticated user.
 * Response shape: { averageScore: number, entries: number }
 *
 * - averageScore is a value 0–100 (percentage)
 * - If no mood entries exist today, averageScore defaults to 50 (neutral)
 */
export async function GET(req: NextRequest) {
  const API_URL =
    process.env.BACKEND_API_URL ||
    "https://ai-therapist-agent-backend.onrender.com";
  const token = req.headers.get("Authorization");

  if (!token) {
    // Not authenticated — return neutral default, not an error
    return NextResponse.json({ averageScore: 50, entries: 0 }, { status: 200 });
  }

  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0, 0, 0, 0
    ).toISOString();
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23, 59, 59, 999
    ).toISOString();

    // Try fetching today's mood entries from the backend
    const response = await fetch(
      `${API_URL}/api/mood/history?startDate=${startOfDay}&endDate=${endOfDay}&limit=100`,
      {
        headers: { Authorization: token },
      }
    );

    if (!response.ok) {
      // Backend route may not support the query params yet — return neutral default
      return NextResponse.json({ averageScore: 50, entries: 0 }, { status: 200 });
    }

    const data = await response.json();

    // Backend may return { data: [...] } or a raw array
    const entries: { score: number }[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    if (entries.length === 0) {
      return NextResponse.json({ averageScore: 50, entries: 0 }, { status: 200 });
    }

    // Calculate average and clamp to 0–100
    const sum = entries.reduce((acc, e) => acc + (e.score ?? 0), 0);
    const average = Math.round(sum / entries.length);
    const clamped = Math.max(0, Math.min(100, average));

    return NextResponse.json(
      { averageScore: clamped, entries: entries.length },
      { status: 200 }
    );
  } catch {
    // Network / parse error — return neutral default gracefully
    return NextResponse.json({ averageScore: 50, entries: 0 }, { status: 200 });
  }
}
