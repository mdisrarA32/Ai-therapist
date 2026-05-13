"use client";

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

type Mood = "all" | "anxiety" | "depression" | "sleep" | "motivation";

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  mood: string;
  accent: string;
  letter: string;
  summary: string;
  pages: number;
  tags: Mood[];
}

const BOOKS: Book[] = [
  {
    id: 1,
    title: "The Anxiety & Worry Workbook",
    author: "Clark & Beck",
    year: 2011,
    mood: "Anxiety & Stress",
    accent: "#0891b2",
    letter: "A",
    summary:
      "A research-backed, step-by-step workbook grounded in Cognitive Behavioral Therapy. Clark and Beck guide you through identifying worry triggers, challenging catastrophic thoughts, and building lasting coping skills — all with practical exercises you can do at your own pace.",
    pages: 374,
    tags: ["anxiety"],
  },
  {
    id: 2,
    title: "Feeling Good",
    author: "David D. Burns",
    year: 1999,
    mood: "Depression",
    accent: "#d97706",
    letter: "F",
    summary:
      "One of the most widely read self-help books in history, Feeling Good introduces cognitive distortions — the subtle lies depression tells us — and gives you concrete tools to rewrite them. Burns' compassionate, clinical approach has helped millions lift themselves out of low moods without medication.",
    pages: 736,
    tags: ["depression"],
  },
  {
    id: 3,
    title: "Why We Sleep",
    author: "Matthew Walker",
    year: 2017,
    mood: "Sleep & Rest",
    accent: "#7c3aed",
    letter: "W",
    summary:
      "Neuroscientist Matthew Walker reveals the surprising science behind what happens while you sleep — memory consolidation, emotional regulation, immune function — and why our modern world conspires against it. Both eye-opening and actionable for anyone struggling with rest.",
    pages: 368,
    tags: ["sleep"],
  },
  {
    id: 4,
    title: "The Mountain Is You",
    author: "Brianna Wiest",
    year: 2020,
    mood: "Motivation & Depression",
    accent: "#059669",
    letter: "M",
    summary:
      "Wiest writes about self-sabotage with rare honesty — why we stand in our own way, how trauma shapes our comfort zones, and what it takes to genuinely transform. This isn't a quick-fix book; it's a deeply human exploration of becoming who you're afraid to be.",
    pages: 240,
    tags: ["motivation", "depression"],
  },
  {
    id: 5,
    title: "Full Catastrophe Living",
    author: "Jon Kabat-Zinn",
    year: 2013,
    mood: "Anxiety & Sleep",
    accent: "#0891b2",
    letter: "F",
    summary:
      "The foundational text on Mindfulness-Based Stress Reduction (MBSR), developed at the University of Massachusetts Medical School. Kabat-Zinn shows how present-moment awareness can ease chronic pain, anxiety, and sleeplessness — with decades of clinical evidence behind it.",
    pages: 720,
    tags: ["anxiety", "sleep"],
  },
  {
    id: 6,
    title: "The Miracle Morning",
    author: "Hal Elrod",
    year: 2012,
    mood: "Motivation",
    accent: "#059669",
    letter: "T",
    summary:
      "Hal Elrod rebuilt his life after a near-fatal accident by designing a morning routine built on six habits: Silence, Affirmations, Visualisation, Exercise, Reading, and Scribing. A practical, energising read for anyone who wants to take control of how their day begins.",
    pages: 208,
    tags: ["motivation"],
  },
];

const MOOD_FILTERS: { label: string; value: Mood }[] = [
  { label: "All", value: "all" },
  { label: "Anxiety & Stress", value: "anxiety" },
  { label: "Depression", value: "depression" },
  { label: "Sleep & Rest", value: "sleep" },
  { label: "Motivation", value: "motivation" },
];

type StoryMood = "anxious" | "low" | "sleep" | "motivation";

