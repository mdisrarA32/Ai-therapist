import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
}

interface FeatureCardProps {
  feature: Feature;
  isActive: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function FeatureCard({
  feature,
  isActive,
  isHovered,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      layout
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        relative overflow-hidden cursor-pointer backdrop-blur-[12px] rounded-2xl
        transition-all duration-300 ease-out border
        ${
          isActive
            ? "border-white/20 bg-white/[0.06]"
            : isHovered
            ? "border-w hite/20 bg-white/[0.08] shadow-[0_0_20px_rgba(45,212,191,0.2)]"
            : "border-white/10 bg-white/[0.04]"
        }
        ${isDimmed && !isActive && !isHovered ? "opacity-40" : "opacity-100"}
      `}
      style={{
        transform: isHovered && !isActive ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered && !isActive ? "0 0 20px rgba(45,212,191,0.2)" : "none",
      }}
    >
      {/* Active Left Border Highlight */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-300 ${
          isActive ? "bg-[#2dd4bf]" : "bg-transparent"
        }`}
      />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf]">
              <Icon className="w-6 h-6 transition-transform duration-300" style={{ transform: isHovered ? "scale(1.15)" : "scale(1)" }} />
            </div>
            {/* Animated Pulse Ring */}
            <div className="absolute inset-0 rounded-full border border-[#2dd4bf]/40 animate-ping opacity-20" />
          </div>
          
          <div className={`p-1 transition-transform duration-300 ${isActive ? "rotate-180 text-[#2dd4bf]" : "rotate-0 text-slate-400"}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[16px] font-medium text-[#e2e8f0]">{feature.title}</h3>
          <p className="text-[13px] text-[#64748b] leading-relaxed select-none">
            {feature.description}
          </p>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/10 mt-2 space-y-2">
                {feature.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] shrink-0 mt-1.5" />
                    <span className="text-[13px] text-slate-300">{detail}</span>
                  </div>
                ))}
                
                <div className="pt-2">
                  <span className="text-[13px] text-[#2dd4bf] font-medium hover:text-[#4ade80] transition-colors">
                    Learn more →
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
