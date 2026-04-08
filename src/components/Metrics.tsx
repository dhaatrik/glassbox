import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { generateInsightsReport } from "../services/geminiService";

export function Metrics({ 
  onChangeView, 
  onFilterClick 
}: { 
  onChangeView: (view: string) => void;
  onFilterClick: (filter: { dept?: string; status?: string }) => void;
}) {
  const [activeTab, setActiveTab] = useState("RANK"); // 'RANK' | 'TRENDS'
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [deptStats, setDeptStats] = useState<Record<string, string>>({
    "[ENG]": "0.4d",
    "[SALES]": "1.2d",
    "[PRODUCT]": "2.1d",
    "[LEGAL]": "5.4d",
    "[HR]": "14.2d"
  });

  useEffect(() => {
    const storedFeedback = localStorage.getItem("pulse_feedback");
    if (storedFeedback) {
      setFeedbacks(JSON.parse(storedFeedback));
    }

    const storedTickets = localStorage.getItem("glassbox_tickets");
    if (storedTickets) {
      const tickets = JSON.parse(storedTickets);
      const depts = ["[ENG]", "[SALES]", "[PRODUCT]", "[LEGAL]", "[HR]", "[MKT]", "[OPS]", "[DES]", "[EXEC]", "[FAC]", "[FIN]"];
      const newStats: Record<string, string> = {};
      
      depts.forEach(dept => {
        const deptTickets = tickets.filter((t: any) => t.dept === dept);
        if (deptTickets.length > 0) {
          const totalDays = deptTickets.reduce((acc: number, t: any) => {
            const match = t.time.match(/(\d+)/);
            return acc + (match ? parseInt(match[1]) : 0);
          }, 0);
          const avg = (totalDays / deptTickets.length).toFixed(1);
          newStats[dept] = `${avg}d`;
        } else {
          newStats[dept] = "0.0d";
        }
      });
      setDeptStats(prev => ({ ...prev, ...newStats }));
    }
  }, []);

  const handleGenerateInsights = async () => {
    if (feedbacks.length === 0) return;
    setIsGenerating(true);
    try {
      const report = await generateInsightsReport(feedbacks);
      setInsights(report);
    } catch (error) {
      console.error("Failed to generate insights", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const searchLower = feedbackSearchQuery.toLowerCase();
    const matchesSearch = fb.text.toLowerCase().includes(searchLower) ||
      (fb.isAnonymous ? "anonymous" : "authenticated user").includes(searchLower);
      
    const matchesDept = filterDept === "ALL" || fb.dept === filterDept;

    let matchesDate = true;
    if (startDate || endDate) {
      const fbDate = new Date(fb.timestamp);
      if (startDate) {
        matchesDate = matchesDate && fbDate >= new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to end date to include the whole day
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        matchesDate = matchesDate && fbDate < end;
      }
    }
    
    return matchesSearch && matchesDept && matchesDate;
  });

  const posCount = filteredFeedbacks.filter(f => f.sentiment === "POSITIVE").length;
  const neuCount = filteredFeedbacks.filter(f => f.sentiment === "NEUTRAL").length;
  const negCount = filteredFeedbacks.filter(f => f.sentiment === "NEGATIVE").length;
  const totalCount = filteredFeedbacks.length || 1; // prevent division by zero

  const posPct = Math.round((posCount / totalCount) * 100);
  const neuPct = Math.round((neuCount / totalCount) * 100);
  const negPct = Math.round((negCount / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 h-full overflow-hidden"
    >
      <header className="flex-none border-b border-border-dim bg-surface-dim/80 backdrop-blur-2xl z-40">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-primary text-xl"
              >
                dataset
              </motion.span>
              <p className="text-xs text-text-muted font-sans font-bold tracking-widest uppercase">
                System Monitor v3.0
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-border-dim px-3 py-1.5 rounded-full bg-surface-dim/50 backdrop-blur-md">
                <span className="material-symbols-outlined text-text-muted text-sm">
                  sort
                </span>
                <p className="text-primary text-xs font-bold leading-normal tracking-wider shrink-0 font-sans uppercase">
                   Velocity
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.reload()}
                className="text-text-muted hover:text-critical transition-colors p-1.5 rounded-full hover:bg-surface-dim"
                title="Disconnect"
              >
                <span className="material-symbols-outlined text-lg">
                  power_settings_new
                </span>
              </motion.button>
            </div>
          </div>
          <h1 className="text-white tracking-tight text-2xl md:text-3xl font-bold font-display leading-tight mt-2">
            Dept Metrics <span className="text-text-muted font-sans font-normal mx-2">/</span> Global Rank
          </h1>
        </div>
        <div className="flex gap-6 px-4 pt-2 md:hidden">
          <button
            onClick={() => setActiveTab("RANK")}
            className={`pb-3 text-xs font-sans font-bold tracking-widest uppercase transition-all relative ${activeTab === "RANK" ? "text-primary" : "text-text-muted hover:text-white"}`}
          >
            Dept Rank
            {activeTab === "RANK" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("TRENDS")}
            className={`pb-3 text-xs font-sans font-bold tracking-widest uppercase transition-all relative ${activeTab === "TRENDS" ? "text-primary" : "text-text-muted hover:text-white"}`}
          >
            Trends & Sentiment
            {activeTab === "TRENDS" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>
        <div className="h-[2px] w-full bg-border-dim relative overflow-hidden">
          <div className="absolute h-full bg-primary w-[64%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 pb-4 md:w-1/2 md:flex-none md:border-r md:border-border-dim scroll-smooth scrollbar-hide ${activeTab === "RANK" ? "block" : "hidden md:block"}`}
        >
          {/* Rank 01 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterClick({ dept: "[ENG]" })}
            className="group relative glass-panel bento-card border-primary/30 hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden p-0"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary group-hover:w-2 transition-all"></div>
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>
            <div className="p-5 pl-8 flex items-center gap-5">
              <div className="flex flex-col items-center justify-center w-12">
                <span className="text-primary font-display text-3xl font-bold">
                  01
                </span>
                <span
                  className="material-symbols-outlined text-stable text-sm mt-1"
                  title="Rising"
                >
                  trending_up
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-white font-sans font-bold text-lg tracking-wide truncate">
                    Engineering
                  </h3>
                  <span className="text-primary font-mono font-bold text-xl">{deptStats["[ENG]"]}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                  <span>Head: A. Lovelace</span>
                  <span className="text-stable bg-stable/10 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
                <div className="h-2 w-full bg-surface-dim border border-border-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[95%] shadow-[0_0_10px_rgba(0,240,255,0.6)] rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rank 02 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterClick({ dept: "[SALES]" })}
            className="group relative glass-panel bento-card hover:border-primary/50 transition-all duration-300 cursor-pointer p-0"
          >
            <div className="p-5 flex items-center gap-5">
              <div className="flex flex-col items-center justify-center w-12 text-text-muted">
                <span className="font-display text-3xl font-bold">02</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-slate-200 font-sans font-bold text-lg tracking-wide truncate">
                    Sales
                  </h3>
                  <span className="text-slate-200 font-mono font-bold text-xl">{deptStats["[SALES]"]}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                  <span>Head: J. Belfort</span>
                  <span className="bg-surface-dim px-2 py-0.5 rounded-full">Normal</span>
                </div>
                <div className="h-2 w-full bg-surface-dim border border-border-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 w-[75%] rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rank 03 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterClick({ dept: "[PRODUCT]" })}
            className="group relative glass-panel bento-card hover:border-primary/50 transition-all duration-300 cursor-pointer p-0"
          >
            <div className="p-5 flex items-center gap-5">
              <div className="flex flex-col items-center justify-center w-12 text-text-muted">
                <span className="font-display text-3xl font-bold">03</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-slate-200 font-sans font-bold text-lg tracking-wide truncate">
                    Product
                  </h3>
                  <span className="text-slate-200 font-mono font-bold text-xl">{deptStats["[PRODUCT]"]}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                  <span>Head: S. Jobs</span>
                  <span className="bg-surface-dim px-2 py-0.5 rounded-full">Normal</span>
                </div>
                <div className="h-2 w-full bg-surface-dim border border-border-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 w-[60%] rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rank 04 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterClick({ dept: "[LEGAL]" })}
            className="group relative glass-panel bento-card hover:border-yellow-500/50 transition-all duration-300 cursor-pointer p-0"
          >
            <div className="p-5 flex items-center gap-5">
              <div className="flex flex-col items-center justify-center w-12 text-text-muted">
                <span className="font-display text-3xl font-bold">04</span>
                <span
                  className="material-symbols-outlined text-yellow-500 text-sm mt-1"
                  title="Stalling"
                >
                  remove
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-slate-300 font-sans font-bold text-lg tracking-wide truncate">
                    Legal
                  </h3>
                  <span className="text-yellow-500 font-mono font-bold text-xl">
                    {deptStats["[LEGAL]"]}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                  <span>Head: S. Goodman</span>
                  <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Lagging</span>
                </div>
                <div className="h-2 w-full bg-surface-dim border border-border-dim rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[40%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rank 05: Bottleneck */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterClick({ dept: "[HR]" })}
            className="group relative glass-panel bento-card border-critical/50 hover:bg-critical/5 transition-all duration-300 cursor-pointer mt-8 p-0 !overflow-visible"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-dim px-3 py-1 rounded-full border border-critical text-[10px] text-critical font-sans font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(255,68,68,0.3)] z-10">
              <span className="material-symbols-outlined text-xs">warning</span>
              Bottleneck Detected
            </div>
            <div className="p-5 flex items-center gap-5 pt-8">
              <div className="flex flex-col items-center justify-center w-12 text-critical">
                <span className="font-display text-3xl font-bold">05</span>
                <span
                  className="material-symbols-outlined text-sm mt-1"
                  title="Critical"
                >
                  arrow_downward
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-white font-sans font-bold text-lg tracking-wide truncate group-hover:text-critical transition-colors">
                    Human Resources
                  </h3>
                  <span className="text-critical font-mono font-bold text-xl glitch-hover">
                    {deptStats["[HR]"]}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                  <span>Head: T. Flenderson</span>
                  <span className="text-critical bg-critical/10 px-2 py-0.5 rounded-full">Critical</span>
                </div>
                <div className="h-2 w-full bg-surface-dim border border-critical/30 rounded-full overflow-hidden flex">
                  <div className="h-full bg-critical w-[15%] animate-pulse shadow-[0_0_10px_rgba(255,68,68,0.6)] rounded-l-full"></div>
                  <div
                    className="h-full bg-critical/20 flex-1 rounded-r-full"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 42, 109, 0.2) 5px, rgba(255, 42, 109, 0.2) 10px)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center py-6 opacity-50">
            <p className="text-[10px] text-text-muted font-sans font-bold uppercase tracking-widest">
              End of Report // Scroll for Archive
            </p>
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 space-y-6 pb-4 scrollbar-hide ${activeTab === "TRENDS" ? "block" : "hidden md:block"}`}
        >
          {/* Sentiment Analysis */}
          <section className="space-y-3 glass-panel bento-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
                01 // Sentiment Analysis
              </h3>
              <div className="flex items-center gap-2 bg-surface-dim/50 border border-border-dim rounded-xl px-3 py-1.5">
                <span className="material-symbols-outlined text-text-muted text-sm">calendar_today</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none [color-scheme:dark]"
                />
                <span className="text-text-muted text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-end">
                <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                  {filteredFeedbacks.length > 0 ? posPct : 0}<span className="text-xl text-text-muted font-sans">%</span>
                </div>
                <div className="text-xs font-sans font-bold text-stable flex items-center gap-1 uppercase tracking-wider bg-stable/10 px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">
                    {posPct > 50 ? "trending_up" : "trending_down"}
                  </span>
                  {filteredFeedbacks.length} Total Feedbacks
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="h-3 w-full bg-surface-dim flex rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-stable transition-all" style={{ width: `${filteredFeedbacks.length > 0 ? posPct : 0}%` }}></div>
                <div className="h-full bg-yellow-500 transition-all" style={{ width: `${filteredFeedbacks.length > 0 ? neuPct : 0}%` }}></div>
                <div className="h-full bg-critical transition-all" style={{ width: `${filteredFeedbacks.length > 0 ? negPct : 0}%` }}></div>
              </div>

              <div className="flex justify-between text-xs font-sans font-bold uppercase tracking-wider">
                <span className="text-stable">Pos: {filteredFeedbacks.length > 0 ? posPct : 0}%</span>
                <span className="text-yellow-500">Neu: {filteredFeedbacks.length > 0 ? neuPct : 0}%</span>
                <span className="text-critical">Neg: {filteredFeedbacks.length > 0 ? negPct : 0}%</span>
              </div>
            </div>
          </section>

          {/* Actionable Insights Report */}
          <section className="space-y-3 glass-panel bento-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
                02 // Actionable Insights
              </h3>
              <motion.button
                whileHover={!isGenerating && filteredFeedbacks.length > 0 ? { scale: 1.05 } : {}}
                whileTap={!isGenerating && filteredFeedbacks.length > 0 ? { scale: 0.95 } : {}}
                onClick={handleGenerateInsights}
                disabled={isGenerating || filteredFeedbacks.length === 0}
                className="text-xs font-sans font-bold text-black bg-primary px-3 py-1.5 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all uppercase tracking-wider"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    Generate AI Report
                  </>
                )}
              </motion.button>
            </div>

            {insights ? (
              <div className="bg-surface-dim/50 border border-primary/30 p-5 rounded-xl space-y-6">
                {insights.tldr && (
                  <div className="bg-primary/10 p-5 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                    <h4 className="text-primary text-sm font-bold font-sans mb-2 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">bolt</span>
                      Vibe Check (TL;DR)
                    </h4>
                    <p className="text-white font-sans text-lg leading-relaxed">
                      "{insights.tldr}"
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-surface-dim/50 p-4 rounded-xl border border-border-dim">
                    <h4 className="text-primary text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">tag</span>
                      Recurring Themes
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 font-sans">
                      {insights.recurringThemes?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-surface-dim/50 p-4 rounded-xl border border-border-dim">
                    <h4 className="text-primary text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">flag</span>
                      Top 3 Takeaways
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 font-sans">
                      {insights.topTakeaways?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-critical/5 p-4 rounded-xl border border-critical/20">
                    <h4 className="text-critical text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Areas of Concern
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 font-sans">
                      {insights.areasOfConcern?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-stable/5 p-4 rounded-xl border border-stable/20">
                    <h4 className="text-stable text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">thumb_up</span>
                      Areas of Praise
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 font-sans">
                      {insights.areasOfPraise?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                  <h4 className="text-yellow-500 text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    Recommended Actions
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 font-sans">
                    {insights.recommendedActions?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-surface-dim/50 border border-border-dim p-8 rounded-xl flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-text-muted text-2xl">
                    analytics
                  </span>
                </div>
                <p className="text-sm font-sans text-text-muted max-w-xs">
                  {filteredFeedbacks.length > 0
                    ? "Click 'Generate AI Report' to analyze recent feedback."
                    : "No feedback data available. Submit feedback to generate insights."}
                </p>
              </div>
            )}
          </section>

          {/* Month-over-Month Trends */}
          <section className="space-y-3 glass-panel bento-card p-5">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              03 // Volume Trends (MoM)
            </h3>
            <div className="bg-surface-dim/50 border border-border-dim p-4 rounded-xl flex items-end justify-between h-40 gap-3">
              {[
                { month: "Aug", val: 40 },
                { month: "Sep", val: 55 },
                { month: "Oct", val: 45 },
                { month: "Nov", val: 70 },
                { month: "Dec", val: 60 },
                { month: "Jan", val: 85 },
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 flex-1 group h-full justify-end"
                >
                  <div
                    className="w-full bg-primary/20 relative rounded-t-md transition-all duration-300 group-hover:bg-primary/40"
                    style={{ height: `${d.val}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full bg-primary transition-all duration-300 group-hover:h-3 h-1.5 rounded-t-md"></div>
                  </div>
                  <span className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Feedback Log */}
          <section className="space-y-3 pt-6 border-t border-border-dim">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
                04 // Recent Feedback Log
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full focus:border-primary outline-none transition-colors shadow-lg cursor-pointer [color-scheme:dark]"
                >
                  <option value="ALL">ALL DEPTS</option>
                  <option value="[ENG]">[ENG]</option>
                  <option value="[SALES]">[SALES]</option>
                  <option value="[PRODUCT]">[PRODUCT]</option>
                  <option value="[LEGAL]">[LEGAL]</option>
                  <option value="[HR]">[HR]</option>
                  <option value="[MKT]">[MKT]</option>
                  <option value="[OPS]">[OPS]</option>
                  <option value="[DES]">[DES]</option>
                  <option value="[EXEC]">[EXEC]</option>
                  <option value="[FAC]">[FAC]</option>
                  <option value="[FIN]">[FIN]</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={feedbackSearchQuery}
                    onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                    className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full focus:border-primary outline-none w-48 transition-colors shadow-lg"
                  />
                  <span className="material-symbols-outlined absolute right-2 top-1.5 text-text-muted text-[16px]">
                    search
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.slice().reverse().map((fb) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={fb.id} 
                    className="glass-panel bento-card p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                          fb.sentiment === "POSITIVE" ? "bg-stable/10 text-stable border border-stable/30" :
                          fb.sentiment === "NEGATIVE" ? "bg-critical/10 text-critical border border-critical/30" :
                          "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                        }`}>
                          {fb.sentiment}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-text-muted">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-slate-200 mt-2 leading-relaxed">
                      "{fb.text}"
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs font-sans font-bold text-text-muted uppercase tracking-wider">
                      <span className="bg-surface-dim px-2 py-1 rounded-md">{fb.dept}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">
                          {fb.isAnonymous ? "visibility_off" : "person"}
                        </span>
                        {fb.isAnonymous ? "Anonymous" : "Authenticated User"}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-sm font-sans text-text-muted border border-dashed border-border-dim rounded-xl bg-surface-dim/30">
                  No records found.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
}