const STORY_MOODS: { label: string; value: StoryMood; topic: string }[] = [
  {
    label: "Feeling anxious",
    value: "anxious",
    topic: "overcoming anxiety and finding calm in chaos",
  },
  {
    label: "Feeling low",
    value: "low",
    topic: "rediscovering small joys after a dark period",
  },
  {
    label: "Can't sleep",
    value: "sleep",
    topic: "learning to let go of the day and embrace rest",
  },
  {
    label: "Need motivation",
    value: "motivation",
    topic: "rising above self-doubt to take the first courageous step",
  },
];

const ARTICLES = [
  {
    id: "1",
    type: "personal",
    title: "I Hid My Depression for 3 Years — Here's What Finally Helped",
    source: "Medium",
    author: "Ananya Sharma",
    summary: "A 26-year-old software engineer from Bengaluru shares how she smiled at work every day while falling apart inside — and the one conversation with her mother that changed everything.",
    tag: "Depression",
    tagColor: "#d97706",
    readTime: "6 min read",
    url: "https://medium.com/invisible-illness/living-with-depression-while-appearing-fine-7e2e1b9c3a1d",
    gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
    letter: "A",
    accentColor: "#d97706",
  },
  {
    id: "2",
    type: "published",
    title: "How Mindfulness Helped Me Survive My Anxiety Disorder",
    source: "The Hindu",
    author: "Priya Menon",
    summary: "A Mumbai-based journalist describes her two-year battle with panic attacks and how a simple 10-minute daily practice slowly brought her back to herself.",
    tag: "Anxiety",
    tagColor: "#0891b2",
    readTime: "8 min read",
    url: "https://www.thehindu.com/sci-tech/health/how-mindfulness-changed-my-life/article32871234.ece",
    gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    letter: "P",
    accentColor: "#0891b2",
  },
  {
    id: "3",
    type: "personal",
    title: "Losing My Job at 32 Almost Broke Me — Almost",
    source: "YourStory",
    author: "Rahul Verma",
    summary: "After being laid off during the pandemic, a Delhi man hit rock bottom. This is his honest account of depression, shame, and the slow road back to finding purpose.",
    tag: "Motivation",
    tagColor: "#059669",
    readTime: "7 min read",
    url: "https://yourstory.com/2021/04/mental-health-layoff-recovery-story",
    gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    letter: "R",
    accentColor: "#059669",
  },
  {
    id: "4",
    type: "published",
    title: "India's Silent Mental Health Crisis: Stories From the Inside",
    source: "NDTV",
    author: "NDTV Health Desk",
    summary: "Real accounts from five Indians across different cities who sought help for anxiety and depression — and why they say asking for help was the bravest thing they ever did.",
    tag: "Anxiety & Depression",
    tagColor: "#7c3aed",
    readTime: "10 min read",
    url: "https://www.ndtv.com/health/mental-health-personal-stories-india-2021",
    gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    letter: "N",
    accentColor: "#7c3aed",
  },
  {
    id: "5",
    type: "personal",
    title: "Meri Neend Wapas Aayi — How I Fixed 4 Years of Insomnia",
    source: "iDiva",
    author: "Sunita Kapoor",
    summary: "A Jaipur homemaker and mother of two shares the practical and emotional journey of reclaiming her sleep — and her sanity — after years of sleepless nights and exhaustion.",
    tag: "Sleep",
    tagColor: "#7c3aed",
    readTime: "5 min read",
    url: "https://www.idiva.com/wellness/mental-health/my-insomnia-story-how-i-finally-slept/18008888",
    gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    letter: "S",
    accentColor: "#7c3aed",
  },
  {
    id: "6",
    type: "published",
    title: "When Therapy Changed My Life: A First-Timer's Honest Account",
    source: "Hindustan Times",
    author: "Kavya Nair",
    summary: "A Kerala woman describes her fear, shame, and eventual relief around seeing a therapist for the first time — and why she wishes she had done it years earlier.",
    tag: "Personal Story",
    tagColor: "#0891b2",
    readTime: "9 min read",
    url: "https://www.hindustantimes.com/lifestyle/health/therapy-first-time-experience-mental-health-india",
    gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    letter: "K",
    accentColor: "#0891b2",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<Mood>("all");
  const [expandedBook, setExpandedBook] = useState<number | null>(null);
  const [activeMood, setActiveMood] = useState<StoryMood | null>(null);
  const [story, setStory] = useState<string>("");
  const [storyLoading, setStoryLoading] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  const filteredBooks =
    activeFilter === "all"
      ? BOOKS
      : BOOKS.filter((b) => b.tags.includes(activeFilter));

  const generateStory = async (topic: string): Promise<string> => {
    const res = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.story;
  };

  const handleMoodSelect = async (mood: StoryMood, topic: string) => {
    setActiveMood(mood);
    setStory("");
    setStoryLoading(true);
    try {
      const text = await generateStory(topic);
      setStory(text || "Something went wrong. Please try again.");
    } catch {
      setStory("Unable to generate a story right now. Please try again.");
    } finally {
      setStoryLoading(false);
    }
  };

  const handleGenerateAnother = () => {
    if (!activeMood) return;
    const moodObj = STORY_MOODS.find((m) => m.value === activeMood);
    if (moodObj) handleMoodSelect(moodObj.value, moodObj.topic);
  };

  const parseStory = (raw: string) => {
    const titleMatch = raw.match(/TITLE:\s*(.+)/);
    const storyMatch = raw.match(/STORY:\s*([\s\S]+?)(?=MORAL:|$)/);
    const moralMatch = raw.match(/MORAL:\s*([\s\S]+?)$/);
    return {
      title: titleMatch?.[1]?.trim() || "",
      storyBody: storyMatch?.[1]?.trim() || raw,
      moral: moralMatch?.[1]?.trim() || "",
    };
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: "#1a3a4a", minHeight: "100vh", background: "linear-gradient(135deg, #e8f4fd 0%, #E7F2F7 50%, #d4ecf7 100%)" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #e8f4fd 0%, #E7F2F7 50%, #d4ecf7 100%)",
          paddingTop: "7rem",
          paddingBottom: "4.5rem",
          textAlign: "center",
          borderBottom: "1px solid #D1E1F7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative radial glow — same as homepage hero */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(41,113,148,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem", position: "relative" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#297194",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Mental Health Library
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              color: "#1a3a4a",
              lineHeight: 1.2,
              marginBottom: "1.25rem",
            }}
          >
            Words that help you heal.
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#4a7a94", lineHeight: 1.7, maxWidth: "540px", margin: "0 auto" }}>
            Carefully chosen books and AI-written stories — matched to what you&apos;re going through right now.
          </p>
        </div>
      </section>

      {/* ── Books Section ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem" }}>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#1a3a4a",
          }}
        >
          Recommended Books
        </h2>

        {/* Mood filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
          {MOOD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 500,
                cursor: "pointer",
                border: `1px solid #D1E1F7`,
                backgroundColor: activeFilter === f.value ? "#297194" : "#ffffff",
                color: activeFilter === f.value ? "#ffffff" : "#297194",
                transition: "all 0.18s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Book grid — individual rounded cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredBooks.map((book) => {
            const isOpen = expandedBook === book.id;
            return (
              <div
                key={book.id}
                onClick={() => setExpandedBook(isOpen ? null : book.id)}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #D1E1F7",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#E7F2F7")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#ffffff")}
              >
                {/* Spine + title row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "68px",
                      borderRadius: "4px",
                      backgroundColor: book.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 700 }}>
                      {book.letter}
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#1a3a4a",
                        lineHeight: 1.35,
                        marginBottom: "0.3rem",
                      }}
                    >
                      {book.title}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#4a7a94" }}>
                      {book.author} · {book.year}
                    </p>
                  </div>
                </div>

                {/* Mood tag */}
                <p
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: book.accent,
                    fontWeight: 600,
                    marginBottom: isOpen ? "1rem" : 0,
                  }}
                >
                  {book.mood}
                </p>

                {/* Expanded content */}
                {isOpen && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontSize: "0.88rem", color: "#334e5e", lineHeight: 1.75, marginBottom: "1rem" }}>
                      {book.summary}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#4a7a94", marginBottom: "0.75rem" }}>
                      {book.pages} pages
                    </p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.author + " book")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#297194",
                        textDecoration: "none",
                        borderBottom: "1px solid #297194",
                        paddingBottom: "1px",
                      }}
                    >
                      Find this book →
                    </a>
                  </div>
                )}

                {/* Expand hint */}
                {!isOpen && (
                  <p style={{ fontSize: "0.72rem", color: "#aac4d4", marginTop: "0.5rem" }}>
                    Click to read more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Articles Section ────────────────────────────────────────────── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        {/* Section header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#297194",
            margin: "0 0 8px", fontFamily: "system-ui, sans-serif",
          }}>
            Real Stories
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 700,
              color: "#1a3a4a", margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em",
            }}>
              People who made it through.<br />Just like you can.
            </h2>
            <input
              type="text"
              placeholder="Search articles..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              style={{
                padding: "10px 18px", borderRadius: 999,
                border: "1.5px solid #D1E1F7", background: "#fff",
                fontSize: 14, color: "#1a3a4a", outline: "none",
                fontFamily: "system-ui, sans-serif", width: 220,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#297194"; }}
              onBlur={(e) => { e.target.style.borderColor = "#D1E1F7"; }}
            />
          </div>
          <div style={{ height: 1, background: "#ddeef8", marginTop: 24 }} />
        </div>

        {/* Article card grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {ARTICLES
            .filter(a =>
              articleSearch === "" ||
              a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
              a.summary.toLowerCase().includes(articleSearch.toLowerCase()) ||
              a.tag.toLowerCase().includes(articleSearch.toLowerCase())
            )
            .map((article) => (
              <div
                key={article.id}
                style={{
                  background: "#fff",
                  border: "1px solid #D1E1F7",
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(41,113,148,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Card top banner */}
                <div style={{
                  height: 80, background: article.gradient,
                  display: "flex", alignItems: "center",
                  padding: "0 20px", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: article.accentColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 700, color: "#fff",
                    fontFamily: "Georgia, serif", flexShrink: 0,
                  }}>
                    {article.letter}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: article.accentColor,
                      fontFamily: "system-ui, sans-serif",
                    }}>
                      {article.tag}
                    </div>
                    <div style={{
                      fontSize: 12, color: "#4a7a94",
                      fontFamily: "system-ui, sans-serif", marginTop: 2,
                    }}>
                      {article.source} · {article.type === "personal" ? "Personal Story" : "Published Article"}
                    </div>
                  </div>
                </div>

                {/* Card content */}
                <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{
                    fontSize: 16, fontWeight: 700, color: "#0f2433",
                    margin: "0 0 10px", lineHeight: 1.4,
                    fontFamily: "Georgia, serif",
                  }}>
                    {article.title}
                  </h3>
                  <p style={{
                    fontSize: 13, color: "#4a7a94", lineHeight: 1.7,
                    margin: "0 0 20px", fontFamily: "system-ui, sans-serif",
                    flex: 1,
                  }}>
                    {article.summary}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#9dbfcc", fontFamily: "system-ui, sans-serif" }}>
                      {article.readTime} · by {article.author}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13, fontWeight: 600, color: "#297194",
                        textDecoration: "none", borderBottom: "1.5px solid #297194",
                        paddingBottom: 1, fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      Read story →
                    </a>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* No results */}
        {ARTICLES.filter(a =>
          articleSearch === "" ||
          a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
          a.summary.toLowerCase().includes(articleSearch.toLowerCase()) ||
          a.tag.toLowerCase().includes(articleSearch.toLowerCase())
        ).length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9dbfcc" }}>
            <p style={{ fontSize: 15, fontFamily: "system-ui, sans-serif" }}>
              No articles found for &ldquo;{articleSearch}&rdquo;
            </p>
          </div>
        )}
      </section>

      {/* ── AI Story Generator ────────────────────────────────────────────── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #D1E1F7",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Section header */}
          <div style={{ padding: "2rem 2rem 0" }}>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "#1a3a4a",
              }}
            >
              A story written just for you.
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#4a7a94", marginBottom: "2rem", lineHeight: 1.65 }}>
              Tell us how you&apos;re feeling and our AI will write a short, personal story to help you through it.
            </p>
          </div>

          {/* Split panel */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              borderTop: "1px solid #D1E1F7",
              minHeight: "320px",
            }}
          >
            {/* Left — mood buttons */}
            <div
              style={{
                backgroundColor: "#E7F2F7",
                padding: "2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                borderRight: "1px solid #D1E1F7",
              }}
            >
              {STORY_MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleMoodSelect(m.value, m.topic)}
                  style={{
                    padding: "0.85rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #D1E1F7",
                    backgroundColor: activeMood === m.value ? "#297194" : "#ffffff",
                    color: activeMood === m.value ? "#ffffff" : "#297194",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Right — story panel */}
            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "320px", backgroundColor: "#ffffff" }}>
              {!activeMood && !storyLoading && (
                <div style={{ textAlign: "center", color: "#aac4d4" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1E1F7" strokeWidth="1.5" style={{ margin: "0 auto 1rem" }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <p style={{ fontSize: "0.88rem", color: "#4a7a94" }}>Choose a mood on the left to get your story</p>
                </div>
              )}

              {storyLoading && (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "3px solid #D1E1F7",
                      borderTopColor: "#297194",
                      borderRadius: "50%",
                      margin: "0 auto",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {story && !storyLoading && (() => {
                const { title, storyBody, moral } = parseStory(story);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Title */}
                    {title && (
                      <div style={{ borderLeft: "3px solid #297194", paddingLeft: 14 }}>
                        <p style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                          textTransform: "uppercase", color: "#297194",
                          margin: "0 0 4px", fontFamily: "system-ui, sans-serif",
                        }}>
                          Story Title
                        </p>
                        <h4 style={{
                          fontSize: 20, fontWeight: 700, color: "#0f2433",
                          margin: 0, fontFamily: "Georgia, serif", lineHeight: 1.3,
                        }}>
                          {title}
                        </h4>
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: "#e8f2fa" }} />

                    {/* Story body */}
                    <div style={{
                      fontSize: 15, lineHeight: 1.9, color: "#1a3a4a",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      whiteSpace: "pre-wrap",
                    }}>
                      <span style={{
                        fontSize: 56, lineHeight: 0.7, color: "#d1e8f5",
                        float: "left", marginRight: 6, marginTop: 8,
                        fontFamily: "Georgia, serif", userSelect: "none",
                      }}>
                        &ldquo;
                      </span>
                      {storyBody}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#e8f2fa" }} />

                    {/* Moral */}
                    {moral && (
                      <div style={{
                        background: "#E7F2F7",
                        border: "1px solid #D1E1F7",
                        borderRadius: 12,
                        padding: "16px 20px",
                      }}>
                        <p style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                          textTransform: "uppercase", color: "#297194",
                          margin: "0 0 6px", fontFamily: "system-ui, sans-serif",
                        }}>
                          Moral of the Story
                        </p>
                        <p style={{
                          fontSize: 15, color: "#1a3a4a", margin: 0,
                          fontFamily: "Georgia, serif", lineHeight: 1.7,
                          fontStyle: "italic", fontWeight: 500,
                        }}>
                          {moral}
                        </p>
                      </div>
                    )}

                    {/* Generate another */}
                    <div style={{ textAlign: "right" }}>
                      <button
                        onClick={handleGenerateAnother}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "0.82rem", fontWeight: 600, color: "#297194",
                          textDecoration: "underline", textUnderlineOffset: "3px",
                        }}
                      >
                        Generate another →
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer rendered by app/layout.tsx ── */}
    </div>
  );
}
