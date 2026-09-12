import React from "react";
import { Compass, Home, MapPin, ArrowRight, AlertTriangle } from "lucide-react";
import { navigate } from "../utils/router";
import { useLanguage } from "../context/LanguageContext";

interface NotFoundViewProps {
  invalidPath: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ invalidPath }) => {
  const { language } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-salt">
      <div className="max-w-xl w-full bg-white border-2 border-stone/30 shadow-md p-8 sm:p-10 space-y-6 text-center rounded-2xl">
        {/* Architectural Stepped Icon */}
        <div className="mx-auto w-14 h-14 border border-gold/60 flex items-center justify-center p-1.5 bg-ink rounded-xl">
          <div className="w-full h-full border border-salt/20 flex items-end justify-start p-1 rounded-lg">
            <div className="w-2/3 h-2/3 bg-gold flex items-center justify-center rounded-md">
              <AlertTriangle className="w-4 h-4 text-ink" />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-madder/10 border border-madder/30 px-3 py-1 font-mono text-xs text-madder uppercase tracking-wider rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-madder"></span>
          <span>404 — Route Not Found</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl text-charcoal font-bold tracking-tight">
            {language === "hi"
              ? "मार्ग या स्थल नहीं मिला"
              : "Heritage Route or Monument Not Found"}
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone max-w-md mx-auto leading-relaxed">
            {language === "hi"
              ? "अनुरोधित पथ गुजरात हेरिटेज डायरेक्टरी में दर्ज नहीं है। कृपया नीचे दिए गए मान्य पृष्ठों में से चुनें।"
              : "The requested path does not exist in the Gujarat Heritage Route Ledger. The monument identifier may be misspelled or the circuit unmapped."}
          </p>
        </div>

        {/* Invalid Path Display */}
        <div className="bg-salt border border-stone/30 p-3 font-mono text-xs text-stone break-all text-left rounded-xl">
          <span className="text-gold font-bold uppercase tracking-wider block text-[10px] mb-1">
            Attempted Route
          </span>
          <span className="text-charcoal font-semibold">{invalidPath}</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-ink hover:bg-ink/90 text-salt border border-gold px-5 py-2.5 font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs rounded-lg"
          >
            <Home className="w-3.5 h-3.5 text-gold" />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate("/explore")}
            className="w-full sm:w-auto bg-salt hover:bg-stone/10 text-charcoal border border-stone/40 px-5 py-2.5 font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>Explore Monuments</span>
          </button>

          <button
            onClick={() => navigate("/hotels")}
            className="w-full sm:w-auto bg-salt hover:bg-stone/10 text-charcoal border border-stone/40 px-5 py-2.5 font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span>Ranked Stays</span>
          </button>
        </div>
      </div>
    </div>
  );
};
