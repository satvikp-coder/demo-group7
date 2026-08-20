import React from 'react';
import { ChevronDivider } from './ChevronDivider';
import { Layers, Landmark, Sparkles } from 'lucide-react';

export const ValueProps: React.FC = () => {
  return (
    <section className="bg-salt py-16 border-b border-stone/30 relative">
      
      {/* Signature Stepped Chevron Divider Above */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <ChevronDivider count={12} className="opacity-90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
            System Architecture & Purpose
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal tracking-tight">
            Why this exists
          </h2>
        </div>

        {/* Integrated Asymmetric Block (Not 3 disconnected shadow cards) */}
        <div className="bg-ink text-salt border border-stone/40 p-6 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Watermark Motif */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-stepwell-pattern opacity-10 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative z-10 divide-y md:divide-y-0 md:divide-x divide-stone/30">
            
            {/* Value Prop 1 */}
            <div className="pt-6 md:pt-0 md:pr-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  01
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">Methodology</span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold" />
                Terrace-First Routes
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                Rather than random tourist pins, heritage sites are organized into geographic terraces (Ahmedabad-Modhera, Kutch Crafts, Sacred Saurashtra Coast) for efficient road sequences without backtracking.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="pt-6 md:pt-0 md:px-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  02
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">Financial Transparency</span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Landmark className="w-4 h-4 text-gold" />
                Ledger-Level Expenses
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                Every site lists verified ticket prices in Indian Rupees for domestic and international visitors, photography permit fees, and average local auto/taxi fares formatted in clear ledger typography.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="pt-6 md:pt-0 md:pl-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  03
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">Cultural Heritage</span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Artisan Guild Direct Access
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                Direct geographic coordinates and contact details for master Ajrakh block-printers in Dhamadka, Rogan artists in Nirona, and Patola weavers in Patan without middleman commission markups.
              </p>
            </div>

          </div>

          {/* Bottom Bar inside the asymmetric block */}
          <div className="mt-8 pt-6 border-t border-stone/30 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone">
            <span>Verified against Gujarat Tourism Board & Archaeological Survey of India datasets</span>
            <span className="text-gold font-medium">Updated for 2026 Travel Seasons</span>
          </div>

        </div>

      </div>
    </section>
  );
};
