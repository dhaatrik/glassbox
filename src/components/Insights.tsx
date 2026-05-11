import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { generateInsightsReport } from "../services/geminiService";
import html2canvas from "html2canvas";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index));
      index++;
      if (index > text.length + 10) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);
  
  return (
    <p className="text-white font-sans text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap font-mono min-h-[60px]">
      {displayedText}
      <span className="animate-pulse bg-primary inline-block w-2 h-4 ml-1 align-middle"></span>
    </p>
  )
};

const WordCloud = ({ words }: { words: string[] }) => {
  return (
    <div className="h-48 relative overflow-hidden bg-black/20 rounded-xl border border-white/5 shadow-inner perspective-1000 mt-4">
       {words.map((word, i) => (
         <motion.div
           key={i}
           className="absolute text-primary font-sans font-bold text-sm whitespace-nowrap px-2 py-1 bg-surface-dim/80 backdrop-blur-sm rounded-md border border-primary/20 shadow-lg"
           initial={{ 
             x: Math.random() * 300 - 50, 
             y: Math.random() * 150 - 20,
             opacity: 0,
             scale: 0.5 
           }}
           animate={{ 
             x: [Math.random() * 300, Math.random() * 200, Math.random() * 300],
             y: [Math.random() * 150, Math.random() * 100, Math.random() * 150],
             opacity: [0.4, 1, 0.4],
           }}
           transition={{ 
             duration: 15 + Math.random() * 10, 
             repeat: Infinity, 
             repeatType: "reverse",
             ease: "easeInOut"
           }}
         >
           {word}
         </motion.div>
       ))}
    </div>
  )
};

