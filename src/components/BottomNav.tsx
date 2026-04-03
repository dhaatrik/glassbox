import React from "react";
import { motion } from "motion/react";

interface BottomNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function BottomNav({ currentView, onChangeView }: BottomNavProps) {
  if (currentView === "login") return null;

  return (
    <nav className="flex-none z-50 sticky bottom-0 border-t border-border-dim bg-background-dark/80 backdrop-blur-xl">
      <div className="flex gap-2 px-4 pb-6 pt-3 md:pb-3 max-w-2xl mx-auto w-full">
        <button
          onClick={() => onChangeView("dashboard")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-colors relative ${
            currentView === "dashboard"
              ? "text-primary"
              : "text-text-muted hover:text-primary"
          }`}
        >
          {currentView === "dashboard" && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-3 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
          )}
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
            speed
          </span>
          <p className="text-[10px] font-medium leading-normal tracking-wider font-display">
            DASHBOARD
          </p>
        </button>

        <button
          onClick={() => onChangeView("grid")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-colors relative ${
            currentView === "grid"
              ? "text-primary"
              : "text-text-muted hover:text-primary"
          }`}
        >
          {currentView === "grid" && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-3 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
          )}
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
            grid_view
          </span>
          <p className="text-[10px] font-medium leading-normal tracking-wider font-display">
            GRID
          </p>
        </button>

        <button
          onClick={() => onChangeView("submit")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-colors relative ${
            currentView === "submit"
              ? "text-primary"
              : "text-text-muted hover:text-primary"
          }`}
        >
          {currentView === "submit" && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-3 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
          )}
          <div
            className={`h-10 w-10 flex items-center justify-center rounded-full bg-black border ${currentView === "submit" ? "border-primary shadow-[0_0_10px_rgba(0,240,255,0.3)]" : "border-border-dim"} text-primary -mt-6 transition-all`}
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <p className="text-[10px] font-medium leading-normal tracking-wider font-display text-primary">
            SIGNAL
          </p>
        </button>

        <button
          onClick={() => onChangeView("metrics")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-colors relative ${
            currentView === "metrics"
              ? "text-primary"
              : "text-text-muted hover:text-primary"
          }`}
        >
          {currentView === "metrics" && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-3 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
          )}
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
            leaderboard
          </span>
          <p className="text-[10px] font-medium leading-normal tracking-wider font-display">
            METRICS
          </p>
        </button>
      </div>
    </nav>
  );
}
