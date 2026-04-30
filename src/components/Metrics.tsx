import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

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
  const [deptMetrics, setDeptMetrics] = useState<DeptMetric[]>([]);

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
      
      setDeptMetrics(metrics);
    }
  }, []);

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
        <div className="h-[2px] w-full bg-border-dim relative overflow-hidden">
          <div className="absolute h-full bg-primary w-[64%] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/50 to-transparent"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-4 scroll-smooth scrollbar-hide">
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
              onClick={() => {
                onFilterClick({ dept: m.dept });
                navigate('/dashboard');
              }}
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
      </main>
    </motion.div>
  );
}

