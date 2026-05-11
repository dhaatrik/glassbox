import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";

const DEPT_INFO: Record<string, { name: string, head: string, avatar: string }> = {
  "[ENG]": { name: "Engineering", head: "A. Lovelace", avatar: "AL" },
  "[SALES]": { name: "Sales", head: "J. Belfort", avatar: "JB" },
  "[PRODUCT]": { name: "Product", head: "S. Jobs", avatar: "SJ" },
  "[LEGAL]": { name: "Legal", head: "S. Goodman", avatar: "SG" },
  "[HR]": { name: "Human Resources", head: "T. Flenderson", avatar: "TF" },
  "[MKT]": { name: "Marketing", head: "D. Draper", avatar: "DD" },
  "[OPS]": { name: "Operations", head: "M. Scott", avatar: "MS" },
  "[DES]": { name: "Design", head: "P. Rand", avatar: "PR" },
  "[EXEC]": { name: "Executive", head: "L. Roy", avatar: "LR" },
  "[FAC]": { name: "Facilities", head: "R. Swanson", avatar: "RS" },
  "[FIN]": { name: "Finance", head: "G. Gekko", avatar: "GG" },
};

type DeptMetric = {
  dept: string;
  name: string;
  head: string;
  avatar: string;
  avgDelay: number;
  totalOpen: number;
  stalled: number;
  stalledTitles: string[];
  blastRadius: number;
  sparkline: number[];
};

