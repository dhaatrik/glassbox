import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { analyzeSentiment } from "../services/geminiService";
import { fetchEmployees, Employee } from "../services/hrisService";

export function Submit() {
  const [severity, setSeverity] = useState("MED");
  const [dept, setDept] = useState("ROUTE_TO: [ ENGINEERING ]");
  const [category, setCategory] = useState("Culture");
  const [pulseWorkload, setPulseWorkload] = useState(3);
  const [pulseClarity, setPulseClarity] = useState(3);
  const [pulseMorale, setPulseMorale] = useState(3);
  const [text, setText] = useState("");
  const [flashing, setFlashing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transmitStatus, setTransmitStatus] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(10).fill(5));

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Simulated live sentiment
  const currentSentiment = useMemo(() => {
    if (!text.trim()) return null;
    const lower = text.toLowerCase();
    if (lower.match(/(broken|hate|fail|block|stop|can't|critical|urgent)/)) return "Frustrated / Urgent";
    if (lower.match(/(good|great|awesome|love|thanks|fix|better)/)) return "Positive / Constructive";
    return "Neutral / Informational";
  }, [text]);

  const smartTemplates = useMemo(() => {
    if (category === "Culture") return ["I want to shout out [NAME] for...", "The vibe in [TEAM] feels..."];
    if (category === "Workload") return ["I am currently blocked by...", "We need more resources for..."];
    if (category === "Tools") return ["Can we get a license for...", "[TOOL] is currently down/lagging..."];
    return ["I noticed that...", "A quick suggestion regarding..."];
  }, [category]);

  useEffect(() => {
    fetchEmployees().then(data => {
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id);
      }
    });
  }, []);

  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setText((prev) => prev + (prev ? " " : "") + currentTranscript);
    };

    // Simulated audio visualizer
    const visualizerInterval = setInterval(() => {
      setAudioLevels(Array.from({ length: 15 }, () => Math.floor(Math.random() * 20) + 2));
    }, 100);

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      clearInterval(visualizerInterval);
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(visualizerInterval);
    };

    recognitionRef.current = {
      stop: () => {
        recognition.stop();
        clearInterval(visualizerInterval);
      }
    };
    recognition.start();
    setIsRecording(true);
  };

  const handleScreenRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setAttachments([...attachments, { name: "screen-recording.webm", type: "video/webm" }]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 10000);
    } catch (err) {
      console.error("Error capturing screen:", err);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isTransmitting) return;

    setIsTransmitting(true);
    setProgress(0);
    setTransmitStatus("ENCRYPTING_PAYLOAD...");

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return 90;
          return p + Math.random() * 10;
        });
      }, 200);

      setTransmitStatus("ANALYZING_SENTIMENT...");
      const sentiment = await analyzeSentiment(text);

      clearInterval(progressInterval);
      setProgress(100);

      if (text.toLowerCase().includes("error")) {
        setTransmitStatus("TRANSMISSION_FAILED");
        setTimeout(() => {
          setIsTransmitting(false);
          setProgress(0);
        }, 2000);
      } else {
        setTransmitStatus("SIGNAL_DELIVERED");
        setFlashing(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff2a6d', '#05ff00']
        });

        // Save to pulse_feedback
        const existingFeedback = JSON.parse(localStorage.getItem("pulse_feedback") || "[]");
        const newFeedback = {
          id: Date.now().toString(),
          severity,
          dept,
          category,
          text,
          sentiment,
          isAnonymous,
          timestamp: Date.now(),
          pulseMetrics: {
            workload: pulseWorkload,
            clarity: pulseClarity,
            morale: pulseMorale
          }
        };
        localStorage.setItem("pulse_feedback", JSON.stringify([...existingFeedback, newFeedback]));

        // Save to glassbox_tickets
        const existingTickets = JSON.parse(localStorage.getItem("glassbox_tickets") || "[]");
        const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
        
        // Strict anonymity handling
        let authorName = "Anonymous";
        let linkedEmployeeId = null;
        if (!isAnonymous) {
          authorName = selectedEmployee?.name || "Current User";
          linkedEmployeeId = selectedEmployee?.id;
        }

        const newTicket = {
          id: `#TKT-${Math.floor(Math.random() * 10000)}`,
          dept: `[${dept.replace("ROUTE_TO: [ ", "").replace(" ]", "")}]`,
          category,
          title: text.length > 60 ? text.substring(0, 60) + "..." : text,
          status: "QUEUED",
          time: "JUST NOW",
          description: text,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastUpdatedBy: authorName,
          authorId: linkedEmployeeId, // Excluded if anonymous
          isFavorite: false,
          attachments: attachments.length > 0 ? attachments : undefined,
          dependencies: []
        };
        localStorage.setItem("glassbox_tickets", JSON.stringify([newTicket, ...existingTickets]));

        setTimeout(() => {
          setFlashing(false);
          setIsTransmitting(false);
          setText("");
          setAttachments([]);
          setProgress(0);
          setPulseWorkload(3);
          setPulseClarity(3);
          setPulseMorale(3);
        }, 800);
      }
    } catch (err) {
      setTransmitStatus("TRANSMISSION_FAILED");
      setTimeout(() => {
        setIsTransmitting(false);
        setProgress(0);
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col flex-1 relative min-h-0 overflow-hidden ${severity === 'CRITICAL' ? 'animate-shake' : ''}`}
    >
      {flashing && (
        <div className="fixed inset-0 bg-white z-[100] transition-opacity duration-500 opacity-0 animate-[flash_0.5s_ease-out]"></div>
      )}

      <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-2xl border-b border-border-dim">
        <div className="flex items-center justify-between p-4 pb-3">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.hash = "#/"}
            className="text-primary hover:text-white transition-colors group flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-dim relative z-50"
          >
            <span className="material-symbols-outlined text-2xl transition-transform">
              arrow_back
            </span>
          </motion.button>
          <div className="flex flex-col items-center">
            <h1 className="text-primary text-lg font-bold tracking-[0.1em] uppercase font-display">
              Initiate Signal
            </h1>
            <div className="flex items-center gap-2">
              <span className="block w-2 h-2 rounded-full bg-stable animate-pulse"></span>
              <span className="text-[10px] font-sans font-bold text-stable tracking-widest opacity-80 uppercase">
                Uplink Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-primary hover:text-critical transition-colors p-2 -mr-2 rounded-full hover:bg-surface-dim"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.location.reload()}
              className="text-text-muted hover:text-critical transition-colors ml-1 p-1.5 rounded-full hover:bg-surface-dim"
              title="Disconnect"
            >
              <span className="material-symbols-outlined text-lg">
                power_settings_new
              </span>
            </motion.button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-border-dim relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-primary/50 animate-[pulse_2s_infinite]"></div>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto min-h-0 relative ${isFocused ? 'bg-background-dark/95 backdrop-blur-3xl z-40' : ''} transition-all duration-500`}>
        {/* Hyperspace Overlay */}
        <AnimatePresence>
          {isTransmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none"
            >
               <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md"></div>
               {/* Starfield / Hyperspace effect simulation */}
               {Array.from({ length: 50 }).map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                   animate={{ 
                     x: (Math.random() - 0.5) * 800, 
                     y: (Math.random() - 0.5) * 800, 
                     scale: Math.random() * 2 + 1,
                     opacity: 0
                   }}
                   transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity, ease: "easeIn" }}
                   className={`absolute w-1 h-3 rounded-full ${transmitStatus === "TRANSMISSION_FAILED" ? "bg-critical" : "bg-primary"} shadow-[0_0_10px_currentColor]`}
                   style={{ transformOrigin: "center" }}
                 />
               ))}
               <div className="relative text-center z-10 flex flex-col items-center justify-center h-full">
                 <span className={`material-symbols-outlined text-6xl mb-4 ${transmitStatus === "TRANSMISSION_FAILED" ? "text-critical" : "text-primary animate-spin"}`}>
                    {transmitStatus === "TRANSMISSION_FAILED" ? "error" : "sync"}
                 </span>
                 <h2 className={`font-display text-3xl font-bold tracking-[0.2em] uppercase ${transmitStatus === "TRANSMISSION_FAILED" ? "text-critical" : "text-primary"}`}>
                   {transmitStatus}
                 </h2>
                 <p className="font-mono text-sm mt-2 text-white/50 tracking-widest uppercase">Encryption active</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex flex-col p-5 gap-6 pb-8 max-w-3xl mx-auto w-full transition-all duration-500 origin-top ${isFocused ? 'scale-105' : 'scale-100'}`}>
          {/* Section 0: HRIS Identity */}
          <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg ${isFocused ? 'opacity-30' : ''}`}
          >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              00 // HRIS Identity
            </h3>
            <span className="text-[10px] font-sans font-bold text-stable bg-stable/10 px-2 py-1 rounded-full">
              SYNCED
            </span>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-lg">
                badge
              </span>
            </div>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="block w-full pl-12 pr-10 py-4 bg-surface-dim/50 border border-border-dim text-white font-sans font-bold text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none rounded-xl cursor-pointer hover:border-primary/50 transition-colors tracking-wider [color-scheme:dark]"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-background-dark text-white">
                  {emp.name} - {emp.role} ({emp.department})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted text-lg">
                unfold_more
              </span>
            </div>
          </div>
        </motion.section>

        {/* Section 1: Severity / Vibe Check */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg ${isFocused ? 'opacity-30 filter blur-sm' : ''}`}
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            01 // Vibe Check (Severity)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSeverity("LOW")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border relative transition-all overflow-hidden ${severity === "LOW" ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(0,240,255,0.2)]" : "border-white/10 bg-white/5 hover:border-primary/50"}`}
            >
              {severity === "LOW" && <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-xl blur-md -z-10"></div>}
              <span className="text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110">😌</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "LOW" ? "text-primary" : "text-text-muted"}`}>Low Key</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSeverity("MED")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border relative transition-all overflow-hidden ${severity === "MED" ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_25px_rgba(234,179,8,0.2)]" : "border-white/10 bg-white/5 hover:border-yellow-500/50"}`}
            >
              {severity === "MED" && <div className="absolute inset-0 bg-yellow-500/20 animate-pulse rounded-xl blur-md -z-10"></div>}
              <span className="text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110">🤔</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "MED" ? "text-yellow-500" : "text-text-muted"}`}>Mid</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSeverity("CRITICAL")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border relative transition-all overflow-hidden ${severity === "CRITICAL" ? "border-critical bg-critical/10 shadow-[0_0_25px_rgba(255,68,68,0.25)] ring-2 ring-critical/50 ring-offset-2 ring-offset-background-dark animate-pulse" : "border-white/10 bg-white/5 hover:border-critical/50"}`}
            >
              {severity === "CRITICAL" && (
                <>
                  <div className="absolute inset-0 bg-critical/20 animate-ping opacity-75 rounded-xl blur-sm -z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-critical/40 to-transparent -z-10"></div>
                </>
              )}
              <span className="text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110">🚨</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "CRITICAL" ? "text-critical" : "text-text-muted"}`}>Critical</span>
            </motion.button>
          </div>
          <p className="text-[10px] text-text-muted font-sans mt-1 px-1">
            ✨ Critical vibes trigger immediate SLT notification.
          </p>
        </motion.section>

        {/* Section 2: Routing & Category */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg relative ${isFocused ? 'opacity-30 filter blur-sm' : ''}`}
        >
          {dept && <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 rounded-2xl transition-opacity duration-500 opacity-50"></div>}
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            02 // Routing & Categorization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary text-lg">
                  router
                </span>
              </div>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="block w-full pl-12 pr-10 py-4 bg-surface-dim/50 border border-border-dim text-white font-sans font-bold text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none rounded-xl cursor-pointer hover:border-primary/50 transition-colors uppercase tracking-wider [color-scheme:dark]"
              >
                <option className="bg-background-dark text-white">ROUTE_TO: [ ENGINEERING ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ MARKETING ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ HUMAN RESOURCES ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ EXECUTIVE ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ DESIGN ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ FACILITIES ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ FINANCE ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ OPERATIONS ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ SALES ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ PRODUCT ]</option>
                <option className="bg-background-dark text-white">ROUTE_TO: [ LEGAL ]</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-muted text-lg">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary text-lg">
                  category
                </span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full pl-12 pr-10 py-4 bg-surface-dim/50 border border-border-dim text-white font-sans font-bold text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none rounded-xl cursor-pointer hover:border-primary/50 transition-colors uppercase tracking-wider [color-scheme:dark]"
              >
                <option className="bg-background-dark text-white" value="Culture">TAG: [ Culture ]</option>
                <option className="bg-background-dark text-white" value="Workload">TAG: [ Workload ]</option>
                <option className="bg-background-dark text-white" value="Management">TAG: [ Management ]</option>
                <option className="bg-background-dark text-white" value="Tools">TAG: [ Tools ]</option>
                <option className="bg-background-dark text-white" value="Other">TAG: [ Other ]</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-muted text-lg">
                  unfold_more
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 2.5: Pulse Check */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg ${isFocused ? 'opacity-30 filter blur-sm' : ''}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              Pulse Check // High-Level Metrics
            </h3>
            <span className="text-[10px] font-sans font-bold text-stable bg-stable/10 px-2 py-1 rounded-full text-primary border border-primary/20 bg-primary/10">
              OPTIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted font-bold tracking-wider">Workload Level</label>
              <input 
                type="range" 
                min="1" max="5" 
                value={pulseWorkload} 
                onChange={(e) => setPulseWorkload(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-dim rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>Light</span>
                <span className="text-white bg-surface px-2 py-0.5 rounded">{pulseWorkload}/5</span>
                <span>Overload</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted font-bold tracking-wider">Role Clarity</label>
              <input 
                type="range" 
                min="1" max="5" 
                value={pulseClarity} 
                onChange={(e) => setPulseClarity(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-dim rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>Confused</span>
                <span className="text-white bg-surface px-2 py-0.5 rounded">{pulseClarity}/5</span>
                <span>Crystal Clear</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-muted font-bold tracking-wider">Team Morale</label>
              <input 
                type="range" 
                min="1" max="5" 
                value={pulseMorale} 
                onChange={(e) => setPulseMorale(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-dim rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>Low</span>
                <span className="text-white bg-surface px-2 py-0.5 rounded">{pulseMorale}/5</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 3: Anonymity Toggle */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg ${isFocused ? 'opacity-30 filter blur-sm' : ''}`}
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            03 // Identity Protocol
          </h3>
          <motion.div
            whileTap={{ scale: 0.99 }}
            className={`flex items-center justify-between border p-4 rounded-xl cursor-pointer transition-all ${isAnonymous ? 'border-stable bg-stable/5 shadow-[0_0_20px_rgba(5,255,0,0.1)]' : 'border-white/10 bg-white/5 hover:border-primary/50'}`}
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <div className="flex items-center gap-4 relative overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={isAnonymous ? "incognito" : "public"}
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`p-2 rounded-full ${isAnonymous ? 'bg-stable/20 text-stable' : 'bg-surface text-text-muted'}`}
                >
                  <span className="material-symbols-outlined text-xl block">
                    {isAnonymous ? "visibility_off" : "visibility"}
                  </span>
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-sans font-bold uppercase tracking-widest ${isAnonymous ? "text-stable" : "text-white"}`}
                >
                  {isAnonymous
                    ? "Incognito Mode"
                    : "Public Mode"}
                </span>
                <span className="text-xs font-sans text-text-muted mt-0.5">
                  {isAnonymous
                    ? "Identity scrubbed at source."
                    : "Submission linked to user profile."}
                </span>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors ${isAnonymous ? "bg-stable" : "bg-surface border border-border-dim"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isAnonymous ? "left-7 bg-black" : "left-1 bg-text-muted"}`}
              ></div>
            </div>
          </motion.div>
        </motion.section>

        {/* Section 4: Observation Log */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-300 relative ${isFocused ? 'border-primary/50 bg-background-dark/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] z-50' : 'border-white/5 bg-white/5 backdrop-blur-md shadow-lg hover:border-primary/40'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              04 // The Tea (Input Data)
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleRecording}
                className={`flex items-center gap-1 text-[10px] font-sans font-bold tracking-wider px-3 py-1.5 rounded-full transition-colors ${isRecording ? 'bg-critical/20 text-critical animate-pulse' : 'bg-surface-dim border border-border-dim text-text-muted hover:text-primary hover:border-primary/50'}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isRecording ? 'mic' : 'mic_none'}
                </span>
                {isRecording ? 'RECORDING...' : 'VOICE SPILL'}
              </button>
              
              {isRecording && (
                <div className="flex items-end gap-0.5 h-4 mx-2">
                  {audioLevels.map((level, i) => (
                    <motion.div 
                      key={i} 
                      className="w-1 bg-critical rounded-full"
                      animate={{ height: level }}
                      transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] text-stable font-sans font-bold tracking-wider opacity-80 bg-stable/10 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-[12px]">
                  lock
                </span>
                ENCRYPTED
              </div>
            </div>
          </div>
          <div className="relative group mt-2">
            <textarea
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[200px] bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 text-white font-sans text-base p-4 resize-none rounded-xl placeholder-text-muted/50 selection:bg-primary/30 selection:text-white outline-none transition-all shadow-inner"
              placeholder="Spill the tea here... What's working? What's broken?"
            ></textarea>
            {/* Smart Templates */}
            {isFocused && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto rounded-lg no-scrollbar pb-1 z-10"
              >
                {smartTemplates.map((template, i) => (
                  <button 
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      setText(prev => prev + (prev ? " " : "") + template);
                    }}
                    className="whitespace-nowrap px-3 py-1.5 bg-surface/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-sans text-text-muted hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs font-sans font-bold text-text-muted mt-2 px-1">
            <div className="flex items-center gap-3">
              <span>{text.length}/500 chars</span>
              {currentSentiment && (
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${currentSentiment.includes("Urgent") ? "bg-critical/20 text-critical border border-critical/50" : currentSentiment.includes("Positive") ? "bg-stable/20 text-stable border border-stable/50" : "bg-white/10 text-text-muted border border-white/20"}`}>
                  AI Prediction: {currentSentiment}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stable animate-pulse"></span>
              Buffer OK
            </span>
          </div>
        </motion.section>

        {/* Section 5: Attachments */}
        <motion.section 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className={`flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-primary/40 transition-colors shadow-lg ${isFocused ? 'opacity-30 filter blur-sm' : ''} overflow-hidden`}
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            05 // Attachments
          </h3>
          <div className="flex gap-3 mt-2 overflow-x-auto pb-4 no-scrollbar items-center">
            <label htmlFor="submit-file-upload" className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-surface-dim/50 border border-border-dim border-dashed rounded-2xl cursor-pointer hover:border-primary transition-colors text-text-muted hover:text-primary backdrop-blur-lg">
              <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
              <span className="text-[10px] font-sans font-bold">Add</span>
              <input 
                type="file" 
                id="submit-file-upload" 
                className="hidden" 
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const newAttachments = Array.from(e.target.files).map(file => ({
                      name: file.name,
                      type: file.type || 'unknown'
                    }));
                    setAttachments([...attachments, ...newAttachments]);
                  }
                }}
              />
            </label>
            <button 
              onClick={handleScreenRecord}
              className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-surface-dim/50 border border-border-dim border-dashed rounded-2xl cursor-pointer hover:border-primary transition-colors text-text-muted hover:text-primary backdrop-blur-lg"
            >
              <span className="material-symbols-outlined text-2xl mb-1">screen_record</span>
              <span className="text-[10px] font-sans font-bold">Record Screen</span>
            </button>
            <AnimatePresence>
            {attachments.map((attachment, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={attachment.name + idx} 
                className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors text-white relative group backdrop-blur-xl shadow-lg"
              >
                <span className="material-symbols-outlined text-3xl mb-1 text-primary shadow-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                  {attachment.type.startsWith('image/') ? 'image' : attachment.type.startsWith('video/') ? 'movie' : 'description'}
                </span>
                <span className="text-[10px] font-sans font-bold truncate w-20 text-center" title={attachment.name}>{attachment.name}</span>
                <div 
                  className="absolute -top-2 -right-2 bg-background-dark border border-critical rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-critical/20 z-10 shadow-lg"
                  onClick={() => {
                    setAttachments(attachments.filter((_, i) => i !== idx));
                  }}
                >
                  <span className="material-symbols-outlined text-[12px] text-critical">close</span>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </motion.section>
        </div>
      </main>

      <AnimatePresence>
      </AnimatePresence>

      {/* Sticky Footer - Transmit */}
      <footer className="sticky bottom-0 p-5 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-50 w-full max-w-3xl mx-auto">
        <motion.button
          whileHover={!isTransmitting && text.trim() ? { scale: 1.02 } : {}}
          whileTap={!isTransmitting && text.trim() ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={isTransmitting || !text.trim()}
          className={`relative w-full h-16 rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            isTransmitting
              ? transmitStatus === "TRANSMISSION_FAILED"
                ? "bg-critical/20 border border-critical cursor-not-allowed"
                : "bg-primary/20 border border-primary cursor-wait"
              : !text.trim()
                ? "bg-surface-dim border border-border-dim text-text-muted cursor-not-allowed"
                : "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          }`}
        >
          {isTransmitting ? (
            <>
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-200 ${transmitStatus === "TRANSMISSION_FAILED" ? "bg-critical/30" : "bg-primary/30"}`}
                style={{ width: `${progress}%` }}
              ></div>
              {transmitStatus === "TRANSMISSION_FAILED" ? (
                <span className="material-symbols-outlined text-2xl relative z-10 text-critical">
                  error
                </span>
              ) : (
                <span className="material-symbols-outlined text-2xl relative z-10 animate-spin text-primary">
                  sync
                </span>
              )}
              <span
                className={`text-lg font-sans font-bold tracking-widest uppercase relative z-10 animate-pulse ${transmitStatus === "TRANSMISSION_FAILED" ? "text-critical" : "text-primary"}`}
              >
                {transmitStatus}
              </span>
              <span
                className={`absolute right-6 font-sans font-bold text-sm z-10 ${transmitStatus === "TRANSMISSION_FAILED" ? "text-critical" : "text-primary"}`}
              >
                {Math.floor(progress)}%
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl relative z-10">
                send
              </span>
              <span className="text-lg font-sans font-bold tracking-widest uppercase relative z-10">
                Transmit Signal
              </span>
            </>
          )}
        </motion.button>
        <div className="text-center mt-4">
          <span className="text-[10px] font-sans font-bold text-text-muted uppercase tracking-widest bg-surface-dim/50 px-3 py-1.5 rounded-full">
            {isAnonymous
              ? "ID: Incognito Proxy // 24.120.91.44"
              : "ID: Authenticated User // 24.120.91.44"}
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
