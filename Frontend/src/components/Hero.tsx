import React, { useState } from 'react';
import { ArrowRight, MapPin, Compass } from 'lucide-react';

interface HeroProps {
  onStartPlanning: () => void;
  onExploreClick: () => void;
}

const HEADLINE_OPTIONS = [
  "Plan Gujarat, terrace by terrace.",
  "Carved stone, salt desert, sacred coast.",
  "Travel structured by ancient geometry."
];

export const Hero: React.FC<HeroProps> = ({ onStartPlanning, onExploreClick }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  return (
    <section id="hero" className="relative bg-salt text-charcoal pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-stone/30">
      
      {/* Background Watermark Chevron Motif */}
      <div className="absolute inset-0 bg-stepwell-pattern opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Asymmetric Typography & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Subhead / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-salt text-xs font-mono uppercase tracking-widest border border-stone/30">
              <span className="w-2 h-2 bg-gold"></span>
              <span>Stepwell Geometric Itinerary Engine</span>
            </div>

            {/* Headline with interactive headline variant selector */}
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-[1.08] tracking-tight">
                {HEADLINE_OPTIONS[headlineIndex]}
              </h1>

              {/* Minimal headline toggle pills */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-mono text-stone uppercase tracking-wider">Perspective:</span>
                {HEADLINE_OPTIONS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeadlineIndex(idx)}
                    className={`h-2 transition-all duration-200 ${
                      headlineIndex === idx ? 'w-8 bg-gold' : 'w-2 bg-stone/40 hover:bg-stone'
                    }`}
                    title={`Headline view ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Supporting Sentence */}
            <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl font-body leading-relaxed border-l-2 border-gold/60 pl-4 py-0.5">
              Explore 10 Gujarat heritage sites—from the 11th-century carved sun temple of Modhera to the salt expanses of Kutch and Gir lion reserves. Structured routes, authentic craft guilds, and ledger-precise travel expenses.
            </p>

            {/* Primary Action Button (Madder Red) & Secondary Link */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartPlanning}
                className="bg-madder hover:bg-madder/90 text-salt px-7 py-3.5 text-sm font-medium tracking-wide uppercase shadow-sm transition-colors duration-150 flex items-center gap-2 border border-madder group"
              >
                <span>Start planning</span>
                <ArrowRight className="w-4 h-4 text-salt group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreClick}
                className="bg-transparent text-ink hover:text-gold border border-stone/40 hover:border-gold px-6 py-3.5 text-sm font-medium transition-colors duration-150 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-gold" />
                <span>Browse 10 Heritage Sites</span>
              </button>
            </div>

            {/* Key Data Stats Strip in IBM Plex Mono */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone/30 text-xs font-mono">
              <div>
                <span className="text-stone block uppercase text-[10px] tracking-wider">Sites Covered</span>
                <span className="text-ink font-semibold text-base sm:text-lg">10 Monuments</span>
              </div>
              <div>
                <span className="text-stone block uppercase text-[10px] tracking-wider">Historical Depth</span>
                <span className="text-ink font-semibold text-base sm:text-lg">2,500 Years</span>
              </div>
              <div>
                <span className="text-stone block uppercase text-[10px] tracking-wider">Route Precision</span>
                <span className="text-gold font-semibold text-base sm:text-lg">Km & Fee Ledger</span>
              </div>
            </div>

          </div>

          {/* Right Column: Stepped / Terraced Image Collage */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Terraced Grid Arrangement of 4 Real Site Images */}
            <div className="grid grid-cols-2 gap-3 relative">
              
              {/* Card 1: Modhera Sun Temple - Top Left */}
              <div className="terrace-card-even bg-ink p-1.5 border border-stone/40 shadow-sm">
                <div className="relative h-44 sm:h-52 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=800"
                    alt="Modhera Sun Temple Stepped Tank Ramakunda"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-salt">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-wider block">Solanki Era (1026 AD)</span>
                    <h3 className="font-display text-sm font-semibold">Modhera Sun Temple</h3>
                  </div>
                </div>
              </div>

              {/* Card 2: Rann of Kutch - Top Right (Shifted down for terrace effect) */}
              <div className="terrace-card-odd bg-ink p-1.5 border border-stone/40 shadow-sm mt-6 sm:mt-8">
                <div className="relative h-44 sm:h-52 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800"
                    alt="Rann of Kutch White Salt Desert"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-salt">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-wider block">Salt Desert & Craft</span>
                    <h3 className="font-display text-sm font-semibold">Rann of Kutch</h3>
                  </div>
                </div>
              </div>

              {/* Card 3: Gir Forest - Bottom Left */}
              <div className="terrace-card-even bg-ink p-1.5 border border-stone/40 shadow-sm">
                <div className="relative h-40 sm:h-48 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&q=80&w=800"
                    alt="Gir National Park Asiatic Lion Reserve"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-salt">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-wider block">Ecological Sanctuary</span>
                    <h3 className="font-display text-sm font-semibold">Gir Forest</h3>
                  </div>
                </div>
              </div>

              {/* Card 4: Adalaj Ni Vav - Bottom Right (Shifted down) */}
              <div className="terrace-card-odd bg-ink p-1.5 border border-stone/40 shadow-sm mt-6 sm:mt-8">
                <div className="relative h-40 sm:h-48 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800"
                    alt="Adalaj Ni Vav 5-story Subterranean Stepwell"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-salt">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-wider block">Subterranean Stepwell</span>
                    <h3 className="font-display text-sm font-semibold">Adalaj Ni Vav</h3>
                  </div>
                </div>
              </div>

            </div>

            {/* Terraced Stepped Border Backdrop Accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-r-2 border-b-2 border-gold/40 pointer-events-none hidden sm:block"></div>
            
          </div>

        </div>
      </div>
    </section>
  );
};
