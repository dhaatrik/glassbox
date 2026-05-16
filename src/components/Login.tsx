import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [accessGranted, setAccessGranted] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const TypewriterText = ({ text, delay = 0, speed = 50 }: { text: string, delay?: number, speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
      let i = 0;
      let timer: NodeJS.Timeout;
      
      const startTyping = () => {
        timer = setInterval(() => {
          if (i < text.length) {
            setDisplayedText(prev => prev + text.charAt(i));
            i++;
          } else {
            clearInterval(timer);
          }
        }, speed);
      };
      
      const delayTimer = setTimeout(startTyping, delay);
      return () => {
        clearTimeout(delayTimer);
        clearInterval(timer);
      };
    }, [text, delay, speed]);
    
    return <span>{displayedText}<span className="animate-pulse ml-0.5 inline-block w-1 h-3 bg-primary"></span></span>;
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username && !password) return;

    setIsAuthenticating(true);
    
    const logs = [
      "INITIALIZING SECURE HANDSHAKE...",
      "VERIFYING NEURO-SIGNATURE...",
      "DECRYPTING AES-256 PAYLOAD...",
      "BYPASSING FIREWALL PROTOCALS...",
      "SYNCING IDENTITY MATRIX...",
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setBootLogs(prev => [...prev, `[SYS_${index + 1}] ${log}`]);
      }, 500 + (index * 400));
    });

    setTimeout(() => {
      setBootLogs(prev => [...prev, `[SYS_OK] ACCESS GRANTED.`]);
      setAccessGranted(true);
    }, 500 + (logs.length * 400) + 300);
    
    setTimeout(() => {
      if (onLogin) {
        onLogin();
      } else {
        navigate("/dashboard");
      }
    }, 500 + (logs.length * 400) + 1500);
  };

  return (
    <div className="relative min-h-screen bg-black w-full flex text-white font-mono overflow-hidden">
      {/* Dynamic Background Parallax & Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-30 transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${(mousePos.x - window.innerWidth/2) * -0.02}px, ${(mousePos.y - window.innerHeight/2) * -0.02}px)` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_10%,transparent_100%)] opacity-20"></div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Split Layout Container */}
      <div className="relative z-10 w-full h-screen flex flex-col lg:flex-row">
        
        {/* Left visually rich side, hidden on smaller screens */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-border-dim/50 bg-surface/30 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <img src="/logo.png" alt="Glassbox Logo" className="w-16 h-16 object-contain" />
            </motion.div>
            
            <h1 className="text-white text-7xl font-display italic tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Glassbox
            </h1>
            <p className="font-sans text-text-muted text-lg tracking-wide max-w-md">
              The modern workspace operating system. Streamline your signaling, incident management, and cross-team collaboration.
            </p>

            <div className="mt-8 flex flex-col gap-5">
               <div className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">view_kanban</span>
                 <div>
                   <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider font-display">Real-time Grid</h3>
                   <p className="text-text-muted text-xs font-sans max-w-xs">Monitor all active signals and tasks across your organization with drag-and-drop workflows.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-purple-400 bg-purple-400/10 p-1.5 rounded-lg">monitoring</span>
                 <div>
                   <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider font-display">Advanced Metrics</h3>
                   <p className="text-text-muted text-xs font-sans max-w-xs">Visualize team performance, resolve times, and anomaly detection with precision.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <span className="material-symbols-outlined text-yellow-400 bg-yellow-400/10 p-1.5 rounded-lg">psychology</span>
                 <div>
                   <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider font-display">AI Insights</h3>
                   <p className="text-text-muted text-xs font-sans max-w-xs">Generate instant executive summaries and strategic action items powered by AI.</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-text-muted">
            <div className="pt-4 border-t border-border-dim/50 max-w-sm flex items-center justify-between">
              <p>Glassbox OS v4.2.1</p>
              <div className="flex gap-2">
                <a href="#" className="hover:text-white underline decoration-transparent hover:decoration-white transition-all">Privacy</a>
                <span>&bull;</span>
                <a href="#" className="hover:text-white underline decoration-transparent hover:decoration-white transition-all">Terms</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Side */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="mb-4"
            >
              <img src="/logo.png" alt="Glassbox Logo" className="w-12 h-12 mx-auto object-contain" />
            </motion.div>
            <h1 className="text-white text-4xl font-display italic tracking-tight mb-2">
              Glassbox
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {!isAuthenticating ? (
              <motion.div 
                key="login-form"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-border-dim relative overflow-hidden group shadow-2xl bg-surface/80 backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                
                <div className="mb-8 font-mono">
                  <h2 className="text-white text-xl font-bold font-display tracking-wider uppercase mb-1">
                    Workspace Login
                  </h2>
                  <div className="text-xs text-primary font-bold tracking-widest h-4">
                    <TypewriterText text="> AWAITING CREDENTIALS_" speed={30} delay={300} />
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1 group/input">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold group-focus-within/input:text-primary transition-colors">User Name</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm group-focus-within/input:text-primary transition-colors">person</span>
                      <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="operative_01"
                        className="w-full bg-surface-dim border border-border-dim text-white text-sm pl-10 pr-3 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 group/input">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-bold group-focus-within/input:text-primary transition-colors">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm group-focus-within/input:text-primary transition-colors">key</span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-surface-dim border border-border-dim text-white text-sm pl-10 pr-10 py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/50 tracking-widest"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors flex items-center justify-center p-1 rounded focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 relative overflow-hidden bg-white text-black font-bold font-display uppercase tracking-wider rounded-lg py-3 px-6 focus:outline-none shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all transform active:scale-95 group/btn"
                  >
                    <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                       Sign In
                       <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                  </button>
                </form>


              </motion.div>
            ) : (
              /* Boot Sequence UI */
              <motion.div 
                key="boot-sequence"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-transparent p-8 flex flex-col font-mono"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-[0_0_20px_var(--color-primary)] animate-pulse">
                    <span className="material-symbols-outlined text-black text-2xl">memory</span>
                  </div>
                  <div>
                    <h2 className="text-primary text-xl font-bold uppercase tracking-widest">
                      {accessGranted ? "Uplink Established" : "Authenticating"}
                    </h2>
                    <p className="text-text-muted text-xs">Awaiting primary node response...</p>
                  </div>
                </div>

                <div className="space-y-2 mb-8 h-48 flex flex-col justify-end">
                  {bootLogs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`text-xs ${log.includes("OK") ? "text-green-400 font-bold" : "text-text-muted"}`}
                    >
                      {log}
                    </motion.div>
                  ))}
                  {!accessGranted && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1 }}
                      className="text-xs text-primary"
                    >
                      <span className="animate-pulse">_</span>
                    </motion.div>
                  )}
                </div>
                
                {accessGranted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">fingerprint</span>
                    <span className="text-sm font-bold uppercase tracking-widest">Identity Verified</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal Mobile Footer */}
          <div className="lg:hidden absolute bottom-6 text-center w-full">
             <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Glassbox OS v4.2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
