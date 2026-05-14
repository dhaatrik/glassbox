import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.substring(1) || "login";

  const [queuedCount, setQueuedCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem("glassbox_tickets");
        if (stored) {
          const tickets = JSON.parse(stored);
          const count = tickets.filter((t: any) => t.status === "QUEUED").length;
          setQueuedCount(count);
        } else {
          setQueuedCount(3);
        }
      } catch (e) {
        setQueuedCount(0);
      }
    };
    
    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 2000);
    
    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  if (currentPath === "login") return null;

  return (
    <nav className="flex-none z-50 sticky bottom-0 border-t border-border-dim bg-background-dark/80 backdrop-blur-xl">
      <div className="flex gap-2 px-4 pb-6 pt-3 md:pb-3 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate("/dashboard")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "dashboard"
              ? "text-primary scale-110"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "dashboard" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">
            space_dashboard
          </span>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono ${currentPath === "dashboard" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            DASHBOARD
          </p>
        </button>

        <button
          onClick={() => navigate("/grid")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "grid"
              ? "text-primary scale-110"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "grid" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <div className="relative">
            <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">
              view_kanban
            </span>
            {queuedCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 bg-primary text-black text-[8px] font-bold rounded-full flex items-center justify-center border border-black z-10">
                {queuedCount}
              </span>
            )}
          </div>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono ${currentPath === "grid" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            GRID
          </p>
        </button>

        <button
          onClick={() => navigate("/submit")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "submit"
              ? "text-primary"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "submit" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <div
            className={`h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-dim border -translate-y-5 shadow-lg group-hover:-translate-y-6 transition-all ${
              currentPath === "submit" ? "border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)] bg-primary/10" : "border-border-dim"
            }`}
          >
            <span className="material-symbols-outlined text-[28px] text-primary">add_circle</span>
          </div>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono text-primary -mt-2 ${currentPath === "submit" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            SIGNAL
          </p>
        </button>

        <button
          onClick={() => navigate("/metrics")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "metrics"
              ? "text-primary scale-110"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "metrics" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">
            monitoring
          </span>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono ${currentPath === "metrics" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            METRICS
          </p>
        </button>

        <button
          onClick={() => navigate("/insights")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "insights"
              ? "text-primary scale-110"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "insights" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <div className="relative">
            <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">
              psychology
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)] z-10"></span>
          </div>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono ${currentPath === "insights" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            INSIGHTS
          </p>
        </button>

        <button
          onClick={() => navigate("/settings")}
          className={`group flex flex-1 flex-col items-center justify-end gap-1 transition-all relative ${
            currentPath === "settings"
              ? "text-primary scale-110"
              : "text-text-muted hover:text-white"
          }`}
        >
          {currentPath === "settings" && (
            <motion.div
              layoutId="nav-indicator-mobile"
              className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
            />
          )}
          <span className="material-symbols-outlined text-[24px] group-hover:-translate-y-1 transition-transform">
            settings
          </span>
          <p className={`text-[9px] font-bold leading-normal tracking-wider font-mono ${currentPath === "settings" ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}>
            SETTINGS
          </p>
        </button>
      </div>
    </nav>
  );
}
