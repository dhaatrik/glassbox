import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "motion/react";
import confetti from "canvas-confetti";

export function Dashboard({ 
  onFilterClick 
}: { 
  onFilterClick: (filter: { dept?: string; status?: string }) => void;
}) {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("Good Day");
  const [counts, setCounts] = useState({ 
    open: 0, 
    resolved: 0, 
    stalled: 0,
    velocity: 84,
    avgDelay: 4.2
  });
  const [tickerItems, setTickerItems] = useState<any[]>([]);

  const [heatmapRange, setHeatmapRange] = useState("4weeks");

  // Dynamic Heatmap Data (randomized for visual effect, reacts to range change)
  const heatmapData = useMemo(() => {
    const days = heatmapRange === "1week" ? 7 : heatmapRange === "12weeks" ? 84 : 28;
    return Array.from({ length: days }).map(() => Math.floor(Math.random() * 5));
  }, [heatmapRange]);

  // Dynamic Sparkline Data
  const sparklineData = useMemo(() => {
    const points = Array.from({ length: 6 }).map(() => 20 + Math.random() * 50);
    const max = Math.max(...points);
    return points.map((p, i) => `${(i * 100) / 5},${100 - (p / max) * 80}`).join(" L");
  }, [counts.open]);

  const handleReaction = (ticketId: string, emoji: string) => {
    const stored = localStorage.getItem("glassbox_tickets");
    if (stored) {
      const tickets = JSON.parse(stored);
      const updatedTickets = tickets.map((t: any) => {
        if (t.id === ticketId) {
          const reactions = t.reactions || {};
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          
          // If it's a "Same 💀" upvote, potentially bump severity/status
          if (emoji === '💀' && reactions[emoji] > 5 && t.status === 'QUEUED') {
            t.status = 'PROCESSING';
          }
          
          return { ...t, reactions };
        }
        return t;
      });
      localStorage.setItem("glassbox_tickets", JSON.stringify(updatedTickets));
      
      // Update local state for ticker
      setTickerItems(updatedTickets.filter((t: any) => t.status !== "RESOLVED"));
    }
  };

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

      // Zero-state confetti
      if (open === 0 && tickets.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#05ff00', '#ffffff']
        });
      }

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
      
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
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
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-2xl border-b border-border-dim">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim/50">
          <div className="flex items-center gap-2">
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary text-lg font-display font-bold tracking-tight md:hidden mr-2"
            >
              [ GLASSBOX ]
            </motion.span>
            <span className="hidden md:inline text-sm font-sans font-medium text-white">
              {greeting}, User.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'k', 'metaKey': true }))}
              className="hidden md:flex items-center gap-2 border border-border-dim bg-surface/30 hover:bg-surface-dim hover:text-primary transition-colors px-3 py-1.5 rounded-full text-xs text-text-muted"
            >
              <span className="material-symbols-outlined text-[14px]">search</span>
              Shortcut ⌘K
            </button>
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
        {/* Live Activity Ticker */}
        <div className="overflow-hidden bg-primary/5 py-1 whitespace-nowrap flex items-center border-b border-primary/10">
          <span className="text-[10px] font-mono font-bold text-primary px-3 uppercase tracking-widest border-r border-primary/20 bg-background-dark relative z-10 flex-shrink-0">
            Live Activity
          </span>
          <div className="relative flex-1 overflow-hidden" style={{ width: '100%' }}>
            <div className="animate-[ticker_30s_linear_infinite] flex gap-8 px-4 text-xs font-sans text-text-muted">
              {tickerItems.length > 0 ? (
                // Duplicate items to ensure seamless loop
                [...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="text-primary font-mono">{item.dept}</span>
                    <span className="text-white truncate max-w-[300px]">{item.title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-border-dim inline-block ml-4"></span>
                  </span>
                ))
              ) : (
                <span className="text-stable">No active issues. System is running optimally.</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        {/* Hero: Global Velocity Gauge (Bento Large) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01, rotateY: 2, rotateX: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="md:col-span-2 md:row-span-2 bento-card glass-panel p-8 flex flex-col items-center justify-center relative overflow-visible group"
        >
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-dim border border-border-dim px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 flex flex-col items-center shadow-2xl whitespace-nowrap">
            <span className="text-xs font-sans font-bold text-white">Exact Velocity: {counts.velocity}%</span>
            <span className="text-[10px] font-sans text-stable flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +2.4% from last week
            </span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface-dim border-b border-r border-border-dim transform rotate-45"></div>
          </div>

          {/* Spotlight effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
          
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
                strokeDasharray="4 8"
                strokeWidth="8"
                strokeLinecap="round"
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
              <span className="text-xs text-text-muted font-sans font-medium tracking-widest mb-1 uppercase flex items-center gap-1">
                Velocity
                <span className="material-symbols-outlined text-[14px] text-stable">arrow_upward</span>
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
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-surface p-2 rounded-full border border-border-dim hover:text-primary transition-colors text-white" aria-label="Quick Action">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </button>
          </div>
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
            <p className="text-xs text-text-muted font-sans flex items-center gap-1">2 days until next badge <span className="text-orange-400">🏆</span></p>
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
          <div className="absolute bottom-0 left-0 w-full h-24 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d={`M0,100 L${sparklineData} L100,100 Z`}
                fill="url(#primary-gradient)"
              />
              <path
                d={`M0,100 L${sparklineData}`}
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
          </div>
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
            <div className="bg-stable h-full rounded-full" style={{ width: `${Math.min((counts.resolved / (counts.open + counts.resolved + counts.stalled || 1)) * 100, 100)}%` }}></div>
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
          className={`md:col-span-2 lg:col-span-2 bento-card glass-panel p-6 flex flex-row items-center justify-between relative overflow-hidden text-left group transition-colors ${counts.stalled > 0 ? "hover:border-critical/50" : "hover:border-primary/50"}`}
        >
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-surface p-2 rounded-full border border-border-dim hover:text-critical transition-colors text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r ${counts.stalled > 0 ? "from-critical/5" : "from-primary/5"} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          <div className="flex flex-col gap-2 relative z-10">
            <span className={`text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 ${counts.stalled > 0 ? "text-critical" : "text-primary"}`}>
              <span className="material-symbols-outlined text-[16px]">
                {counts.stalled > 0 ? "error" : "check_circle"}
              </span>
              {counts.stalled > 0 ? "Attention Required" : "All Clear"}
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
            <span className={`text-xl font-display ${counts.stalled > 0 ? "text-critical" : "text-primary"}`}>
              {counts.stalled > 0 ? `> ${counts.avgDelay} days` : "0 days"}
            </span>
          </div>
        </motion.button>
        </div>

        {/* Weekly Heatmap */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="p-4 md:p-6 lg:p-8 pt-0 max-w-7xl mx-auto w-full"
        >
          <div className="bento-card glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-text-muted">grid_view</span>
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-widest">
                  Activity Heatmap
                </h3>
              </div>
              <div className="relative">
                <select
                  value={heatmapRange}
                  onChange={(e) => setHeatmapRange(e.target.value)}
                  className="bg-transparent text-xs text-text-muted font-sans cursor-pointer hover:text-primary transition-colors appearance-none pr-6 outline-none focus:text-primary [color-scheme:dark]"
                >
                  <option value="1week" className="bg-background-dark text-white">Past 1 Week</option>
                  <option value="4weeks" className="bg-background-dark text-white">Past 4 Weeks</option>
                  <option value="12weeks" className="bg-background-dark text-white">Past 12 Weeks</option>
                </select>
                <span className="material-symbols-outlined text-[16px] absolute right-0 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div className={`grid gap-1.5 md:gap-2 ${
                 heatmapRange === '1week' ? 'grid-cols-7 lg:grid-cols-14' : 
                 heatmapRange === '12weeks' ? 'grid-cols-[repeat(14,minmax(0,1fr))] md:grid-cols-[repeat(28,minmax(0,1fr))] lg:grid-cols-[repeat(42,minmax(0,1fr))]' : 
                 'grid-cols-[repeat(14,minmax(0,1fr))] md:grid-cols-[repeat(28,minmax(0,1fr))]'
               }`}>
              {heatmapData.map((level, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className={`aspect-square rounded-sm md:rounded-md cursor-pointer border border-white/5 transition-colors duration-300 ${
                    level === 0 ? "bg-surface-dim/30 hover:bg-surface-dim/60" :
                    level === 1 ? "bg-primary/20 hover:bg-primary/40" :
                    level === 2 ? "bg-primary/40 hover:bg-primary/60" :
                    level === 3 ? "bg-primary/60 hover:bg-primary/80" :
                    "bg-primary hover:bg-primary"
                  }`}
                  title={`${level * 3} interactions`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] uppercase font-sans tracking-wide text-text-muted">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-surface-dim/30"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
}
