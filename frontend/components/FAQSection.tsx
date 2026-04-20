"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Aura 3.0?",
    answer: "Aura 3.0 is an AI-powered mental health companion that provides real-time emotional support, helping users understand their thoughts and feelings through intelligent conversations.",
  },
  {
    question: "Is Aura a replacement for therapy?",
    answer: "No. Aura is designed to support and complement mental wellbeing, not replace professional care. It encourages self-reflection and guidance but does not substitute licensed therapy.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes. Your conversations are kept private and handled with strict security measures. Aura is designed with a strong focus on confidentiality and user trust.",
  },
  {
    question: "How does the AI understand my emotions?",
    answer: "Aura uses advanced AI models and emotion detection techniques to analyze language patterns and provide personalized, empathetic responses.",
  },
  {
    question: "Can I use Aura anytime?",
    answer: "Yes. Aura is available 24/7, providing support whenever you need it.",
  },
  {
    question: "Does Aura support voice interaction?",
    answer: "Yes. Aura includes voice-based interaction, allowing you to speak naturally and receive responses in a more human-like experience.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Soft glowing radial gradient in center */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-teal-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)]">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground/90 dark:text-gray-300 font-medium">
            Everything you need to know about Aura 3.0
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className={`
                    relative overflow-hidden border transition-all duration-500 rounded-2xl group cursor-pointer
                    ${isOpen ? 'bg-card/50 dark:bg-card/90 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'bg-card/30 dark:bg-card/60 border-primary/10 hover:border-primary/20 backdrop-blur-md'}
                  `}
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="p-6 md:px-8 relative z-10 flex items-center justify-between gap-4">
                    <h3 className={`text-lg md:text-xl font-semibold transition-colors duration-300 ${isOpen ? 'text-foreground' : 'text-foreground/90 dark:text-gray-200'}`}>
                      {faq.question}
                    </h3>
                    <div className={`p-2 rounded-full transition-colors duration-300 shrink-0 ${isOpen ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/70 group-hover:text-primary group-hover:bg-primary/20'}`}>
                      {isOpen ? (
                        <Minus className="w-5 h-5 transition-transform duration-300 rotate-0" />
                      ) : (
                        <Plus className="w-5 h-5 transition-transform duration-300 rotate-90" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-6 md:px-8 pb-6 relative z-10 text-base md:text-lg text-muted-foreground/90 dark:text-gray-300 leading-relaxed font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
