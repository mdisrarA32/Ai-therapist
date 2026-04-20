"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Check, X } from "lucide-react";

// Intersection Observer Hook for Scroll Animations
const useScrollReveal = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080d18] text-slate-300 font-sans pt-20">
      <div className="max-w-[860px] mx-auto px-8 py-14">

        {/* ======================== SECTION 1 — Our Story ======================== */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[52px]">
            {/* Left */}
            <div>
              <Reveal delay={0}>
                <span className="inline-block text-[#2dd4bf] text-sm uppercase tracking-wide font-medium mb-4">
                  Our story
                </span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1
                  className="text-4xl md:text-5xl leading-tight mb-6 text-white"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Built from{" "}
                  <span className="text-[#2dd4bf] italic">personal pain</span>.
                  <br />
                  Built for everyone.
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="space-y-4 text-[#64748b] text-[15px] leading-relaxed">
                  <p>
                    Aura 3.0 began with a simple, painful realization: accessing
                    immediate mental health care is often too expensive, too
                    intimidating, or simply unavailable when you need it most.
                  </p>
                  <p>
                    We set out to create an AI companion that doesn't pretend to be
                    human, but still provides a genuinely empathetic, safe, and
                    secure space for emotional understanding. A tool that guides you
                    back to yourself.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right */}
            <div className="relative flex items-center justify-center pt-8 md:pt-0">
              <Reveal delay={0.24} className="w-full relative z-10">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 border-2 border-[#2dd4bf] rounded-full opacity-30 pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#4ade80] rounded-full opacity-60 pointer-events-none" />

                {/* Glassmorphism quote card */}
                <div className="bg-white/[0.035] border border-white/[0.08] rounded-[14px] p-8 relative overflow-hidden backdrop-blur-md">
                  <div className="text-[#2dd4bf] text-6xl font-serif absolute top-4 left-6 opacity-40 leading-none">
                    "
                  </div>
                  <p className="text-[15px] text-slate-200 italic leading-relaxed relative z-10 mt-6">
                    Technology should not replace our humanity. It should give us
                    the tools to better understand it. That's why we built Aura.
                  </p>
                  <div className="mt-8 border-t border-white/[0.08] pt-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f766e] to-[#6d28d9] flex items-center justify-center text-white font-medium text-sm">
                      A
                    </div>
                    <div>
                      <div className="text-white text-[14px] font-medium">
                        Aura Team
                      </div>
                      <div className="text-[#64748b] text-[12px]">
                        Founders of Aura
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07] mb-24" />

        {/* ======================== SECTION 2 — Mission / Vision / Values ======================== */}
        <section className="mb-24">
          <Reveal delay={0}>
            <div className="bg-white/[0.06] rounded-[16px] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Panel 1 */}
                <div className="bg-[#080d18] p-[30px_24px] m-[1px] rounded-tl-[15px] rounded-tr-[15px] md:rounded-tr-none md:rounded-l-[15px]">
                  <div className="text-[#2dd4bf] text-[11px] font-bold uppercase tracking-wider mb-2">
                    Mission
                  </div>
                  <h3 className="text-white text-[16px] font-medium mb-3">
                    Bridge the gap
                  </h3>
                  <p className="text-[#475569] text-[14px] leading-relaxed">
                    To make emotional support instantly accessible, providing a
                    private space for everyone to process their thoughts without
                    judgment.
                  </p>
                </div>

                {/* Panel 2 */}
                <div className="bg-[#080d18] p-[30px_24px] m-[1px] md:my-[1px] md:mx-0 md:border-x md:border-white/[0.06]">
                  <div className="text-[#4ade80] text-[11px] font-bold uppercase tracking-wider mb-2">
                    Vision
                  </div>
                  <h3 className="text-white text-[16px] font-medium mb-3">
                    A supplementary layer
                  </h3>
                  <p className="text-[#475569] text-[14px] leading-relaxed">
                    To exist as a reliable companion that encourages self-reflection,
                    acting as a bridge to real human therapy, never a replacement.
                  </p>
                </div>

                {/* Panel 3 */}
                <div className="bg-[#080d18] p-[30px_24px] m-[1px] rounded-bl-[15px] rounded-br-[15px] md:rounded-bl-none md:rounded-r-[15px]">
                  <div className="text-[#a78bfa] text-[11px] font-bold uppercase tracking-wider mb-2">
                    Values
                  </div>
                  <h3 className="text-white text-[16px] font-medium mb-3">
                    Privacy above all
                  </h3>
                  <p className="text-[#475569] text-[14px] leading-relaxed">
                    Uncompromising security. We operate on the belief that mental
                    health data is the most sacred personal information you own.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <div className="border-t border-white/[0.07] mb-24" />

        {/* ======================== SECTION 3 — How Aura Protects You ======================== */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Left */}
            <div>
              <Reveal delay={0}>
                <h2
                  className="text-3xl text-white mb-6"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Your secrets are yours. Always.
                </h2>
                <p className="text-[#64748b] text-[15px] leading-relaxed mb-8">
                  We designed Aura with a zero-trust privacy architecture. Your
                  conversations are processed securely, ensuring you remain the sole
                  owner of your psychological data.
                </p>
              </Reveal>

              <div className="space-y-5 mt-8">
                {[
                  {
                    color: "bg-[#2dd4bf]",
                    title: "End-to-End Encryption",
                    desc: "Data transit is secured using advanced cryptographic protocols.",
                  },
                  {
                    color: "bg-[#4ade80]",
                    title: "No Data Selling",
                    desc: "We will never monetize, share, or sell your conversation history.",
                  },
                  {
                    color: "bg-[#a78bfa]",
                    title: "Anonymous Access",
                    desc: "Features available without linking strict personal identifiers.",
                  },
                  {
                    color: "bg-white",
                    title: "Right to Delete",
                    desc: "Erase your entire history permanently with a single click.",
                  },
                ].map((item, i) => (
                  <Reveal key={i} delay={0.08 * (i + 1)}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.color}`}
                      />
                      <div>
                        <div className="text-white text-[15px] font-medium mb-1">
                          {item.title}
                        </div>
                        <div className="text-[#475569] text-[14px]">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="pt-2">
              <Reveal delay={0.2}>
                <div className="bg-white/[0.035] border border-white/[0.08] rounded-[14px] backdrop-blur-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.08] text-white text-[14px] font-medium">
                    Data transparency
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: "Anonymized logs", status: "On-device", color: "text-[#4ade80]" },
                      { label: "Conversation history", status: "Encrypted", color: "text-[#4ade80]" },
                      { label: "Personal identity", status: "Protected", color: "text-[#4ade80]" },
                      { label: "Third-party tracking", status: "Never", color: "text-[#f87171]" },
                      { label: "Advertising data", status: "Not collected", color: "text-[#f87171]" },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[13px] border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                      >
                        <span className="text-[#64748b]">{row.label}</span>
                        <div
                          className={`bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-full ${row.color}`}
                        >
                          {row.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 border-l-2 border-[#2dd4bf]/35 pl-4 py-1 italic text-[#64748b] text-[14px] leading-relaxed">
                  "The most critical feature of a mental health application is not
                  the AI, it is the uncompromising assurance that no one is listening
                  in."
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07] mb-24" />

        {/* ======================== SECTION 4 — A Day with Aura ======================== */}
        <section className="mb-24">
          <Reveal delay={0}>
            <h2
              className="text-3xl text-white mb-12 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Not an app you open. A presence you feel.
            </h2>
          </Reveal>

          <div className="max-w-[600px] mx-auto">
            {/* ROW 1 */}
            <Reveal delay={0.08}>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[110px_1fr] gap-0">
                <div className="text-right pr-6 py-1 text-[13px] text-[#475569] font-medium mt-1">
                  6:48 am
                </div>
                <div className="relative pb-10 border-l border-white/[0.08] pl-8">
                  <div className="absolute left-[-5px] top-[10px] w-2.5 h-2.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <div className="text-white text-[15px] font-medium mb-2">
                    Morning Reflection
                  </div>
                  <p className="text-[#475569] text-[14px] leading-relaxed mb-4">
                    A simple notification checking in on your sleep quality and intent
                    for the day ahead.
                  </p>
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-[12px] p-3 rounded-bl-none w-fit inline-block">
                    <div className="text-[#4ade80] text-[10px] uppercase font-bold tracking-wider mb-1">
                      Aura
                    </div>
                    <div className="text-slate-300 text-[13px]">
                      Good morning. Looks like your sleep was fragmented. What's one
                      gentle thing you can do for yourself today?
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ROW 2 */}
            <Reveal delay={0.16}>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[110px_1fr] gap-0">
                <div className="text-right pr-6 py-1 text-[13px] text-[#475569] font-medium mt-1">
                  1:20 pm
                </div>
                <div className="relative pb-10 border-l border-white/[0.08] pl-8">
                  <div className="absolute left-[-5px] top-[10px] w-2.5 h-2.5 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                  <div className="text-white text-[15px] font-medium mb-2">
                    Stress Spike Detection
                  </div>
                  <p className="text-[#475569] text-[14px] leading-relaxed mb-4">
                    Aura notices a rapid shift in your sentiment and offers brief
                    grounding techniques.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[12px] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full border border-[#2dd4bf]/20">
                      Breathe
                    </span>
                    <span className="text-[12px] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full border border-[#2dd4bf]/20">
                      Box Breathing
                    </span>
                    <span className="text-[12px] text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1 rounded-full border border-[#2dd4bf]/20">
                      5-4-3-2-1 Method
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ROW 3 */}
            <Reveal delay={0.24}>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[110px_1fr] gap-0">
                <div className="text-right pr-6 py-1 text-[13px] text-[#475569] font-medium mt-1">
                  11:40 pm
                </div>
                <div className="relative pb-10 border-l border-white/[0.08] pl-8">
                  <div className="absolute left-[-5px] top-[10px] w-2.5 h-2.5 rounded-full bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                  <div className="text-white text-[15px] font-medium mb-2">
                    Late Night Support
                  </div>
                  <p className="text-[#475569] text-[14px] leading-relaxed mb-4">
                    Providing a judgment-free sounding board when anxiety hits hard at
                    night.
                  </p>
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-[12px] p-3 rounded-bl-none w-[90%] md:w-[80%] inline-block">
                    <div className="text-[#a78bfa] text-[10px] uppercase font-bold tracking-wider mb-1">
                      Aura
                    </div>
                    <div className="text-slate-300 text-[13px]">
                      I hear how overwhelmed you are. It makes sense that tomorrow's
                      meeting is weighing on you. Let's break it down into smaller
                      pieces together.
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ROW 4 */}
            <Reveal delay={0.32}>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[110px_1fr] gap-0">
                <div className="text-right pr-6 py-1 text-[13px] text-[#475569] font-medium mt-1"></div>
                <div className="relative pl-8">
                  <div className="absolute left-[-4px] top-[10px] w-2 h-2 rounded-full border border-[#4ade80] bg-[#080d18]" />
                  <div className="text-[#64748b] text-[14px] italic mt-0.5">
                    Ready for the next morning.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="border-t border-white/[0.07] mb-24" />

        {/* ======================== SECTION 5 — What Aura Is and Isn't ======================== */}
        <section className="mb-24">
          <Reveal delay={0}>
            <h2
              className="text-3xl text-white mb-10 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Honest about what we can do.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left (What it is) */}
            <div>
              <Reveal delay={0.08}>
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-6 h-6 rounded-full bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80]">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="text-white text-[16px] font-medium">
                    What Aura is
                  </h3>
                </div>
              </Reveal>

              <div className="space-y-3">
                {[
                  "A reflective conversational partner",
                  "A tool for tracking longitudinal mood patterns",
                  "A source of evidence-based coping exercises",
                  "An immediate outlet for daily stress",
                  "A private, encrypted diary",
                ].map((text, i) => (
                  <Reveal key={i} delay={0.16 + i * 0.08}>
                    <div className="bg-white/[0.035] border border-white/[0.08] rounded-[14px] px-5 py-4 text-[14px] text-slate-300">
                      {text}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Right (What it isn't) */}
            <div>
              <Reveal delay={0.08}>
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-6 h-6 rounded-full bg-[#f87171]/20 flex items-center justify-center text-[#f87171]">
                    <X className="w-4 h-4" />
                  </div>
                  <h3 className="text-white text-[16px] font-medium">
                    What Aura isn't
                  </h3>
                </div>
              </Reveal>

              <div className="space-y-3">
                {[
                  "A licensed clinical therapist",
                  "A replacement for medical treatment",
                  "A diagnostic psychometric tool",
                  "A solution for severe psychiatric conditions",
                ].map((text, i) => (
                  <Reveal key={i} delay={0.16 + i * 0.08}>
                    <div className="bg-[#f87171]/[0.03] border border-[#f87171]/[0.12] rounded-[14px] px-5 py-4 text-[14px] text-slate-300">
                      {text}
                    </div>
                  </Reveal>
                ))}

                {/* Crisis block */}
                <Reveal delay={0.5}>
                  <div className="mt-8 border-l-2 border-[#f87171]/35 pl-4 py-2">
                    <div className="text-[#f87171] text-[13px] font-bold mb-1 uppercase tracking-wide">
                      If you are in crisis
                    </div>
                    <div className="text-[#64748b] text-[13px] leading-relaxed mb-3">
                      Please immediately reach out to a professional or emergency
                      service. Aura cannot coordinate emergency rescues.
                    </div>
                    <div className="flex flex-col gap-1 text-[13px]">
                      <div>
                        <span className="text-[#f87171] font-medium">iCall:</span>{" "}
                        9152987821
                      </div>
                      <div>
                        <span className="text-[#f87171] font-medium">AASRA:</span>{" "}
                        9820466627
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07] mb-24" />

        {/* ======================== SECTION 6 — CTA + Footer ======================== */}
        <section>
          <Reveal delay={0}>
            <div className="text-center mb-24">
              <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] text-slate-400 uppercase tracking-widest font-medium mb-6">
                Ready?
              </div>
              <h2
                className="text-4xl md:text-5xl text-white mb-6"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your first conversation is always free.
              </h2>
              <p className="text-[#64748b] text-[16px] max-w-sm mx-auto mb-10">
                Take the first step toward better understanding yourself in a completely
                judgment-free space.
              </p>
              <button className="bg-[#0f766e] text-white px-8 py-3.5 rounded-full font-medium shadow-[0_0_20px_rgba(15,118,110,0.4)] hover:bg-[#0d645d] transition-colors duration-300">
                Start Chatting
              </button>
            </div>
          </Reveal>

          {/* Footer Component exclusively for this page context based on requirements */}
          <Reveal delay={0.2} className="border-t border-white/[0.07] pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white font-bold text-lg tracking-tight">
                Aura 3.0
              </div>
              <div className="flex gap-6 text-[13px] text-[#64748b]">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </div>
              <div className="text-[12px] text-slate-600">
                © Aura AI. Not clinical therapy.
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
