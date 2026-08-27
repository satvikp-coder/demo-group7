import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Sparkles, Building2, ChevronRight } from "lucide-react";

interface HomeTransitionOverlayProps {
  isVisible?: boolean;
}

export const HomeTransitionOverlay: React.FC<HomeTransitionOverlayProps> = ({
  isVisible = true,
}) => {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    setShowBanner(true);
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <div className="relative w-full overflow-hidden pointer-events-none">
      {/* Animated Stepped Gold Border Sweep */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-1 bg-gradient-to-r from-gold via-madder to-gold origin-left w-full"
      />

      {/* Floating Welcome Toast on Home Screen Return */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pointer-events-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1"
          >
            <div className="bg-ink text-salt border border-gold/50 shadow-lg p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 bg-gold/20 border border-gold flex items-center justify-center text-gold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-gold font-bold uppercase tracking-wider block text-[10px] sm:text-xs">
                    ✦ Welcome to Gujarat Heritage Directory
                  </span>
                  <span className="text-stone text-[10px] hidden sm:block">
                    Explore 10 monuments, preserved heritage stays, &
                    ledger-precise route planning.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-salt/10 border border-stone/40 text-gold px-2 py-0.5 text-[10px] uppercase font-bold">
                  Solanki & Kutch Circuit
                </span>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-stone hover:text-salt text-[10px] uppercase underline cursor-pointer ml-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
