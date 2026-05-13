import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      console.error("generate-story: No GROQ_API_KEY found in environment");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `Write a short, moving motivational story (220–260 words) about ${topic}.

Structure it exactly like this:

TITLE: [A short, emotional Hindi-English mixed title — example: "Ek Nayi Subah" or "The Last Chai" or "Ruk Mat Priya"]

STORY:
[The full story here]

MORAL:
[One powerful sentence — written like a wise elder is speaking directly to the reader. Start with "Remember:" or "Yaad rakhna:" — make it feel personal, not like a textbook quote]

Rules for the story:
- Set it in India — real places like a small Punjab town, Mumbai chawl, Rajasthan village, railway platform, government school, chai ki dukan, joint family home
- Main character must have a real Indian name — Priya, Arjun, Meera, Ravi, Sunita, Kavya, Ramesh, Fatima, Gurpreet, Ananya
- Include small authentic Indian details that feel real — a steel tiffin dabba, maa ki chai, pressure cooker whistle, monsoon rain on tin roof, auto-rickshaw, dadi ki baat, hand-written letter, a dupatta, a corner paan shop — only what fits naturally
- The struggle must feel like something a real Indian middle-class or working-class person actually goes through — job pressure, family expectations, financial stress, self-doubt, loneliness, exhaustion
- The turning point must be quiet and human — a dadi's one line, a stranger's small act, a childhood memory that resurfaces, a moment alone in the rain
- The reader must feel: "this could be me" — write it so they forget they are reading fiction
- Ending must feel earned and genuinely hopeful — not fake, not preachy
- Write in warm simple English with natural Hindi words mixed in where it feels right (like maa, dadi, yaar, bas, chalo, theek hai)
- The moral must directly address the reader's real problem — if they are anxious, speak to their anxiety; if they feel low, speak to their sadness; make it feel like the story was written just for them`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("generate-story: Groq API error:", response.status, JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: "Groq API error" }, { status: 500 });
    }

    const story = data.choices?.[0]?.message?.content;
    if (!story) {
      console.error("generate-story: No story in response:", JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: "No story in response" }, { status: 500 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("generate-story error:", error);
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
  }
}
