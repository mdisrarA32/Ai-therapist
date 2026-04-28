"use client";

import { useState, useEffect } from "react";
import { AudioWaveform } from "lucide-react";
import { welcomeQuotes } from "../data/welcomeQuotes";

interface WelcomeSplashProps {
  firstName?: string;
}

export default function WelcomeSplash({ firstName = "there" }: WelcomeSplashProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Show once per browser session/tab
  useEffect(() => {
    const key = "aura_splash_shown";
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "true");
        setShouldShow(true);
        setTimeout(() => setVisible(true), 50);
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    const start = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [shouldShow]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setShouldShow(false), 400);
  };

  if (!shouldShow) return null;

  const quoteIndex = new Date().getDate() % 30;
  const quote = welcomeQuotes[quoteIndex];

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #1a2b4a 0%, #2563a8 55%, #5bbfd6 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <AudioWaveform
          style={{
            width: "64px",
            height: "64px",
            color: "white",
            marginBottom: "32px",
            animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        />

        <h1
          style={{
            fontSize: "clamp(20px, 3vw, 24px)",
            fontWeight: 500,
            color: "white",
            margin: "0 0 8px",
          }}
        >
          {greeting}, {firstName}
        </h1>

        <span
          style={{
            display: "block",
            fontSize: "13px",
            color: "rgba(255,255,255,0.75)",
            marginTop: "8px",
            lineHeight: "1.6",
          }}
        >
          You took a brave step today by being here. This is your safe space to
          breathe, reflect, and heal.
        </span>

        <div style={{ marginTop: "40px", maxWidth: "560px" }}>
          <span
            style={{
              display: "block",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontStyle: "italic",
              color: "white",
              lineHeight: "1.6",
            }}
          >
            &ldquo;{quote.text}&rdquo;
          </span>
          <span
            style={{
              display: "block",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              marginTop: "12px",
            }}
          >
            — {quote.author}
          </span>
        </div>

        <button
          onClick={handleDismiss}
          style={{
            marginTop: "40px",
            background: "white",
            color: "#297194",
            border: "none",
            borderRadius: "50px",
            padding: "12px 32px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 150ms ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "white")
          }
        >
          Begin my journey →
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: "rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "white",
            transition: "none",
          }}
        />
      </div>
    </div>
  );
}