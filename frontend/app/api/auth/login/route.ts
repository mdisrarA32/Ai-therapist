import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Ensure we use 127.0.0.1 for local development to avoid IPv6 issues
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // Handle non-JSON response (e.g. 500 html page)
      const text = await res.text();
      console.error("Backend returned non-JSON response:", text);
      return NextResponse.json(
        { message: `Backend error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Login API route error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { message: "Server connection failed", error: errorMessage },
      { status: 500 }
    );
  }
}
