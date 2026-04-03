import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

export function Dashboard({ 
  onChangeView, 
  onFilterClick 
}: { 
  onChangeView: (view: string) => void;
  onFilterClick: (filter: { dept?: string; status?: string }) => void;
}) {
  const [time, setTime] = useState("");
  const [counts, setCounts] = useState({ 
    open: 0, 
    resolved: 0, 
    stalled: 0,
    velocity: 84,
    avgDelay: 4.2
  });
  const [tickerItems, setTickerItems] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("glassbox_tickets");
    if (stored) {
      const tickets = JSON.parse(stored);
      const open = tickets.filter((t: any) => t.status === "QUEUED" || t.status === "PROCESSING").length;
      const resolved = tickets.filter((t: any) => t.status === "RESOLVED").length;
      const stalled = tickets.filter((t: any) => t.status === "STALLED").length;
      
      // Calculate velocity (simple ratio for demo)
      const total = tickets.length || 1;
      const velocity = Math.round((resolved / total) * 100) + 20; // Offset for visual impact
      
      // Calculate avg delay for stalled
      const stalledTickets = tickets.filter((t: any) => t.status === "STALLED");
      let avgDelay = 4.2;
      if (stalledTickets.length > 0) {
        const totalDays = stalledTickets.reduce((acc: number, t: any) => {
          const match = t.time.match(/(\d+)/);
          return acc + (match ? parseInt(match[1]) : 0);
        }, 0);
        avgDelay = Number((totalDays / stalledTickets.length).toFixed(1));
      }

      setCounts({
        open,
        resolved,
        stalled,
        velocity: Math.min(velocity, 99),
        avgDelay
      });

      // Set ticker items (active tickets)
      const activeTickets = tickets.filter((t: any) => t.status !== "RESOLVED");
      setTickerItems(activeTickets);
    } else {
      // Fallback to initial counts if no storage yet
      setCounts({ open: 5, resolved: 1, stalled: 2, velocity: 84, avgDelay: 4.2 });
      setTickerItems([
        { dept: "[MKT]", title: "Campaign budget approval stuck in finance review for Q4 launch.", status: "QUEUED" },
        { dept: "[ENG]", title: "CI/CD pipeline latency increasing during peak hours.", status: "QUEUED" },
        { dept: "[EXEC]", title: "Quarterly bonus structure transparency request.", status: "STALLED" }
      ]);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    const interval = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-2xl border-b border-border-dim">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary text-lg font-display font-bold tracking-tight md:hidden"
            >
              [ GLASSBOX ]
            </motion.span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-border-dim bg-surface-dim/50 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-stable animate-pulse"></span>
              <span className="text-xs text-primary font-sans font-medium tracking-widest">
                {time}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.location.reload()}
              className="text-text-muted hover:text-critical transition-colors p-2 rounded-full hover:bg-surface-dim"
              title="Disconnect"
            >
              <span className="material-symbols-outlined text-lg">
                power_settings_new
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        {/* Hero: Global Velocity Gauge (Bento Large) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01, rotateY: 2, rotateX: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="md:col-span-2 md:row-span-2 bento-card glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden group"
        >
          {/* Spotlight effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-64 h-64 border border-dashed border-primary rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="w-48 h-48 border border-border-dim rounded-full absolute"></div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                fill="none"
                r="88"
                stroke="var(--theme-border-dim)"
                strokeWidth="8"
              ></circle>
              <circle
                className="drop-shadow-[0_0_12px_var(--theme-primary)] transition-all duration-1000 ease-out"
                cx="96"
                cy="96"
                fill="none"
                r="88"
                stroke="var(--theme-primary)"
                strokeDasharray="552"
                strokeDashoffset={552 - (552 * counts.velocity) / 100}
                strokeLinecap="round"
                strokeWidth="8"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-text-muted font-sans font-medium tracking-widest mb-1 uppercase">
                Velocity
              </span>
              <h1 className="text-6xl font-display text-white tracking-tighter drop-shadow-[0_0_16px_var(--theme-primary-dim)]">
                {counts.velocity}<span className="text-3xl text-primary">%</span>
              </h1>
              <span className="text-[10px] text-stable mt-2 bg-stable/10 px-3 py-1 rounded-full border border-stable/20 font-medium tracking-wide">
                OPTIMAL
              </span>
            </div>
          </div>
          <p className="text-sm text-text-muted mt-6 font-sans text-center max-w-[250px] leading-relaxed">
            Global resolution speed is within acceptable parameters. Keep up the momentum.
          </p>
        </motion.section>

        {/* Gamification Streak (Bento Medium) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          whileHover={{ scale: 1.02, y: -4, rotate: 1 }}
          className="bento-card glass-panel p-6 flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 text-8xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 transform group-hover:scale-110 group-hover:rotate-12">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider">Inbox Zero Streak</span>
            </div>
            <h3 className="text-4xl font-display text-white mt-2">5 <span className="text-xl text-text-muted">Days</span></h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-dim rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-400 w-[70%] h-full rounded-full"></div>
            </div>
            <p className="text-xs text-text-muted font-sans">2 days until next badge 🏆</p>
          </div>
        </motion.div>

        {/* Open Tickets (Bento Small) */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          whileHover={{ scale: 1.02, y: -4, rotate: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterClick({ status: "QUEUED" })}
          className="bento-card glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group hover:border-primary/50 transition-colors text-left"
        >
          <div className="absolute top-4 right-4 p-2 bg-primary/10 rounded-full text-primary opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">
              inbox
            </span>
          </div>
          <span className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider relative z-10">
            Open Tickets
          </span>
          <span className="text-5xl font-display text-white relative z-10 mt-2">
            {counts.open.toString().padStart(2, '0')}
          </span>

          {/* Sparkline Background */}
          <svg
            className="absolute bottom-0 left-0 w-full h-16 opacity-20 group-hover:opacity-40 transition-opacity"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M0,100 L0,50 L20,60 L40,30 L60,40 L80,10 L100,20 L100,100 Z"
              fill="url(#primary-gradient)"
            />
            <path
              d="M0,50 L20,60 L40,30 L60,40 L80,10 L100,20"
              fill="none"
              stroke="var(--theme-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.button>

        {/* Resolved (Bento Small) */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02, y: -4, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterClick({ status: "RESOLVED" })}
          className="bento-card glass-panel p-6 flex flex-col gap-2 relative overflow-hidden hover:border-stable/50 transition-colors text-left group"
        >
          <div className="absolute top-4 right-4 p-2 bg-stable/10 rounded-full text-stable opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">
              task_alt
            </span>
          </div>
          <span className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider">
            Resolved
          </span>
          <span className="text-5xl font-display text-white mt-2">
            {counts.resolved.toString().padStart(2, '0')}
          </span>
          <div className="w-full bg-surface-dim rounded-full h-1.5 mt-auto">
            <div className="bg-stable w-[30%] h-full rounded-full"></div>
          </div>
        </motion.button>

        {/* Stalled Items (Bento Wide) */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.01, y: -2, rotateX: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onFilterClick({ status: "STALLED" })}
          className="md:col-span-2 lg:col-span-2 bento-card glass-panel p-6 flex flex-row items-center justify-between relative overflow-hidden text-left group hover:border-critical/50 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-critical/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-xs font-sans font-bold text-critical uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                error
              </span>
              Attention Required
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-display text-white">
                {counts.stalled.toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-text-muted font-sans">Stalled Tickets</span>
            </div>
          </div>
          <div className="relative z-10 text-right bg-surface-dim/50 p-4 rounded-2xl border border-border-dim/50 backdrop-blur-md">
            <span className="text-xs text-text-muted block font-sans uppercase tracking-wider mb-1">Avg. Delay</span>
            <span className="text-xl font-display text-critical">
              &gt; {counts.avgDelay} days
            </span>
          </div>
        </motion.button>
        
        {/* Ticker Tape (Modernized Pill) */}
        <div className="md:col-span-3 lg:col-span-4 mt-2">
          <div className="w-full overflow-hidden bento-card glass-panel py-3 px-4 relative group flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background-dark to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background-dark to-transparent z-10"></div>
            
            <div className="flex-shrink-0 mr-4 z-20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-sans font-bold text-primary uppercase tracking-wider">Live Feed</span>
            </div>

            <div className="whitespace-nowrap animate-ticker flex items-center text-sm font-sans text-text-muted w-max">
              <div className="flex gap-8 items-center pr-8">
                {tickerItems.length > 0 ? tickerItems.map((t, i) => (
                  <span key={i} className={`flex items-center gap-2 ${t.status === 'STALLED' ? 'text-critical' : ''}`}>
                    <span className="px-2 py-0.5 rounded-md bg-surface-dim text-xs font-mono">{t.dept}</span>
                    {t.title.length > 50 ? t.title.substring(0, 50) + '...' : t.title}
                  </span>
                )) : (
                  <span>All systems nominal. No active signals.</span>
                )}
              </div>
              <div className="flex gap-8 items-center pr-8">
                {tickerItems.length > 0 ? tickerItems.map((t, i) => (
                  <span key={`dup-${i}`} className={`flex items-center gap-2 ${t.status === 'STALLED' ? 'text-critical' : ''}`}>
                    <span className="px-2 py-0.5 rounded-md bg-surface-dim text-xs font-mono">{t.dept}</span>
                    {t.title.length > 50 ? t.title.substring(0, 50) + '...' : t.title}
                  </span>
                )) : (
                  <span>All systems nominal. No active signals.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
