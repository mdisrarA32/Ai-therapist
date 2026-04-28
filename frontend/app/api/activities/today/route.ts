import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const API_URL =
    process.env.BACKEND_API_URL ||
    "https://ai-therapist-agent-backend.onrender.com";
  const token = req.headers.get("Authorization");

  // No token — return empty data gracefully (dashboard shows 0, no crash)
  if (!token) {
    return NextResponse.json({ count: 0, activities: [] }, { status: 200 });
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

    const response = await fetch(
      `${API_URL}/api/activity/today?start=${startOfDay}&end=${endOfDay}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      // Backend route may not exist yet — return empty data, not an error
      return NextResponse.json({ count: 0, activities: [] }, { status: 200 });
    }

    const data = await response.json();

    // Normalise whatever shape the backend returns into { count, activities }
    const activities = Array.isArray(data)
      ? data
      : Array.isArray(data?.activities)
      ? data.activities
      : [];

    return NextResponse.json(
      { count: activities.length, activities },
      { status: 200 }
    );
  } catch {
    // Any network / parse error — return empty gracefully
    return NextResponse.json({ count: 0, activities: [] }, { status: 200 });
  }
}
