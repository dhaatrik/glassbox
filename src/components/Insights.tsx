import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { generateInsightsReport } from "../services/geminiService";

export function Insights() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [filterCategoryMetrics, setFilterCategoryMetrics] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const storedFeedback = localStorage.getItem("pulse_feedback");
    if (storedFeedback) {
      setFeedbacks(JSON.parse(storedFeedback));
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
  const totalCount = filteredFeedbacks.length || 1;

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
        <div className="flex flex-col gap-2 p-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-primary text-xl"
              >
                psychology
              </motion.span>
              <p className="text-xs text-text-muted font-sans font-bold tracking-widest uppercase">
                Insights Engine v3.0
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-border-dim px-3 py-1.5 rounded-full bg-surface-dim/50 backdrop-blur-md">
                <span className="material-symbols-outlined text-text-muted text-sm">
                  insights
                </span>
                <p className="text-primary text-xs font-bold leading-normal tracking-wider shrink-0 font-sans uppercase">
                   Analysis
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
            Trends &amp; Analysis
          </h1>
        </div>
        <div className="h-[2px] w-full bg-border-dim relative overflow-hidden">
          <div className="absolute h-full bg-primary w-[64%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-4 scrollbar-hide">
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
                className="bg-transparent text-white text-xs outline-none flex-1 [color-scheme:dark]"
              />
              <span className="text-text-muted text-xs">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-white text-xs outline-none flex-1 [color-scheme:dark]"
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
          <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
              04 // Recent Feedback Log
            </h3>
            <div className="flex flex-wrap items-center gap-3 justify-end">
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
      </main>
    </motion.div>
  );
}