export function Metrics({ 
  onFilterClick 
}: { 
  onFilterClick: (filter: { dept?: string; status?: string }) => void;
}) {
  const navigate = useNavigate();
  const [deptMetrics, setDeptMetrics] = useState<DeptMetric[]>([]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<"ALL" | "CRITICAL" | "LAGGING" | "OPTIMAL">("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

        // Mock sparkline data (random trend based on status)
        const sparkline = Array.from({ length: 12 }, () => {
          let base = stalledTickets.length > 0 ? 8 : avgDelay > 3 ? 5 : 2;
          return Math.max(1, Math.min(10, base + (Math.random() * 4 - 2)));
        });
        
        return {
          dept,
          name: info.name,
          head: info.head,
          avatar: info.avatar,
          avgDelay,
          totalOpen: deptTickets.length,
          stalled: stalledTickets.length,
          stalledTitles: stalledTickets.map((t: any) => t.title),
          blastRadius: Math.min(10, Number((stalledTickets.length * 1.5 + avgDelay * 0.8).toFixed(1))),
          sparkline,
        };
      });

      // Sort by avgDelay ascending (Optimal to Critical)
      metrics.sort((a, b) => {
        if (b.blastRadius !== a.blastRadius) return b.blastRadius - a.blastRadius; // Highest blast radius first
        return b.avgDelay - a.avgDelay;
      });
      
      setDeptMetrics(metrics);
    }
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
      a.download = `Glassbox-Report-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Weather report synthesis
  const weatherReport = useMemo(() => {
    if (deptMetrics.length === 0) return "Gathering atmospheric data...";
    const criticalCount = deptMetrics.filter(m => m.stalled > 0 || m.avgDelay > 7).length;
    if (criticalCount >= 3) return "SEVERE STORM WARNING. Multiple departments actively bottlenecked. Immediate intervention required in top tier.";
    if (criticalCount > 0) return "Turbulence detected. Expect isolated delays; some operational blockages actively forming.";
    const laggingCount = deptMetrics.filter(m => m.avgDelay > 3).length;
    if (laggingCount > 3) return "Overcast. Widespread low-level friction. Throughput is steadily decreasing across the board.";
    return "Clear Skies. All vectors optimal. Systemic throughput is nominal with no major pressure zones.";
  }, [deptMetrics]);

  const filteredMetrics = useMemo(() => {
    return deptMetrics.filter(m => {
      const isCritical = m.stalled > 0 || m.avgDelay > 7;
      const isLagging = !isCritical && m.avgDelay > 3;
      const isOptimal = !isCritical && !isLagging && m.totalOpen === 0;
      
      if (activeSegment === "CRITICAL") return isCritical;
      if (activeSegment === "LAGGING") return isLagging;
      if (activeSegment === "OPTIMAL") return isOptimal;
      return true;
    });
  }, [deptMetrics, activeSegment]);

  const topThree = deptMetrics.slice(0, 3);


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 min-h-0 overflow-hidden relative"
    >
      {/* Live Data Stream Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden mix-blend-screen" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, .3) 25%, rgba(0, 240, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, .3) 75%, rgba(0, 240, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, .3) 25%, rgba(0, 240, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, .3) 75%, rgba(0, 240, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px', 
      backgroundPosition: '0 0, 0 0' }}>
         <motion.div animate={{ y: [0, 50] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-full h-[50px] bg-gradient-to-b from-transparent to-primary/30 blur-md"></motion.div>
      </div>

      <header className="flex-none border-b border-border-dim bg-surface-dim/80 backdrop-blur-2xl z-40 relative">
        <div className="flex flex-col gap-2 p-4 pb-4">
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
                System Monitor v3.0 // <span className="text-primary">{new Date().toISOString().split('T')[0]}</span>
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
                  {isExporting ? 'sync' : 'camera'}
                </span>
                <span className="text-xs font-bold font-sans uppercase tracking-wider">{isExporting ? 'Capturing...' : 'Snapshot'}</span>
              </motion.button>
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
          <h1 className="text-white tracking-tight text-3xl font-bold font-display leading-tight mt-2 flex items-center gap-3">
            Department Metrics
            <div className="w-3 h-3 rounded-full bg-critical animate-pulse shadow-[0_0_10px_rgba(255,68,68,0.8)]"></div>
          </h1>
        </div>
        <div className="h-[2px] w-full bg-border-dim relative overflow-hidden">
          <div className="absolute h-full bg-primary w-[64%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto z-10 w-full" ref={reportRef}>
        <div className="p-4 space-y-6 pb-20 max-w-7xl mx-auto">
          {/* AI Executive Weather Report */}
          <div className="bg-surface-dim/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50"></div>
            <div className="relative z-10 flex gap-4 items-start">
              <div className="p-3 bg-surface rounded-xl text-primary shadow-inner border border-white/5">
                <span className="material-symbols-outlined text-3xl">wb_sunny</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Executive Weather Synthesis
                </h3>
                <p className="text-white font-sans text-sm md:text-base leading-relaxed">
                  {weatherReport}
                </p>
              </div>
            </div>
          </div>

          {/* Holographic Podium (Top 3 Highest Blast Radius / Critical) */}
          {deptMetrics.length >= 3 && (
            <div className="flex flex-col gap-4">
               <h2 className="text-sm font-sans font-bold text-text-muted tracking-widest uppercase">
                  Top Priority Vectors <span className="text-critical text-xs ml-2">(High Blast Radius)</span>
               </h2>
               <div className="grid grid-cols-3 gap-2 md:gap-4 items-end mt-4 px-2 md:px-8">
                  {/* #2 Rank */}
                  <div className="flex flex-col items-center">
                     <div className="relative pt-8 pb-3 px-3 bg-surface-dim/60 border border-white/10 rounded-t-xl w-full text-center group transition-all hover:bg-surface-dim hover:-translate-y-1">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-yellow-500 bg-surface shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center font-bold text-xs text-yellow-500">
                           {topThree[1].avatar}
                        </div>
                        <p className="font-sans font-bold text-white text-xs truncate">{topThree[1].dept}</p>
                        <p className="text-[10px] text-text-muted">{topThree[1].blastRadius.toFixed(1)} BR</p>
                     </div>
                     <div className="h-16 md:h-24 w-full bg-gradient-to-t from-yellow-500/20 to-surface border border-yellow-500/30 border-b-0 rounded-t-md relative overflow-hidden flex flex-col justify-end pb-2 items-center shadow-[0_-5px_20px_rgba(234,179,8,0.1)]">
                       <span className="text-2xl font-display font-black text-white/50">2</span>
                     </div>
                  </div>

                  {/* #1 Rank */}
                  <div className="flex flex-col items-center z-10">
                     <div className="relative pt-10 pb-4 px-3 bg-surface border border-critical shadow-[0_0_30px_rgba(255,68,68,0.2)] rounded-t-2xl w-full text-center group transition-all hover:-translate-y-2">
                        <div className="absolute inset-0 bg-critical/5 rounded-t-2xl animate-pulse pointer-events-none"></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-critical bg-surface shadow-[0_0_20px_rgba(255,68,68,0.6)] flex items-center justify-center font-bold text-lg text-critical">
                           {topThree[0].avatar}
                        </div>
                        <p className="font-sans font-bold text-white text-sm truncate">{topThree[0].dept}</p>
                        <p className="text-[10px] text-critical font-bold mt-1 tracking-wider">{topThree[0].blastRadius.toFixed(1)} BLT. RAD.</p>
                     </div>
                     <div className="h-24 md:h-32 w-full bg-gradient-to-t from-critical/30 to-surface border border-critical/50 border-b-0 rounded-t-lg relative overflow-hidden flex flex-col justify-end pb-2 items-center shadow-[0_-5px_30px_rgba(255,68,68,0.2)]">
                       <span className="text-3xl font-display font-black text-white">1</span>
                     </div>
                  </div>

                  {/* #3 Rank */}
                  <div className="flex flex-col items-center">
                     <div className="relative pt-8 pb-3 px-3 bg-surface-dim/60 border border-white/10 rounded-t-xl w-full text-center group transition-all hover:bg-surface-dim hover:-translate-y-1">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-primary bg-surface shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center font-bold text-xs text-primary">
                           {topThree[2].avatar}
                        </div>
                        <p className="font-sans font-bold text-white text-xs truncate">{topThree[2].dept}</p>
                        <p className="text-[10px] text-text-muted">{topThree[2].blastRadius.toFixed(1)} BR</p>
                     </div>
                     <div className="h-12 md:h-16 w-full bg-gradient-to-t from-primary/20 to-surface border border-primary/30 border-b-0 rounded-t-md relative overflow-hidden flex flex-col justify-end pb-2 items-center shadow-[0_-5px_20px_rgba(0,240,255,0.1)]">
                       <span className="text-xl font-display font-black text-white/40">3</span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Quick-Filter Segment Pills */}
          <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
            {["ALL", "CRITICAL", "LAGGING", "OPTIMAL"].map(segment => (
              <button
                key={segment}
                onClick={() => setActiveSegment(segment as any)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-sans font-bold tracking-widest uppercase transition-all ${activeSegment === segment ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]' : 'bg-surface border border-white/5 text-text-muted hover:text-white'}`}
              >
                {segment}
              </button>
            ))}
          </div>

          {/* Department List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredMetrics.map((m, index) => {
                const isExpanded = expandedDept === m.dept;
                const isCritical = m.stalled > 0 || m.avgDelay > 7;
                const isLagging = !isCritical && m.avgDelay > 3;
                const isOptimal = !isCritical && !isLagging && m.totalOpen === 0;
                const isNormal = !isCritical && !isLagging && m.totalOpen > 0;

                const statusLabel = isCritical ? 'Critical' : isLagging ? 'Lagging' : isOptimal ? 'Optimal' : 'Normal';
                const fillWidth = isCritical ? '15%' : isLagging ? '40%' : isNormal ? '60%' : '95%';

                let borderClass = 'border-white/10 hover:border-primary/50';
                if (isCritical) borderClass = 'border-critical shadow-[0_0_20px_rgba(255,68,68,0.15)] ring-1 ring-critical/30 ring-offset-2 ring-offset-background-dark !overflow-visible';
                else if (isLagging) borderClass = 'border-yellow-500/50 hover:border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.05)]';
                else if (isOptimal) borderClass = 'border-primary/30 hover:border-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]';

                return (
                  <motion.div 
                    key={m.dept}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative bg-surface-dim/80 backdrop-blur-md rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden p-0 border ${borderClass} ${isExpanded ? 'ring-2 ring-primary bg-background-dark/95' : ''}`}
                    onClick={() => setExpandedDept(isExpanded ? null : m.dept)}
                  >
                    {isCritical && !isExpanded && (
                      <div className="absolute -top-3 right-4 bg-surface-dim px-3 py-1 rounded-full border border-critical text-[10px] text-critical font-sans font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(255,68,68,0.3)] z-10 animate-pulse">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Bottleneck
                      </div>
                    )}
                    
                    <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Avatar Ring & Info */}
                      <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[200px]">
                        <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 bg-surface shadow-lg flex-shrink-0 ${isCritical ? 'border-critical text-critical shadow-critical/50' : 'border-white/20 text-text-muted group-hover:border-primary/50 group-hover:text-primary transition-colors'}`}>
                           <span className="font-bold text-sm">{m.avatar}</span>
                           {isCritical && <div className="absolute inset-0 rounded-full bg-critical/20 animate-ping"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className={`font-sans font-bold text-base truncate ${isCritical ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                              {m.name}
                           </h3>
                           <p className="text-xs text-text-muted font-sans font-medium mt-0.5 truncate uppercase tracking-widest">{m.head}</p>
                        </div>
                      </div>

                      {/* Main Metrics Area */}
                      <div className="flex-1 w-full grid grid-cols-3 gap-2 md:gap-6 items-center">
                         {/* Blast Radius */}
                         <div className="flex flex-col items-center md:items-start border-r border-white/5 pr-2">
                           <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1 hidden md:block">Blast Radius</span>
                           <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${isCritical ? 'text-critical' : 'text-white'}`}>{m.blastRadius.toFixed(1)}</span>
                         </div>
                         
                         {/* Throughput / Velocity */}
                         <div className="flex flex-col items-center md:items-start border-r border-white/5 pr-2">
                           <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-1 hidden md:block">Avg Delay</span>
                           <span className={`font-mono text-xl md:text-2xl font-bold tracking-tight ${isLagging || isCritical ? 'text-yellow-500' : 'text-primary'}`}>{m.avgDelay.toFixed(1)}d</span>
                         </div>

                         {/* Mini Sparkline */}
                         <div className="flex flex-col items-end pr-2 h-10 w-full justify-center">
                            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-8 opacity-70">
                               <polyline 
                                 fill="none" 
                                 stroke={isCritical ? "rgb(255, 68, 68)" : isLagging ? "rgb(234, 179, 8)" : "rgb(0, 240, 255)"} 
                                 strokeWidth="2" 
                                 strokeLinecap="round" 
                                 strokeLinejoin="round" 
                                 points={m.sparkline.map((val, i) => `${(i / (m.sparkline.length - 1)) * 100},${20 - (val / 10) * 20}`).join(" ")} 
                               />
                            </svg>
                         </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="hidden md:flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full border border-white/10 group-hover:bg-white/5 text-text-muted transition-colors">
                        <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                      </div>
                    </div>

                    {/* Expandable Peel-Back Drill Down */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10 bg-black/40"
                        >
                           <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left details */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest border-b border-white/10 pb-2">Operational State</h4>
                                <div className="space-y-3">
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-white/60">Total Active Requests</span>
                                      <span className="font-mono text-white font-bold">{m.totalOpen}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-white/60">Stalled / Blocked</span>
                                      <span className={`font-mono font-bold ${m.stalled > 0 ? 'text-critical' : 'text-stable'}`}>{m.stalled}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm">
                                      <span className="text-white/60">Segment Status</span>
                                      <span className={`px-2 py-0.5 mt-1 rounded text-[10px] uppercase font-bold tracking-widest ${isCritical ? "bg-critical/20 text-critical border border-critical/50" : isLagging ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" : "bg-stable/20 text-stable border border-stable/50"}`}>
                                        {statusLabel}
                                      </span>
                                   </div>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterClick({ dept: m.dept });
                                    navigate('/dashboard');
                                  }}
                                  className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-colors flex items-center justify-center gap-2"
                                >
                                  Open {m.dept} Board
                                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                              </div>

                              {/* Right details: Stalled Items */}
                              <div className="space-y-4 border-l border-white/10 pl-0 md:pl-6 pt-4 md:pt-0">
                                <h4 className="text-xs font-sans font-bold text-critical uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[14px]">warning</span>
                                  Critical Blockers
                                </h4>
                                {m.stalledTitles && m.stalledTitles.length > 0 ? (
                                   <ul className="space-y-2">
                                      {m.stalledTitles.map((title, i) => (
                                        <li key={i} className="text-xs font-sans border-l-2 border-critical pl-3 py-1 bg-gradient-to-r from-critical/5 to-transparent text-white truncate">
                                           {title}
                                        </li>
                                      ))}
                                   </ul>
                                ) : (
                                   <div className="h-24 flex items-center justify-center text-text-muted/50 border border-dashed border-white/10 rounded-xl">
                                      <p className="text-xs font-sans font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        No active blockers
                                      </p>
                                   </div>
                                )}
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredMetrics.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-text-muted/30 mb-4">analytics</span>
              <p className="text-text-muted font-sans font-bold uppercase tracking-widest">No data found in {activeSegment} segment</p>
            </div>
          )}
          
          {filteredMetrics.length > 0 && (
            <div className="text-center py-6 opacity-30">
              <p className="text-[10px] text-white font-sans font-bold uppercase tracking-widest">
                End of Report Transmisson
              </p>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
}

