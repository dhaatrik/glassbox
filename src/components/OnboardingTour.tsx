import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: TourProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "WELCOME TO GLASSBOX",
      content:
        "This terminal provides encrypted access to the global organizational grid. Let's initiate the orientation sequence.",
      icon: "terminal",
    },
    {
      title: "DASHBOARD",
      content:
        "Monitor global system velocity, recent signals, and high-level metrics in real-time.",
      icon: "speed",
    },
    {
      title: "GRID MONITOR",
      content:
        "View and manage active tickets across all departments in the Kanban grid. Click any ticket for detailed logs.",
      icon: "grid_view",
    },
    {
      title: "TRANSMIT SIGNAL",
      content:
        "Submit new observations, issues, or feedback securely. Anonymity protocols are available.",
      icon: "add",
    },
    {
      title: "METRICS & TRENDS",
      content:
        "Analyze department performance rankings and sentiment trends over time.",
      icon: "leaderboard",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-panel bento-card w-full max-w-md shadow-2xl rounded-3xl overflow-hidden relative"
      >
        {/* Decorative Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-surface-dim">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="p-8 flex flex-col items-center text-center gap-6 mt-4">
          <motion.div
            key={step}
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-20 h-20 rounded-2xl border border-border-dim flex items-center justify-center bg-gradient-to-br from-surface-dim to-surface shadow-lg text-primary mb-2"
          >
            <span className="material-symbols-outlined text-4xl">
              {steps[step].icon}
            </span>
          </motion.div>

          <div className="space-y-3">
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-display font-bold text-white tracking-tight"
            >
              {steps[step].title}
            </motion.h2>

            <motion.p
              key={`content-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-sans text-text-muted leading-relaxed min-h-[60px]"
            >
              {steps[step].content}
            </motion.p>
          </div>
        </div>

        <div className="p-6 border-t border-border-dim bg-surface-dim/30 flex justify-between items-center">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-6" : "bg-border-dim"}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="px-4 py-2.5 text-xs font-sans font-bold text-text-muted hover:text-white transition-colors rounded-xl hover:bg-surface-dim"
            >
              SKIP
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else onComplete();
              }}
              className="px-6 py-2.5 text-xs font-sans font-bold bg-white text-black hover:bg-gray-100 rounded-xl shadow-lg transition-all"
            >
              {step < steps.length - 1 ? "NEXT" : "GET STARTED"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
