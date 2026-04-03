import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Grid } from "./components/Grid";
import { Submit } from "./components/Submit";
import { Metrics } from "./components/Metrics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingTour } from "./components/OnboardingTour";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState("login");
  const [showTour, setShowTour] = useState(false);
  const [gridFilter, setGridFilter] = useState<{
    dept?: string;
    status?: string;
  } | null>(null);

  const handleLogin = () => {
    setCurrentView("dashboard");
    setShowTour(true);
  };

  const handleFilterClick = (filter: { dept?: string; status?: string }) => {
    setGridFilter(filter);
    setCurrentView("grid");
  };

  return (
    <ErrorBoundary>
      <Layout currentView={currentView} onChangeView={setCurrentView}>
        <AnimatePresence mode="wait">
          {currentView === "login" && (
            <motion.div
              key="login"
              className="h-full flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          )}
          {currentView === "dashboard" && (
            <motion.div
              key="dashboard"
              className="h-full flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Dashboard
                onChangeView={setCurrentView}
                onFilterClick={handleFilterClick}
              />
            </motion.div>
          )}
          {currentView === "grid" && (
            <motion.div
              key="grid"
              className="h-full flex flex-col"
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
          )}
          {currentView === "submit" && (
            <motion.div
              key="submit"
              className="h-full flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Submit />
            </motion.div>
          )}
          {currentView === "metrics" && (
            <motion.div
              key="metrics"
              className="h-full flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Metrics
                onChangeView={setCurrentView}
                onFilterClick={handleFilterClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>

      <AnimatePresence>
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
