"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function MissionSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Soft glowing radial gradient in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 via-[#D1E1F7]/30 to-[#8bb8c8]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Our Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex"
          >
            <Card className="flex flex-col h-full relative overflow-hidden border border-primary/10 hover:border-primary/20 transition-all duration-500 bg-card/30 dark:bg-card/80 backdrop-blur-md rounded-2xl p-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-0 flex-1 relative z-10 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                  <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
                    Our Mission
                  </span>
                </h2>
                
                <div className="space-y-6 text-lg text-muted-foreground/90 dark:text-gray-300 leading-relaxed font-medium">
                  <p>
                    Aura 3.0 is an AI-powered mental health companion designed to make emotional support more accessible, personalized, and consistent. Our mission is to help individuals better understand their thoughts and emotions through intelligent, empathetic conversations.
                  </p>
                  <p>
                    By combining advanced AI with evidence-based psychological approaches, Aura provides a safe, private, and non-judgmental space for self-reflection and growth. We aim to make mental wellbeing support available to everyone—anytime, anywhere—while supporting, not replacing, human care.
                  </p>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </motion.div>

          {/* Why Aura Exists Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex"
          >
            <Card className="flex flex-col h-full relative overflow-hidden border border-primary/10 hover:border-primary/20 transition-all duration-500 bg-card/30 dark:bg-card/80 backdrop-blur-md rounded-2xl p-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-0 flex-1 relative z-10 flex flex-col justify-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                  <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
                    Why Aura Exists
                  </span>
                </h2>
                
                <div className="space-y-6 text-lg text-muted-foreground/90 dark:text-gray-300 leading-relaxed font-medium">
                  <p>
                    Aura 3.0 was created to bridge the gap between mental health needs and accessible support. Many people lack immediate or affordable resources, often facing challenges alone.
                  </p>
                  <p>
                    Through AI-driven conversations, emotion insights, and guided support, Aura helps users better understand themselves in a safe and structured way. Our goal is to provide a reliable, ethical, and supportive digital companion that promotes clarity, resilience, and wellbeing.
                  </p>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
