import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center font-mono relative overflow-hidden">
          <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none z-40"></div>
          <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-50"></div>

          <div className="relative z-50 max-w-md w-full bg-black/80 border border-critical p-8 rounded-sm shadow-[0_0_30px_rgba(255,42,109,0.3)] animate-[fade-in_0.3s_ease-out]">
            <span className="material-symbols-outlined text-critical text-6xl mb-4 animate-pulse">
              warning
            </span>
            <h1 className="text-critical text-2xl font-display font-bold mb-2 tracking-widest">
              SYSTEM_FAILURE
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              A critical error occurred in the UI thread. The system has halted
              to prevent data corruption.
            </p>
            <div className="bg-critical/10 border border-critical/30 p-3 text-left overflow-auto mb-6 h-32 text-xs text-critical/80 font-mono">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-critical/20 border border-critical text-critical hover:bg-critical hover:text-black transition-colors font-bold tracking-widest"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
