import React, { useState } from "react";
import { motion } from "motion/react";
import { analyzeSentiment } from "../services/geminiService";

export function Submit() {
  const [classification, setClassification] = useState("PROCESS");
  const [severity, setSeverity] = useState("MED");
  const [dept, setDept] = useState("ROUTE_TO: [ ENGINEERING ]");
  const [text, setText] = useState("");
  const [flashing, setFlashing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transmitStatus, setTransmitStatus] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || isTransmitting) return;

    setIsTransmitting(true);
    setProgress(0);
    setTransmitStatus("ENCRYPTING_PAYLOAD...");

    try {
      // Simulate progress while analyzing sentiment
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

        // Save to localStorage
        const existingFeedback = JSON.parse(localStorage.getItem("pulse_feedback") || "[]");
        const newFeedback = {
          id: Date.now().toString(),
          classification,
          severity,
          dept,
          text,
          sentiment,
          isAnonymous,
          timestamp: Date.now(),
        };
        localStorage.setItem("pulse_feedback", JSON.stringify([...existingFeedback, newFeedback]));

        // Also create a ticket in glassbox_tickets for the Dashboard/Grid
        const existingTickets = JSON.parse(localStorage.getItem("glassbox_tickets") || "[]");
        const newTicket = {
          id: `#TKT-${Math.floor(Math.random() * 10000)}`,
          dept: `[${dept}]`,
          title: text.length > 60 ? text.substring(0, 60) + "..." : text,
          status: "QUEUED",
          time: "JUST NOW",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastUpdatedBy: isAnonymous ? "Anonymous" : "Current User",
          isFavorite: false
        };
        localStorage.setItem("glassbox_tickets", JSON.stringify([newTicket, ...existingTickets]));

        setTimeout(() => {
          setFlashing(false);
          setIsTransmitting(false);
          setText("");
          setProgress(0);
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
      className="flex flex-col flex-1 relative"
    >
      {flashing && (
        <div className="fixed inset-0 bg-white z-[100] transition-opacity duration-500 opacity-0 animate-[flash_0.5s_ease-out]"></div>
      )}

      <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-2xl border-b border-border-dim">
        <div className="flex items-center justify-between p-4 pb-3">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            className="text-primary hover:text-white transition-colors group flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-dim"
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

      <main className="flex-1 flex flex-col p-5 gap-6 pb-8 max-w-3xl mx-auto w-full">
        {/* Section 1: Classification */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 glass-panel bento-card p-5 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              01 // Classification
            </h3>
            <span className="text-[10px] font-sans font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              REQUIRED
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["PROCESS", "CULTURE", "COMP", "TOOLS"].map((item) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={item}
                onClick={() => setClassification(item)}
                className="flex-shrink-0 relative group"
              >
                {classification === item ? (
                  <div className="relative px-6 py-3 border border-primary bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      {item === "PROCESS"
                        ? "settings"
                        : item === "CULTURE"
                          ? "diversity_3"
                          : item === "COMP"
                            ? "attach_money"
                            : "build"}
                    </span>
                    <span>{item}</span>
                  </div>
                ) : (
                  <div className="relative px-6 py-3 border border-border-dim bg-surface-dim/50 text-text-muted font-medium text-sm tracking-wide uppercase rounded-xl hover:border-primary/50 hover:text-white transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      {item === "PROCESS"
                        ? "settings"
                        : item === "CULTURE"
                          ? "diversity_3"
                          : item === "COMP"
                            ? "attach_money"
                            : "build"}
                    </span>
                    <span>{item}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Section 2: Severity / Vibe Check */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 glass-panel bento-card p-5 hover:border-primary/40 transition-colors"
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            02 // Vibe Check (Severity)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeverity("LOW")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border transition-all ${severity === "LOW" ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "border-border-dim bg-surface-dim/50 hover:border-primary/50"}`}
            >
              <span className="text-3xl">😌</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "LOW" ? "text-primary" : "text-text-muted"}`}>Low Key</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeverity("MED")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border transition-all ${severity === "MED" ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "border-border-dim bg-surface-dim/50 hover:border-yellow-500/50"}`}
            >
              <span className="text-3xl">🤔</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "MED" ? "text-yellow-500" : "text-text-muted"}`}>Mid</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeverity("CRITICAL")}
              className={`py-4 flex flex-col items-center gap-2 rounded-xl border transition-all ${severity === "CRITICAL" ? "border-critical bg-critical/10 shadow-[0_0_15px_rgba(255,68,68,0.15)]" : "border-border-dim bg-surface-dim/50 hover:border-critical/50"}`}
            >
              <span className="text-3xl">🚨</span>
              <span className={`text-xs font-sans font-bold uppercase tracking-wider ${severity === "CRITICAL" ? "text-critical" : "text-text-muted"}`}>Critical</span>
            </motion.button>
          </div>
          <p className="text-[10px] text-text-muted font-sans mt-1 px-1">
            ✨ Critical vibes trigger immediate SLT notification.
          </p>
        </motion.section>

        {/* Section 3: Routing */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 glass-panel bento-card p-5 hover:border-primary/40 transition-colors"
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            03 // Target Dept
          </h3>
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
              <option className="bg-background-dark text-white">ROUTE_TO: [ HUMAN_RES ]</option>
              <option className="bg-background-dark text-white">ROUTE_TO: [ EXECUTIVE ]</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted text-lg">
                unfold_more
              </span>
            </div>
          </div>
        </motion.section>

        {/* Section 4: Anonymity Toggle */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 glass-panel bento-card p-5 hover:border-primary/40 transition-colors"
        >
          <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
            04 // Identity Protocol
          </h3>
          <motion.div
            whileTap={{ scale: 0.99 }}
            className={`flex items-center justify-between border p-4 rounded-xl cursor-pointer transition-all ${isAnonymous ? 'border-stable bg-stable/5' : 'border-border-dim bg-surface-dim/50 hover:border-primary/50'}`}
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isAnonymous ? 'bg-stable/20 text-stable' : 'bg-surface text-text-muted'}`}>
                <span className="material-symbols-outlined text-xl block">
                  {isAnonymous ? "visibility_off" : "visibility"}
                </span>
              </div>
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

        {/* Section 5: Observation Log */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 flex-1 glass-panel bento-card p-5 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-bold text-text-muted uppercase tracking-widest">
              05 // The Tea (Input Data)
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-stable font-sans font-bold tracking-wider opacity-80 bg-stable/10 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[12px]">
                lock
              </span>
              ENCRYPTED
            </div>
          </div>
          <div className="relative flex-1 min-h-[200px] group mt-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full bg-surface-dim/30 border border-border-dim focus:border-primary focus:ring-1 focus:ring-primary/50 text-white font-sans text-base p-4 resize-none rounded-xl placeholder-text-muted/50 selection:bg-primary/30 selection:text-white outline-none transition-all"
              placeholder="Spill the tea here... What's working? What's broken?"
            ></textarea>
          </div>
          <div className="flex justify-between items-center text-xs font-sans font-bold text-text-muted mt-2 px-1">
            <span>{text.length}/500 chars</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stable animate-pulse"></span>
              Buffer OK
            </span>
          </div>
        </motion.section>
      </main>

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
