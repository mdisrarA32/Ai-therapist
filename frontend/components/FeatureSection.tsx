import { useState } from "react";
import { motion } from "framer-motion";
import { FeatureCard, type Feature } from "./FeatureCard";
import {
  Brain,
  Shield,
  LineChart,
  HeartPulse,
  Activity,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";

const featuresData: Feature[] = [
  {
    id: "ai-therapy",
    title: "AI-Powered Therapy",
    description: "Experience empathetic, real-time emotional support tailored to your unique psychological profile.",
    icon: Brain,
    details: ["Natural language understanding", "Cognitive behavioral frameworks", "Non-judgmental conversational flow"]
  },
  {
    id: "blockchain",
    title: "Blockchain Security",
    description: "Your conversations are mathematically secured and fully private, protecting your most sensitive data.",
    icon: Shield,
    details: ["End-to-end encryption", "Decentralized identity verification", "Immutable privacy logs"]
  },
  {
    id: "smart-analysis",
    title: "Smart Analysis",
    description: "Advanced algorithms detect underlying emotional patterns across your conversations over time.",
    icon: LineChart,
    details: ["Sentiment tracking", "Behavioral pattern recognition", "Actionable psychological insights"]
  },
  {
    id: "crisis-detection",
    title: "Crisis Detection",
    description: "Constantly monitoring for distress signals to provide immediate specialized protocol activation.",
    icon: HeartPulse,
    details: ["Real-time emotional volatility alerts", "Emergency contact routing", "De-escalation guidance"]
  },
  {
    id: "iot",
    title: "IoT Integration",
    description: "Syncs with wearables to correlate physiological signs with your self-reported emotional state.",
    icon: Activity,
    details: ["Heart rate variability sync", "Sleep pattern analysis", "Biometric stress indicators"]
  },
  {
    id: "progress",
    title: "Progress Tracking",
    description: "Visualize your emotional journey with secure, comprehensive personal wellbeing dashboards.",
    icon: TrendingUp,
    details: ["Goal setting and milestones", "Mood calendar visualization", "Weekly resilience reports"]
  },
  {
    id: "privacy",
    title: "Privacy First",
    description: "Designed from the ground up to ensure you maintain total ownership over your mental health data.",
    icon: Lock,
    details: ["Zero-knowledge architecture", "No third-party data selling", "Local storage options"]
  },
  {
    id: "holistic",
    title: "Holistic Care",
    description: "Integrates multiple therapeutic modalities to ensure a well-rounded approach to mental stability.",
    icon: Sparkles,
    details: ["Mindfulness exercises", "Somatic experiencing techniques", "Journaling prompts"]
  }
];

export function FeatureSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Stagger variants for scroll animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-[#E7F2F7]">
      {/* Background glow tailored to features */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary/5 via-[#D1E1F7]/30 to-[#8bb8c8]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-block relative">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a4a5e] tracking-tight pb-2">
              How Aura Helps You
            </h2>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-[#297194] to-transparent origin-center"
            />
          </div>
          <p className="text-lg text-[#64748b] font-medium max-w-2xl mx-auto">
            Experience a new kind of emotional support, powered by empathetic AI
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {featuresData.map((feature) => (
            <motion.div key={feature.id} variants={itemVariants}>
              <FeatureCard
                feature={feature}
                isActive={activeId === feature.id}
                isHovered={hoveredId === feature.id}
                isDimmed={hoveredId !== null && hoveredId !== feature.id}
                onClick={() => setActiveId(activeId === feature.id ? null : feature.id)}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <button className="relative group overflow-hidden rounded-full py-3.5 px-8 shadow-[0_0_20px_rgba(41,113,148,0.2)] animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-105 active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-[#297194] to-[#1e5870] opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 text-white font-semibold tracking-wide flex items-center justify-center gap-2">
              Ready to start your journey?
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