const HeatmapStrip = () => {
    const days = Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      intensity: Math.random() > 0.5 ? Math.random() : 0.1
    }));
    return (
      <div className="flex gap-1 overflow-x-auto no-scrollbar py-2 w-full mt-2">
         {days.map((d, i) => (
           <div 
             key={i}
             className="w-6 h-10 rounded-sm flex-shrink-0 relative group hover:scale-110 transition-transform cursor-pointer"
             style={{ backgroundColor: `rgba(0, 240, 255, ${Math.max(0.05, d.intensity * 0.8)})` }}
           >
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-[0_0_10px_rgba(0,240,255,0.3)] border border-primary/30">
               {d.date.toLocaleDateString()}
             </div>
           </div>
         ))}
      </div>
    )
};

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
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

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

  const radarData = useMemo(() => {
      return [
        { subject: 'Culture', A: 80, fullMark: 100 },
        { subject: 'Workload', A: 40, fullMark: 100 },
        { subject: 'Tools', A: 60, fullMark: 100 },
        { subject: 'Comms', A: 75, fullMark: 100 },
        { subject: 'Mgmt', A: 65, fullMark: 100 },
      ];
  }, []);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Glassbox-Analysis-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center gap-2 border border-primary/50 text-primary px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 backdrop-blur-md transition-colors"
              >
                <span className={`material-symbols-outlined text-sm ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'sync' : 'download'}
                </span>
                <span className="text-xs font-bold font-sans uppercase tracking-wider hidden md:block">
                  {isExporting ? 'Capturing...' : 'Briefing'}
                </span>
              </motion.button>
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

      <main className="flex-1 overflow-y-auto z-10 w-full scrollbar-hide relative" ref={reportRef}>
        {/* Subtle Data Grid Parallax Background */}
        <div className="absolute inset-x-0 top-0 h-[300vh] pointer-events-none opacity-[0.02] z-0" 
             style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'translateY(-10%) translateZ(0) perspective(500px) rotateX(20deg)', transformOrigin: 'top center' }}>
        </div>

        <div className="p-4 space-y-6 pb-20 max-w-7xl mx-auto relative z-10">
        {/* Sentiment Analysis */}
        <section className="space-y-3 glass-panel bento-card p-5 bg-surface-dim/80 backdrop-blur-xl border border-white/5">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
             <div className="space-y-4">
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

               {/* Calendar Heatmap Strip */}
               <h4 className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-4">Activity Heatmap</h4>
               <HeatmapStrip />
             </div>
             
             {/* Holographic Pulse Radar */}
             <div className="h-48 w-full relative perspective-1000">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 z-0 mix-blend-screen scale-150 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: 'sans-serif', fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Pulse" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.3} isAnimationActive={true} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </section>

        {/* Actionable Insights Report */}
        <section className="space-y-3 glass-panel bento-card p-5 bg-surface-dim/80 backdrop-blur-xl border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background-dark to-background-dark pointer-events-none z-0"></div>
          <div className="flex items-center justify-between relative z-10">
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
            <div className="bg-surface-dim/50 border border-primary/30 p-5 rounded-xl space-y-6 relative z-10">
              {insights.tldr && (
                <div className="bg-primary/10 p-5 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative">
                  <div className="absolute top-0 right-0 p-2 opacity-30 pointer-events-none">
                     <span className="material-symbols-outlined text-primary text-4xl">memory</span>
                  </div>
                  <h4 className="text-primary text-sm font-bold font-sans mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    Neural Stream: TL;DR Synthesis
                  </h4>
                  <TypewriterText text={insights.tldr} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-surface-dim/50 p-4 rounded-xl border border-white/10 shadow-inner">
                  <h4 className="text-primary text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tag</span>
                    Neural Vectors (Themes)
                  </h4>
                  <WordCloud words={insights.recurringThemes || []} />
                </div>
                <div className="bg-surface-dim/50 p-4 rounded-xl border border-white/10 shadow-inner">
                  <h4 className="text-primary text-xs font-bold font-sans mb-3 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">flag</span>
                    Top 3 Takeaways
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-4 font-sans font-medium">
                    {insights.topTakeaways?.map((item: string, i: number) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                      >{item}</motion.li>
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
        <section className="space-y-3 glass-panel bento-card p-5 bg-surface-dim/80 backdrop-blur-xl border border-white/5">
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            03 // Volume Trends (MoM Neon Glow)
          </h3>
          <div className="bg-surface-dim/50 border border-white/10 p-4 rounded-xl h-64 relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
                  { month: "Aug", val: 40 },
                  { month: "Sep", val: 55 },
                  { month: "Oct", val: 45 },
                  { month: "Nov", val: 70 },
                  { month: "Dec", val: 60 },
                  { month: "Jan", val: 85 },
                ]}>
                 <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }} />
                 <Area type="monotone" dataKey="val" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" 
                       style={{ filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))" }} />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Feedback Log */}
        <section className="space-y-4 pt-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
              04 // Raw Intelligence Feed (Click to Deep Dive)
            </h3>
            
            {/* Swipeable Segment Pills */}
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar w-full">
              {["ALL", "Culture", "Workload", "Management", "Tools", "Other"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategoryMetrics(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${filterCategoryMetrics === cat ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-surface/80 border border-white/5 text-text-muted hover:text-white backdrop-blur-md'}`}
                >
                  {cat === "ALL" ? "ALL CATEGORIES" : cat}
                </button>
              ))}
              <div className="flex-shrink-0 w-[1px] h-6 bg-white/10 mx-1 self-center"></div>
              {["ALL DEPTS", "[ENG]", "[SALES]", "[PRODUCT]", "[HR]", "[OPS]"].map(dept => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept === "ALL DEPTS" ? "ALL" : dept)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all ${filterDept === (dept === "ALL DEPTS" ? "ALL" : dept) ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-surface/80 border border-white/5 text-text-muted hover:text-white backdrop-blur-md'}`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback..."
                value={feedbackSearchQuery}
                onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                className="w-full bg-surface-dim/80 backdrop-blur-md border border-white/10 text-white text-sm px-4 py-3 rounded-xl focus:border-primary outline-none transition-colors shadow-inner"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-text-muted text-[20px]">
                search
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 perspective-1000">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.slice().reverse().map((fb) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={fb.id} 
                  className="relative [perspective:1000px]"
                  style={{ minHeight: '220px' }}
                >
                  <motion.div 
                    className="w-full h-full relative"
                    animate={{ rotateY: flippedCardId === fb.id ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* FRONT OF CARD */}
                    <div 
                       className="absolute inset-0 glass-panel bento-card p-4 cursor-pointer hover:border-primary/50 transition-colors bg-surface-dim/80 backdrop-blur-xl border border-white/5 flex flex-col [backface-visibility:hidden]" 
                       onClick={() => setFlippedCardId(fb.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            fb.sentiment === "POSITIVE" ? "bg-stable/10 text-stable border border-stable/30 shadow-[0_0_10px_rgba(5,255,0,0.1)]" :
                            fb.sentiment === "NEGATIVE" ? "bg-critical/10 text-critical border border-critical/30 shadow-[0_0_10px_rgba(255,68,68,0.1)]" :
                            "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                          }`}>
                            {fb.sentiment}
                          </span>
                          {fb.category && (
                            <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
                              {fb.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-text-muted">
                          {new Date(fb.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-sans text-slate-200 mt-2 leading-relaxed flex-1 line-clamp-4">
                        "{fb.text}"
                      </p>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-sans font-bold text-text-muted uppercase tracking-wider pt-3 border-t border-white/5">
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md">{fb.dept}</span>
                        <span className="flex items-center gap-1.5 flex-row-reverse">
                           <span className="material-symbols-outlined text-[14px]">
                             {fb.isAnonymous ? "visibility_off" : "person"}
                           </span>
                           {fb.isAnonymous ? "Anon" : "Auth. User"}
                        </span>
                      </div>
                    </div>

                    {/* BACK OF CARD */}
                    <div 
                       className="absolute inset-0 glass-panel bento-card p-4 bg-background-dark/95 border-primary/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col pt-10 [backface-visibility:hidden]" 
                       style={{ transform: 'rotateY(180deg)' }}
                    >
                       <button 
                         className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors border border-white/5"
                         onClick={() => setFlippedCardId(null)}
                       >
                         <span className="material-symbols-outlined text-[16px] block">close</span>
                       </button>
                       <h4 className="text-[10px] text-primary font-bold tracking-widest uppercase mb-2 absolute top-4 left-4 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[14px]">troubleshoot</span>
                         Deep Dive
                       </h4>
                       <div className="flex-1 overflow-y-auto no-scrollbar">
                          <div className="space-y-3">
                             {fb.pulseAnswers && Object.keys(fb.pulseAnswers).length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                   {Object.entries(fb.pulseAnswers).map(([q, a], idx) => (
                                      <div key={idx} className="bg-white/5 border border-white/10 p-2 rounded-lg">
                                         <div className="text-[8px] text-text-muted uppercase tracking-widest break-words leading-tight">{q}</div>
                                         <div className="text-xs font-bold text-white mt-1 break-words line-clamp-2">{String(a)}</div>
                                      </div>
                                   ))}
                                </div>
                             )}
                             <p className="text-xs text-white/70 italic leading-relaxed border-l-2 border-primary/30 pl-3">"{fb.text}"</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => {
                           const updated = feedbacks.filter(f => f.id !== fb.id);
                           setFeedbacks(updated);
                           localStorage.setItem("pulse_feedback", JSON.stringify(updated));
                           setFlippedCardId(null);
                         }}
                         className="w-full mt-3 bg-stable/10 hover:bg-stable/20 text-stable border border-stable/30 font-bold uppercase tracking-widest text-[10px] py-2 rounded-lg transition-colors flex items-center justify-center gap-2 group/resolve"
                       >
                         <span className="material-symbols-outlined text-[14px] group-hover/resolve:scale-110 transition-transform">check_circle</span>
                         Mark Resolved
                       </button>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-sm font-sans text-text-muted border border-dashed border-white/10 rounded-xl bg-surface-dim/30">
                No signal found in this sector.
              </div>
            )}
          </div>
        </section>
        </div>
      </main>
    </motion.div>
  );
}
