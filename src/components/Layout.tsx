import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.substring(1) || "login";
  
  const [time, setTime] = useState("");
  const [aura, setAura] = useState("theme-cyan");
  const [status, setStatus] = useState("🎧 Deep Work");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [profileName, setProfileName] = useState("Alex Chen");
  const [profileAvatar, setProfileAvatar] = useState("https://picsum.photos/seed/genz/100/100");
  const [statuses, setStatuses] = useState<string[]>([
    "🎧 Deep Work", "☕ Need Coffee", "🧠 Brainstorming", "🚀 Shipping"
  ]);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem("glassbox_tickets");
        if (stored) {
          const tickets = JSON.parse(stored);
          const count = tickets.filter((t: any) => t.status === "QUEUED").length;
          setQueuedCount(count);
        } else {
          setQueuedCount(3); // default from mock data
        }
      } catch (e) {
        setQueuedCount(0);
      }
    };
    
    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 2000); // Polling backup
    
    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const storedProfile = localStorage.getItem("glassbox_profile");
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      if (p.name) setProfileName(p.name);
      if (p.avatar) setProfileAvatar(p.avatar);
      if (p.statuses) setStatuses(p.statuses);
    }
  }, [currentPath]); // Re-run when view changes (e.g. back from settings)

  useEffect(() => {
    document.body.className = aura;
  }, [aura]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    const interval = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-background-dark text-text-main font-sans overflow-hidden relative selection:bg-primary selection:text-black h-screen flex flex-col md:flex-row w-full ${aura}`}>
      {/* Ambient Mesh Background */}
      <div 
        className="fixed inset-0 opacity-40 pointer-events-none z-0 animate-mesh"
        style={{
          backgroundImage: `radial-gradient(at 0% 0%, var(--theme-primary-dim) 0px, transparent 50%),
                            radial-gradient(at 100% 100%, rgba(255, 42, 109, 0.05) 0px, transparent 50%)`,
          backgroundSize: '200% 200%'
        }}
      ></div>

      {/* Desktop Sidebar (hidden on mobile) */}
      {currentPath !== "login" && (
        <div className="hidden md:flex flex-col w-72 glass-panel border-y-0 border-l-0 z-40 p-6 relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-[0_0_15px_var(--theme-primary-dim)]">
              <span className="material-symbols-outlined text-white text-sm">grid_view</span>
            </div>
            <span className="text-white text-2xl font-display italic tracking-tight">
              Glassbox
            </span>
          </div>
          
          <nav className="flex flex-col gap-1 flex-1 mt-6">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest px-4 mb-2">Platform</span>
            {[
              { id: "dashboard", icon: "space_dashboard", label: "Dashboard", subtitle: "System overview" },
              { id: "grid", icon: "view_kanban", label: "The Grid", badge: queuedCount > 0 ? queuedCount.toString() : undefined, subtitle: "Active signals" },
              { id: "submit", icon: "add_circle", label: "New Signal", subtitle: "Report anomalies" },
              { id: "metrics", icon: "monitoring", label: "Metrics", subtitle: "Data trends" },
              { id: "insights", icon: "psychology", label: "Insights", badge: "NEW", subtitle: "AI analysis" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  currentPath === item.id
                    ? "bg-primary/10 text-white shadow-[0_0_15px_rgba(var(--color-primary),0.1)] border border-primary/20"
                    : "text-text-muted hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {/* Active Indicator Bar */}
                {currentPath === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]"></div>
                )}
                
                <div className="flex items-center gap-3 z-10 w-full">
                  <span className={`material-symbols-outlined text-[22px] transition-colors ${currentPath === item.id ? 'text-primary' : 'group-hover:text-primary/70'}`}>
                    {item.icon}
                  </span>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <span className="text-sm font-semibold tracking-wide leading-tight">
                      {item.label}
                    </span>
                    <span className={`text-[10px] font-mono leading-tight ${currentPath === item.id ? 'text-primary/80' : 'text-text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                
                {item.badge && (
                  <span className={`z-10 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    item.badge === "NEW" 
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                      : "bg-primary/20 text-primary border border-primary/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest px-4 mb-2 mt-6">System</span>
            {[
              { id: "settings", icon: "settings", label: "Settings", subtitle: "Preferences & config" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  currentPath === item.id
                    ? "bg-primary/10 text-white shadow-[0_0_15px_rgba(var(--color-primary),0.1)] border border-primary/20"
                    : "text-text-muted hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {currentPath === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]"></div>
                )}
                <div className="flex items-center gap-3 z-10 w-full">
                  <span className={`material-symbols-outlined text-[22px] transition-colors ${currentPath === item.id ? 'text-primary' : 'group-hover:text-primary/70'}`}>
                    {item.icon}
                  </span>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <span className="text-sm font-semibold tracking-wide leading-tight">
                      {item.label}
                    </span>
                    <span className={`text-[10px] font-mono leading-tight ${currentPath === item.id ? 'text-primary/80' : 'text-text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* User Profile & Auras */}
          <div className="mt-auto pt-6 border-t border-border-dim/50 flex flex-col gap-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                <span className="material-symbols-outlined text-[16px] animate-pulse">local_fire_department</span>
                <span className="text-[11px] font-bold font-mono tracking-wider">12 Day Streak</span>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-3 w-full p-2.5 rounded-2xl hover:bg-white/10 transition-colors text-left border border-transparent hover:border-white/10 group"
              >
                <div className="relative">
                  <img src={profileAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-surface-dim group-hover:border-primary/50 transition-colors" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-dark shadow-[0_0_5px_#22c55e]"></div>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-white tracking-wide">{profileName}</span>
                  <span className="text-[11px] text-primary font-medium font-mono truncate max-w-[120px]">{status}</span>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:text-white transition-colors">unfold_more</span>
              </button>
              
              {showStatusMenu && (
                <div className="absolute bottom-full left-0 w-full mb-3 bg-background-dark/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 z-50 shadow-2xl animate-[fade-in_0.2s_ease-out] overflow-hidden">
                  {statuses.map(s => (
                    <button 
                      key={s}
                      onClick={() => { setStatus(s); setShowStatusMenu(false); }}
                      className={`text-left px-3 py-2.5 text-xs font-mono rounded-xl transition-all duration-200 flex items-center gap-2 ${status === s ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:bg-white/10 hover:text-white'}`}
                    >
                      {status === s && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                      {s}
                    </button>
                  ))}
                  <div className="w-full h-[1px] bg-white/10 my-1"></div>
                  <button 
                    onClick={() => { setShowStatusMenu(false); navigate("/login"); }}
                    className="text-left px-3 py-2.5 text-xs font-mono text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-30 flex flex-col flex-1 w-full h-full overflow-hidden">
        {children}

        {/* Mobile Bottom Nav (hidden on desktop) */}
        <div className="md:hidden z-50 glass-panel border-x-0 border-b-0">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
