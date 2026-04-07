import React, { useState, useEffect } from "react";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Layout({ children, currentView, onChangeView }: LayoutProps) {
  const [time, setTime] = useState("");
  const [aura, setAura] = useState("theme-cyan");
  const [status, setStatus] = useState("🎧 Deep Work");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [profileName, setProfileName] = useState("Alex Chen");
  const [profileAvatar, setProfileAvatar] = useState("https://picsum.photos/seed/genz/100/100");
  const [statuses, setStatuses] = useState<string[]>([
    "🎧 Deep Work", "☕ Need Coffee", "🧠 Brainstorming", "🚀 Shipping"
  ]);

  useEffect(() => {
    const storedProfile = localStorage.getItem("glassbox_profile");
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      if (p.name) setProfileName(p.name);
      if (p.avatar) setProfileAvatar(p.avatar);
      if (p.statuses) setStatuses(p.statuses);
    }
  }, [currentView]); // Re-run when view changes (e.g. back from settings)

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
      {currentView !== "login" && (
        <div className="hidden md:flex flex-col w-72 glass-panel border-y-0 border-l-0 z-40 p-6 relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-[0_0_15px_var(--theme-primary-dim)]">
              <span className="material-symbols-outlined text-white text-sm">grid_view</span>
            </div>
            <span className="text-white text-2xl font-display italic tracking-tight">
              Glassbox
            </span>
          </div>
          
          <nav className="flex flex-col gap-2 flex-1">
            {[
              { id: "dashboard", icon: "space_dashboard", label: "Dashboard" },
              { id: "grid", icon: "view_kanban", label: "The Grid" },
              { id: "submit", icon: "add_circle", label: "New Signal" },
              { id: "metrics", icon: "monitoring", label: "Metrics" },
              { id: "settings", icon: "settings", label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  currentView === item.id
                    ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] z-10 ${currentView === item.id ? 'text-primary' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold tracking-wide z-10">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* User Profile & Auras */}
          <div className="mt-auto pt-6 border-t border-border-dim flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full border border-orange-400/20">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                <span className="text-xs font-bold font-mono">12 Day Streak</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Aura</span>
              <div className="flex gap-2 ml-auto flex-wrap justify-end w-32">
                {['theme-cyan', 'theme-matcha', 'theme-lavender', 'theme-dracula'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setAura(t)}
                    className={`w-4 h-4 rounded-full transition-transform ${aura === t ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                    title={t.replace('theme-', '')}
                    style={{ 
                      backgroundColor: t === 'theme-cyan' ? '#00f0ff' : 
                                       t === 'theme-matcha' ? '#a3e635' : 
                                       t === 'theme-lavender' ? '#c084fc' : 
                                       t === 'theme-dracula' ? '#ff79c6' : '#ffffff'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-white/5 transition-colors text-left"
              >
                <img src={profileAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{profileName}</span>
                  <span className="text-xs text-primary font-medium">{status}</span>
                </div>
              </button>
              
              {showStatusMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-background-dark/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 flex flex-col gap-1 z-50 shadow-2xl animate-[fade-in_0.2s_ease-out]">
                  {statuses.map(s => (
                    <button 
                      key={s}
                      onClick={() => { setStatus(s); setShowStatusMenu(false); }}
                      className={`text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${status === s ? 'bg-primary/10 text-primary font-bold' : 'text-white hover:bg-white/10'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-30 flex flex-col flex-1 w-full h-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto relative hide-scrollbar">
          {children}
        </div>

        {/* Mobile Bottom Nav (hidden on desktop) */}
        <div className="md:hidden z-50 glass-panel border-x-0 border-b-0">
          <BottomNav currentView={currentView} onChangeView={onChangeView} />
        </div>
      </div>
    </div>
  );
}
