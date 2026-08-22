import React, { useState } from "react";
import { Smartphone, Download, X, Sparkles, Check } from "lucide-react";

interface PwaInstallPromptProps {
  deferredPrompt: any;
  onDismiss: () => void;
  onInstalled: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  deferredPrompt,
  onDismiss,
  onInstalled,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions if native prompt isn't supported or directly available
      alert(
        'To install, tap your browser menu (⋮ or Share icon) and select "Add to Home Screen".',
      );
      onDismiss();
      return;
    }

    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsSuccess(true);
        setTimeout(() => {
          onInstalled();
        }, 1500);
      } else {
        onDismiss();
      }
    } catch (err) {
      console.warn("Error during PWA installation prompt:", err);
      onDismiss();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Add Heritage Tourism Planner to Home Screen"
      className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] bg-ink text-salt border-2 border-gold p-4 shadow-2xl space-y-3 font-mono text-xs animate-fadeIn"
    >
      <div className="flex items-start justify-between gap-2 border-b border-stone/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gold text-ink p-1.5 font-bold border border-ink shrink-0">
            <Smartphone className="w-4 h-4 text-ink" />
          </div>
          <div>
            <span className="text-gold font-bold text-[10px] uppercase tracking-wider block">
              Offline App Available
            </span>
            <h4 className="font-display text-sm text-salt font-bold">
              Add to Home Screen
            </h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dismiss installation prompt"
          className="text-stone hover:text-salt p-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-stone font-body text-xs leading-relaxed">
        Save this itinerary for offline use in signal-blind heritage areas
        (stepwells, temples, wildlife sanctuaries).
      </p>

      {isSuccess ? (
        <div className="p-2.5 bg-gold text-ink font-bold flex items-center justify-center gap-2 border border-ink">
          <Check className="w-4 h-4 text-ink" />
          <span>App Installed to Home Screen!</span>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 border border-stone/50 hover:bg-stone/20 text-stone hover:text-salt font-bold transition-colors cursor-pointer"
          >
            Maybe Later
          </button>

          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-4 py-1.5 bg-gold hover:bg-gold/90 text-ink font-bold border border-ink shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-ink" />
            <span>{isInstalling ? "Installing..." : "Add to Home Screen"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
