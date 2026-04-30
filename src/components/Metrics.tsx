import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { generateInsightsReport } from "../services/geminiService";

const DEPT_INFO: Record<string, { name: string, head: string }> = {
  "[ENG]": { name: "Engineering", head: "A. Lovelace" },
  "[SALES]": { name: "Sales", head: "J. Belfort" },
  "[PRODUCT]": { name: "Product", head: "S. Jobs" },
  "[LEGAL]": { name: "Legal", head: "S. Goodman" },
  "[HR]": { name: "Human Resources", head: "T. Flenderson" },
  "[MKT]": { name: "Marketing", head: "D. Draper" },
  "[OPS]": { name: "Operations", head: "M. Scott" },
  "[DES]": { name: "Design", head: "P. Rand" },
  "[EXEC]": { name: "Executive", head: "L. Roy" },
  "[FAC]": { name: "Facilities", head: "R. Swanson" },
  "[FIN]": { name: "Finance", head: "G. Gekko" },
};

type DeptMetric = {
  dept: string;
  name: string;
  head: string;
  avgDelay: number;
  totalOpen: number;
  stalled: number;
};

export function Metrics({ 
  onFilterClick 
}: { 
  onFilterClick: (filter: { dept?: string; status?: string }) => void;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RANK"); // 'RANK' | 'TRENDS'
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [filterCategoryMetrics, setFilterCategoryMetrics] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [deptMetrics, setDeptMetrics] = useState<DeptMetric[]>([]);

  useEffect(() => {
    const storedFeedback = localStorage.getItem("pulse_feedback");
    if (storedFeedback) {
      setFeedbacks(JSON.parse(storedFeedback));
    }

    const storedTickets = localStorage.getItem("glassbox_tickets");
    if (storedTickets) {
      const tickets = JSON.parse(storedTickets);
      
      const metrics: DeptMetric[] = Object.entries(DEPT_INFO).map(([dept, info]) => {
        const deptTickets = tickets.filter((t: any) => t.dept === dept && t.status !== "RESOLVED");
        const stalledTickets = deptTickets.filter((t: any) => t.status === "STALLED");
        
        let avgDelay = 0;
        if (deptTickets.length > 0) {
          const totalDays = deptTickets.reduce((acc: number, t: any) => {
            const match = t.time.match(/(\d+)/);
            return acc + (match ? parseInt(match[1]) : 0);
          }, 0);
          avgDelay = totalDays / deptTickets.length;
        }
        
        return {
          dept,
          name: info.name,
          head: info.head,
          avgDelay,
          totalOpen: deptTickets.length,
          stalled: stalledTickets.length
        };
      });

      // Sort by avgDelay ascending (Optimal to Critical)
      metrics.sort((a, b) => {
        if (a.avgDelay !== b.avgDelay) return a.avgDelay - b.avgDelay;
        return a.totalOpen - b.totalOpen;
      });
      
      // Filter out depts with 0 open if we want? Or show them at top as optimal?
      // Since we want to see "Zero work -> Blue", let's keep them and show them.
      // But maybe let's just pick top 5 or 6 highest activity/delay ones if too many.
      // Actually let's just show top 5 worst, and top 2 best, or whatever fits. 
      // For now let's just show all that have open tickets, + maybe top 1 empty.
      // Wait, let's just show top 5 total to match the previous UI limit.
      const displayMetrics = metrics.slice(0, 5);
      
      // Let's actually show the ones with the HIGHEST delay at the bottom, so we slice the worst and best or just sort all and map them.
      // E.g. sort so 01 is BEST, 0X is WORST. So asc is fine. Let's just show top 10? The previous had 5. We can show all 11, it's scrollable.
      setDeptMetrics(metrics);
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
    const matchesCategory = filterCategoryMetrics === "ALL" || fb.category === filterCategoryMetrics;

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
    
    return matchesSearch && matchesDept && matchesCategory && matchesDate;
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
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
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
          {deptMetrics.map((m, index) => {
            const rank = (index + 1).toString().padStart(2, '0');
            const isCritical = m.stalled > 0 || m.avgDelay > 7;
            const isLagging = !isCritical && m.avgDelay > 3;
            const isOptimal = !isCritical && !isLagging && m.totalOpen === 0;
            const isNormal = !isCritical && !isLagging && m.totalOpen > 0;

            const statusLabel = isCritical ? 'Critical' : isLagging ? 'Lagging' : isOptimal ? 'Optimal' : 'Normal';
            const fillWidth = isCritical ? '15%' : isLagging ? '40%' : isNormal ? '60%' : '95%';

            let borderClass = 'border-primary/30 hover:border-primary';
            if (isCritical) borderClass = 'border-critical/50 hover:bg-critical/5 !overflow-visible mt-8';
            else if (isLagging) borderClass = 'border-yellow-500/30 hover:border-yellow-500';
            else if (isNormal) borderClass = 'border-primary/30 hover:border-primary/50';

            return (
              <motion.div 
                key={m.dept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFilterClick({ dept: m.dept })}
                className={`group relative glass-panel bento-card transition-all duration-300 cursor-pointer overflow-hidden p-0 ${borderClass}`}
              >
                {isCritical && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-dim px-3 py-1 rounded-full border border-critical text-[10px] text-critical font-sans font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(255,68,68,0.3)] z-10">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    Bottleneck Detected
                  </div>
                )}
                {isOptimal && (
                  <>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary group-hover:w-2 transition-all"></div>
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>
                  </>
                )}
                <div className={`p-5 flex items-center gap-5 ${isCritical ? 'pt-8' : isOptimal ? 'pl-8' : ''}`}>
                  <div className={`flex flex-col items-center justify-center w-12 ${isCritical ? 'text-critical' : isOptimal ? 'text-primary' : 'text-text-muted'}`}>
                    <span className="font-display text-3xl font-bold">{rank}</span>
                    {(isCritical || isLagging || isOptimal) && (
                      <span className={`material-symbols-outlined text-sm mt-1 ${isLagging ? 'text-yellow-500' : isOptimal ? 'text-stable' : ''}`} title={statusLabel}>
                        {isCritical ? 'arrow_downward' : isLagging ? 'remove' : isOptimal ? 'trending_up' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-sans font-bold text-lg tracking-wide truncate ${isCritical ? 'text-white group-hover:text-critical transition-colors' : 'text-slate-200'}`}>
                        {m.name}
                      </h3>
                      <span className={`font-mono font-bold text-xl ${isCritical ? 'text-critical glitch-hover' : isLagging ? 'text-yellow-500' : isOptimal ? 'text-primary' : 'text-slate-200'}`}>
                        {m.avgDelay.toFixed(1)}d
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-text-muted font-sans font-bold uppercase tracking-wider mb-3">
                      <span>Head: {m.head}</span>
                      <span className={`px-2 py-0.5 rounded-full ${isCritical ? 'text-critical bg-critical/10' : isLagging ? 'text-yellow-500 bg-yellow-500/10' : isOptimal ? 'text-stable bg-stable/10' : 'bg-surface-dim'}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className={`h-2 w-full bg-surface-dim border ${isCritical ? 'border-critical/30' : 'border-border-dim'} rounded-full overflow-hidden flex`}>
                      <div className={`h-full ${isCritical ? 'bg-critical shadow-[0_0_10px_rgba(255,68,68,0.6)] animate-pulse rounded-l-full' : isLagging ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)] rounded-full' : isOptimal ? 'bg-primary shadow-[0_0_10px_rgba(0,240,255,0.6)] rounded-full' : 'bg-primary/50 rounded-full'}`} style={{ width: fillWidth }}></div>
                      {isCritical && (
                        <div
                          className="h-full bg-critical/20 flex-1 rounded-r-full"
                          style={{
                            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 42, 109, 0.2) 5px, rgba(255, 42, 109, 0.2) 10px)",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

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
                  value={filterCategoryMetrics}
                  onChange={(e) => setFilterCategoryMetrics(e.target.value)}
                  className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full focus:border-primary outline-none transition-colors shadow-lg cursor-pointer [color-scheme:dark]"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  <option value="Culture">Culture</option>
                  <option value="Workload">Workload</option>
                  <option value="Management">Management</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
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
                        {fb.category && (
                          <span className="text-[10px] font-sans font-bold px-2 py-1 rounded-full bg-surface-dim border border-border-dim text-white/80">
                            {fb.category}
                          </span>
                        )}
                        {/* Tags for category updates by admin */}
                        <div className="relative group/category">
                           <button className="text-text-muted hover:text-white p-1 rounded-md bg-surface border border-transparent hover:border-border-dim transition-colors">
                              <span className="material-symbols-outlined text-[14px]">sell</span>
                           </button>
                           <div className="absolute top-full left-0 mt-1 w-32 bg-surface-dim border border-border-dim rounded-lg shadow-xl opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible z-10 flex flex-col overflow-hidden">
                              {["Culture", "Workload", "Management", "Tools", "Other"].map(cat => (
                                <button 
                                  key={cat} 
                                  onClick={() => {
                                    const updated = feedbacks.map(f => f.id === fb.id ? { ...f, category: cat } : f);
                                    setFeedbacks(updated);
                                    localStorage.setItem("pulse_feedback", JSON.stringify(updated));
                                  }}
                                  className="text-xs text-left px-3 py-2 hover:bg-white/5 text-white"
                                >
                                  {cat}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-text-muted">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-slate-200 mt-2 leading-relaxed">
                      "{fb.text}"
                    </p>
                    <div className="mt-4 flex flex-col gap-2 relative">
                      {/* Pulse stats display */}
                      {fb.pulseAnswers && Object.keys(fb.pulseAnswers).length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-1 pb-3 border-b border-border-dim/50">
                           {Object.entries(fb.pulseAnswers).map(([question, ans], idx) => (
                              <div key={idx} className="flex flex-col gap-0.5 bg-surface-dim/40 border border-border-dim px-2 py-1.5 rounded-lg max-w-[200px]">
                                <span className="text-[9px] text-text-muted truncate lowercase tracking-wider">{question}</span>
                                <span className="text-xs font-display text-white">{String(ans)}</span>
                              </div>
                           ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs font-sans font-bold text-text-muted uppercase tracking-wider">
                        <span className="bg-surface-dim px-2 py-1 rounded-md">{fb.dept}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">
                            {fb.isAnonymous ? "visibility_off" : "person"}
                          </span>
                          {fb.isAnonymous ? "Anonymous" : "Authenticated User"}
                        </span>
                      </div>
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
