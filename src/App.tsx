import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Grid } from "./components/Grid";
import { Submit } from "./components/Submit";
import { Metrics } from "./components/Metrics";
import { Insights } from "./components/Insights";
import { Settings } from "./components/Settings";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingTour } from "./components/OnboardingTour";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(false);
  const [gridFilter, setGridFilter] = useState<{
    dept?: string;
    status?: string;
  } | null>(null);

  React.useEffect(() => {
    const theme = localStorage.getItem("glassbox_theme") || "CYBER";
    document.documentElement.classList.remove("theme-cyan", "theme-vaporwave", "theme-void", "theme-matcha", "theme-lavender", "theme-dracula");
    if (theme === "CYBER") document.documentElement.classList.add("theme-cyan");
    if (theme === "NEON") document.documentElement.classList.add("theme-vaporwave");
    if (theme === "DRACULA") document.documentElement.classList.add("theme-dracula");
    if (theme === "MATCHA") document.documentElement.classList.add("theme-matcha");
    if (theme === "LAVENDER") document.documentElement.classList.add("theme-lavender");
    if (theme === "VOID") document.documentElement.classList.add("theme-void");
  }, []);

  const handleLogin = () => {
    navigate("/dashboard");
    setShowTour(true);
  };

  const handleFilterClick = (filter: { dept?: string; status?: string }) => {
    setGridFilter(filter);
    navigate("/grid");
  };

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route 
              path="/login" 
              element={
                <motion.div
                  key="login"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Login onLogin={handleLogin} />
                </motion.div>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <motion.div
                  key="dashboard"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Dashboard
                    onFilterClick={handleFilterClick}
                  />
                </motion.div>
              } 
            />
            <Route 
              path="/grid" 
              element={
                <motion.div
                  key="grid"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Grid
                    initialFilter={gridFilter}
                    onClearFilter={() => setGridFilter(null)}
                  />
                </motion.div>
              } 
            />
            <Route 
              path="/submit" 
              element={
                <motion.div
                  key="submit"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Submit />
                </motion.div>
              } 
            />
            <Route 
              path="/metrics" 
              element={
                <motion.div
                  key="metrics"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Metrics
                    onFilterClick={handleFilterClick}
                  />
                </motion.div>
              } 
            />
            <Route 
              path="/insights" 
              element={
                <motion.div
                  key="insights"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Insights />
                </motion.div>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <motion.div
                  key="settings"
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Settings />
                </motion.div>
              } 
            />
            <Route 
              path="*" 
              element={
                <motion.div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-dark text-center">
                  <span className="material-symbols-outlined text-[80px] text-border-dim mb-4">link_off</span>
                  <h1 className="text-3xl font-display text-white mb-2">404 // SIGNAL LOST</h1>
                  <p className="text-text-muted max-w-sm mb-6">The sector you are trying to access has been redacted or does not exist.</p>
                  <button onClick={() => navigate('/dashboard')} className="border border-primary/50 text-primary px-6 py-2 rounded-full hover:bg-primary/10 transition-colors tracking-widest font-bold text-xs uppercase">Return to Base</button>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Layout>

      <AnimatePresence>
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
