import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://ai-therapist-agent-backend.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Forward the SOS request to the backend Express server
    // Note: The backend route expects an authenticated request with auth header.
    // However, we just pass the userId in the body, and the backend handleSOS handles it.
    // To properly authenticate the backend request, we need the Authorization header from the client.
    const authHeader = req.headers.get("authorization");

    const response = await fetch(`${BACKEND_API_URL}/chat/sos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[SOS API] Backend error:", error);
      return NextResponse.json(
        { error: "Failed to trigger SOS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SOS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to trigger SOS" },
      { status: 500 }
    );
  }
}
