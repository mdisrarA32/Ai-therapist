"use client";

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

type Mood = "all" | "anxiety" | "depression" | "sleep" | "motivation";

interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  mood: string | string[];
  accent: string;
  letter: string;
  summary: string;
  pages: string;
  tag: string;
  tags?: Mood[];
  isFree?: boolean;
  freeUrl?: string;
}

const BOOKS: Book[] = [
  {
    id: "1",
    title: "The Anxiety & Worry Workbook",
    author: "Clark & Beck",
    mood: "Anxiety & Stress",
    summary: "Evidence-based cognitive techniques to break free from worry cycles and find lasting calm in everyday life.",
    pages: "376 pages", year: "2011", tag: "Anxiety & Stress",
    accent: "#0891b2", letter: "A",
    tags: ["anxiety"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "2",
    title: "Feeling Good",
    author: "David D. Burns",
    mood: "Depression",
    summary: "The clinically proven CBT program that has helped millions overcome depression — without medication.",
    pages: "736 pages", year: "1999", tag: "Depression",
    accent: "#d97706", letter: "F",
    tags: ["depression"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "3",
    title: "Why We Sleep",
    author: "Matthew Walker",
    mood: "Sleep & Rest",
    summary: "A groundbreaking exploration of sleep's extraordinary role in our health, creativity, and emotional balance.",
    pages: "368 pages", year: "2017", tag: "Sleep & Rest",
    accent: "#7c3aed", letter: "W",
    tags: ["sleep"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "4",
    title: "The Mountain Is You",
    author: "Brianna Wiest",
    mood: "Motivation & Depression",
    summary: "Transforming self-sabotage into self-mastery — learning to use your greatest obstacle as your greatest fuel.",
    pages: "240 pages", year: "2020", tag: "Motivation",
    accent: "#059669", letter: "M",
    tags: ["motivation", "depression"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "5",
    title: "Full Catastrophe Living",
    author: "Jon Kabat-Zinn",
    mood: "Anxiety & Sleep",
    summary: "Using mindfulness to face stress, pain, and illness — a programme trusted by hospitals worldwide.",
    pages: "720 pages", year: "2013", tag: "Anxiety & Stress",
    accent: "#0891b2", letter: "F",
    tags: ["anxiety", "sleep"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "6",
    title: "The Miracle Morning",
    author: "Hal Elrod",
    mood: "Motivation",
    summary: "A morning ritual used by millions to build discipline, silence self-doubt, and show up fully each day.",
    pages: "208 pages", year: "2012", tag: "Motivation",
    accent: "#059669", letter: "T",
    tags: ["motivation"],
    isFree: false,
    freeUrl: "",
  },
  {
    id: "7",
    title: "Anxiety: A Self-Help Guide",
    author: "NHS / Get Self Help",
    mood: ["anxiety"],
    summary: "A practical, evidence-based guide written by NHS therapists covering anxiety, panic attacks, and worry — with CBT techniques you can apply immediately. Completely free.",
    pages: "Free PDF", year: "2023", tag: "Anxiety & Stress",
    accent: "#0891b2", letter: "A",
    isFree: true,
    freeUrl: "https://www.getselfhelp.co.uk/docs/AnxietySelfHelp.pdf",
  },

  // Book id "8" — Overcoming Depression Workbook
  {
    id: "8",
    title: "Overcoming Depression Workbook",
    author: "Adrian College",
    mood: ["depression"],
    summary: "A practical CBT-based workbook for understanding and overcoming depression — covers symptoms, triggers, lifestyle changes, and daily therapy exercises. Free to download.",
    pages: "Free PDF", year: "2022", tag: "Depression",
    accent: "#d97706", letter: "O",
    isFree: true,
    freeUrl: "https://www.adrian.edu/files/assets/overcomingdepressionworkbook.pdf",
  },

  // Book id "9" — Anxiety & Depression Workbook For Dummies
  {
    id: "9",
    title: "Anxiety & Depression Workbook For Dummies",
    author: "Archive.org",
    mood: ["anxiety", "depression"],
    summary: "The popular Dummies series workbook for anxiety and depression — freely available to borrow and read online on Internet Archive. No signup required.",
    pages: "Free to Read", year: "2015", tag: "Anxiety & Depression",
    accent: "#7c3aed", letter: "A",
    isFree: true,
    freeUrl: "https://archive.org/details/anxietydepressionworkbookfordummies",
  },

  // Book id "10" — Vagus Nerve Self Help
  {
    id: "10",
    title: "Healing Power of the Vagus Nerve",
    author: "Stanley Rosenberg",
    mood: ["anxiety", "sleep", "motivation"],
    summary: "Self-help exercises for anxiety, depression, trauma, and stress — freely available on Internet Archive. Covers breathing, movement, and nervous system regulation.",
    pages: "Free to Read", year: "2024", tag: "Anxiety & Sleep",
    accent: "#059669", letter: "H",
    isFree: true,
    freeUrl: "https://archive.org/details/accessing-the-healing-power-of-the-vagus-nerve-self-help-exercises-for-anxiety-d",
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
    title: "My Journey Through Depression, Stress & Finding a Way Forward",
    source: "ADAA",
    author: "Jarek Tadla",
    summary: "A high-achiever who hid his depression behind success for years — until he hit breaking point and made the bravest decision of his life: asking for help.",
    tag: "Depression",
    tagColor: "#d97706",
    readTime: "5 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/my-journey-through-depression-stress-suicide",
    gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
    letter: "J",
    accentColor: "#d97706",
  },
  {
    id: "2",
    type: "personal",
    title: "Fearless Living: My Journey With Anxiety",
    source: "ADAA",
    author: "Personal Story",
    summary: "15 years of severe panic attacks that stopped her from leaving home — and the combination of therapies that finally gave her life back, step by step.",
    tag: "Anxiety",
    tagColor: "#0891b2",
    readTime: "6 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/fearless-living-my-journey-anxiety",
    gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    letter: "F",
    accentColor: "#0891b2",
  },
  {
    id: "3",
    type: "personal",
    title: "Rising Above My Story of Depression and Anxiety",
    source: "ADAA",
    author: "Personal Story",
    summary: "Growing up in a violent home, losing her mother at 24, decades of running from herself — until grief finally cracked her open to real healing.",
    tag: "Depression & Anxiety",
    tagColor: "#059669",
    readTime: "7 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/rising-above-my-story-depression-and-anxiety",
    gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    letter: "R",
    accentColor: "#059669",
  },
  {
    id: "4",
    type: "personal",
    title: "Courage Unveiled: My Journey With Generalized Anxiety Disorder",
    source: "ADAA",
    author: "Personal Story",
    summary: "Diagnosed at 18, hiding behind a fake smile for decades — until a crisis at 43 forced her to finally stop pretending and start truly healing.",
    tag: "Anxiety",
    tagColor: "#7c3aed",
    readTime: "6 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/courage-unveiled",
    gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    letter: "C",
    accentColor: "#7c3aed",
  },
  {
    id: "5",
    type: "personal",
    title: "Journey to Recovery",
    source: "ADAA",
    author: "Personal Story",
    summary: "From rock bottom — including a suicide attempt — to leading a mental health platform for men. An honest account of the long, messy road back to life.",
    tag: "Depression",
    tagColor: "#d97706",
    readTime: "5 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/journey-recovery",
    gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
    letter: "J",
    accentColor: "#d97706",
  },
  {
    id: "6",
    type: "personal",
    title: "Surviving GAD: How I Finally Reclaimed My Life",
    source: "ADAA",
    author: "Medrick Lihanda",
    summary: "Panic attacks, ER visits, intrusive thoughts every day — a father of two shares how therapy and self-understanding helped him overcome generalized anxiety disorder.",
    tag: "Anxiety",
    tagColor: "#0891b2",
    readTime: "4 min read",
    url: "https://adaa.org/living-with-anxiety/personal-stories/surviving-gad-generalized-anxiety-disorder",
    gradient: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    letter: "S",
    accentColor: "#0891b2",
  },
  {
    id: "7",
    type: "personal",
    title: "🇮🇳 I Am Fighting Depression. Every Day. And You Can Too!",
    source: "The Better India",
    author: "Harika Bantupalli",
    summary: "A 22-year-old Indian woman in a good job with a good salary — and completely falling apart inside. Her story of depression in a society that calls it weakness.",
    tag: "Depression · India",
    tagColor: "#e11d48",
    readTime: "6 min read",
    url: "https://thebetterindia.com/50257/depression-causes-symptoms-mental-health/",
    gradient: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    letter: "H",
    accentColor: "#e11d48",
  },
  {
    id: "8",
    type: "personal",
    title: "🇮🇳 Living With Anxiety — Why India Needs to Talk About Mental Health",
    source: "The Better India",
    author: "Indian Personal Story",
    summary: "Sitting at her office desk, she knows what's coming. She rushes to the bathroom. A panic attack. Again. A raw, honest account of anxiety in an Indian workplace.",
    tag: "Anxiety · India",
    tagColor: "#e11d48",
    readTime: "7 min read",
    url: "https://thebetterindia.com/71635/anxiety-mental-illness-depression-india/",
    gradient: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    letter: "A",
    accentColor: "#e11d48",
  },
  {
    id: "9",
    type: "published",
    title: "🇮🇳 Inspiring Stories of Hope — MBBS Student Overcomes Anxiety",
    source: "Live Love Laugh Foundation",
    author: "Indian Personal Story",
    summary: "An Indian MBBS student and classical vocalist diagnosed with dissociative disorder shares how she balanced crushing academic pressure with her mental health recovery.",
    tag: "Anxiety · India",
    tagColor: "#e11d48",
    readTime: "5 min read",
    url: "https://www.thelivelovelaughfoundation.org/impact/stories-of-hope",
    gradient: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    letter: "I",
    accentColor: "#e11d48",
  },
  {
    id: "10",
    type: "published",
    title: "🇮🇳 A Friend's Suicide Led This IIT Alumnus to Touch 2 Lakh Lives",
    source: "The Better India",
    author: "Richa Singh",
    summary: "After losing a friend to suicide, an IIT Guwahati graduate built YourDOST — an emotional wellness platform that has since helped over 2 lakh Indians find support.",
    tag: "Motivation · India",
    tagColor: "#e11d48",
    readTime: "6 min read",
    url: "https://thebetterindia.com/49813/yourdost-depression-richa-singh-iit-guwahati-depression/",
    gradient: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
    letter: "R",
    accentColor: "#e11d48",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<Mood>("all");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState<StoryMood | null>(null);
  const [story, setStory] = useState<string>("");
  const [storyLoading, setStoryLoading] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  const filteredBooks =
    activeFilter === "all"
      ? BOOKS
      : BOOKS.filter((b) => {
          if (Array.isArray(b.mood)) return b.mood.includes(activeFilter);
          if (b.tags) return b.tags.includes(activeFilter);
          return false;
        });

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
                  position: "relative",
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
                  {book.isFree && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 10, fontWeight: 700, color: "#fff",
                      background: "#16a34a", padding: "2px 7px",
                      borderRadius: 999, letterSpacing: "0.05em",
                      fontFamily: "system-ui, sans-serif",
                    }}>
                      FREE
                    </div>
                  )}
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#9dbfcc" }}>{book.pages}</span>
                        {book.isFree && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: "#fff",
                            background: "#16a34a", padding: "2px 8px",
                            borderRadius: 999, letterSpacing: "0.05em",
                            fontFamily: "system-ui, sans-serif",
                          }}>
                            FREE PDF
                          </span>
                        )}
                      </div>
                      <a
                        href={book.isFree ? book.freeUrl : `https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.author + " buy")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 13, fontWeight: 600,
                          color: book.isFree ? "#fff" : "#297194",
                          background: book.isFree ? "#16a34a" : "transparent",
                          textDecoration: "none",
                          borderBottom: book.isFree ? "none" : "1.5px solid #297194",
                          padding: book.isFree ? "6px 14px" : "0",
                          borderRadius: book.isFree ? 999 : 0,
                          paddingBottom: book.isFree ? "6px" : "1px",
                          fontFamily: "system-ui, sans-serif",
                        }}
                      >
                        {book.isFree ? "Read Free →" : "Find this book →"}
                      </a>
                    </div>
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
