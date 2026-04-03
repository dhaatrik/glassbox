import React from "react";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative z-40 w-full h-full flex flex-col items-center justify-center p-6 space-y-12 min-h-screen"
    >
      {/* Header / Logo Section */}
      <div className="text-center w-full max-w-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-[0_0_30px_var(--theme-primary-dim)]"
        >
          <span className="material-symbols-outlined text-white text-3xl">grid_view</span>
        </motion.div>
        <h1 className="text-white text-6xl font-display italic tracking-tight mb-3 drop-shadow-lg">
          Glassbox
        </h1>
        <p className="font-sans text-text-muted text-sm tracking-wide">
          The modern workspace operating system.
        </p>
      </div>

      {/* Central Authentication Block */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-full max-w-sm glass-panel p-8 rounded-3xl relative overflow-hidden group"
      >
        <div className="flex flex-col items-center gap-8">
          <div className="text-center space-y-1">
            <h2 className="text-white font-sans text-xl font-bold">
              Welcome back
            </h2>
            <p className="text-text-muted text-sm">
              Sign in to access your grid
            </p>
          </div>

          {/* Handshake Button */}
          <div className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogin}
              className="w-full relative overflow-hidden bg-white text-black font-bold rounded-2xl py-4 px-6 focus:outline-none shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow"
            >
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-sm tracking-wide">Continue with SSO</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer / Legal */}
      <div className="w-full text-center space-y-2 opacity-60">
        <p className="font-sans text-xs text-text-muted">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </motion.main>
  );
}
