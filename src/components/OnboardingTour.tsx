import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: TourProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const steps = [
    {
      title: "WELCOME TO GLASSBOX",
      subtitle: "SYS_INIT // SECURE_UPLINK",
      content:
        "This terminal provides encrypted access to the global organizational grid. Let's initiate the orientation sequence.",
      icon: "terminal",
    },
    {
      title: "DASHBOARD",
      subtitle: "MODULE // OVERVIEW_MATRIX",
      content:
        "Monitor global system velocity, recent signals, and high-level metrics in real-time. Stay synced with the collective pulse.",
      icon: "speed",
    },
    {
      title: "NEURAL GRID",
      subtitle: "MODULE // TICKET_MANAGEMENT",
      content:
        "View and manage active operations across all sectors in the Kanban grid. Click any node for detailed log inspection.",
      icon: "grid_view",
    },
    {
      title: "TRANSMIT SIGNAL",
      subtitle: "ACTION // SUBMIT_FEEDBACK",
      content:
        "Submit new observations, anomalies, or feedback securely. Ghost protocols (anonymity) are available upon request.",
      icon: "add",
    },
    {
      title: "TREND ANALYSIS",
      subtitle: "MODULE // METRICS_DATABANK",
      content:
        "Analyze department performance rankings and sentiment deviations over time. Turn raw intelligence into actionable strategy.",
      icon: "query_stats",
    },
  ];

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      onComplete();
    }
  }, [step, steps.length, onComplete]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }, [step]);

  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onComplete]);

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext(); // Swipe left -> Next
    if (diff < -50) handlePrev(); // Swipe right -> Prev
    setTouchStart(null);
  };

  // Typewriter effect component
  const TypewriterText = ({ text }: { text: string }) => {
    const [displayed, setDisplayed] = useState("");
    
    useEffect(() => {
      setDisplayed("");
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 20); // typing speed
      return () => clearInterval(timer);
    }, [text]);

    return (
      <span>
        {displayed}
        <span className="animate-pulse inline-block w-1.5 h-3.5 bg-primary ml-1 align-middle opacity-70"></span>
      </span>
    );
  };

  // Variants for sliding content
  const contentVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 20 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -20 }),
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-md overflow-hidden">
      {/* Animated background grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="glass-panel bento-card w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden relative border border-border-dim/50 bg-surface/80"
      >
        {/* Decorative Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-dim">
          <motion.div
            className="h-full bg-linear-to-r from-primary/50 to-primary shadow-[0_0_10px_var(--color-primary)]"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-primary/50"></div>
        <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-primary/50"></div>
        
        <div className="p-8 flex flex-col items-center text-center gap-6 mt-4 min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              {/* Enhanced Icon Presentation */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="w-20 h-20 rounded-2xl border border-primary/30 flex items-center justify-center bg-linear-to-br from-surface-dim to-background shadow-[0_0_20px_rgba(var(--color-primary),0.1)] text-primary relative z-10 overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                  <span className="material-symbols-outlined text-4xl relative z-10 drop-shadow-[0_0_8px_var(--color-primary)]">
                    {steps[step].icon}
                  </span>
                </div>
              </div>

              <div className="space-y-4 w-full h-32">
                <div className="space-y-1">
                  <h2 className="text-sm font-mono text-primary uppercase tracking-widest opacity-80 h-5">
                    <TypewriterText text={steps[step].subtitle} />
                  </h2>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
                    {steps[step].title}
                  </h3>
                </div>

                <p className="text-sm font-sans text-text-muted leading-relaxed">
                  {steps[step].content}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-border-dim bg-surface/50 flex justify-between items-center backdrop-blur-md">
          {/* Clickable Progress indicators */}
          <div className="flex gap-2.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none"
                aria-label={`Go to step ${i + 1}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    i === step 
                      ? "bg-primary w-6 shadow-[0_0_8px_var(--color-primary)]" 
                      : "bg-text-muted/30 w-1.5 group-hover:bg-text-muted/60"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={step === 0 ? onComplete : handlePrev}
              className="px-4 py-2 text-xs font-sans font-bold text-text-muted hover:text-white transition-colors rounded-lg hover:bg-surface-dim"
            >
              {step === 0 ? "SKIP" : "PREV"}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-6 py-2 text-xs font-sans font-bold bg-primary text-black hover:bg-white rounded-lg shadow-[0_0_15px_rgba(vaR(--color-primary),0.3)] hover:shadow-[0_0_20px_var(--color-primary)] transition-all uppercase tracking-wider relative overflow-hidden group"
            >
              <span className="relative z-10">{step < steps.length - 1 ? "NEXT" : "INITIATE"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
