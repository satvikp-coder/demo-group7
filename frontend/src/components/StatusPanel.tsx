import React from "react";
import { Loader2, AlertTriangle, Info } from "lucide-react";

export interface StatusAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface StatusPanelProps {
  kind: "loading" | "error" | "empty";
  /** Page heading (the page's single h1 while this panel is shown). */
  title: string;
  message?: React.ReactNode;
  actions?: StatusAction[];
}

/** A page-sized loading, error or empty state, styled like the Not Found page instead of bare text. */
export const StatusPanel: React.FC<StatusPanelProps> = ({ kind, title, message, actions = [] }) => {
  const Icon = kind === "loading" ? Loader2 : kind === "error" ? AlertTriangle : Info;
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-salt">
      <div
        role={kind === "error" ? "alert" : "status"}
        className="max-w-xl w-full bg-white border-2 border-stone/30 shadow-md p-8 sm:p-10 space-y-5 text-center rounded-2xl"
      >
        <div className="mx-auto w-12 h-12 border border-gold/60 flex items-center justify-center bg-ink rounded-xl">
          <Icon className={`w-5 h-5 text-gold ${kind === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal font-bold tracking-tight">{title}</h1>
        {message && <p className="font-body text-sm text-charcoal/80 max-w-md mx-auto leading-relaxed">{message}</p>}
        {actions.length > 0 && (
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            {actions.map(action => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`w-full sm:w-auto px-5 py-2.5 font-bold cursor-pointer transition-colors rounded-lg border ${
                  action.primary
                    ? "bg-ink hover:bg-ink/90 text-salt border-gold"
                    : "bg-salt hover:bg-stone/10 text-charcoal border-stone/40"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
