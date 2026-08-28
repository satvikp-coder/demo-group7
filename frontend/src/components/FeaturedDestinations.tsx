import React, { useState } from 'react';
import { Destination, GUJARAT_DESTINATIONS } from '../data/destinations';
import { ArrowUpRight, MapPin, Ticket, Star, Clock, Info } from 'lucide-react';

interface FeaturedDestinationsProps {
  onSelectDestination: (destination: Destination) => void;
  onStartTripWithDestination: (destination: Destination) => void;
}

export const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
  onSelectDestination,
  onStartTripWithDestination,
}) => {
  // Filter the featured 6 sites asked by user prompt: Somnath, Dwarka, Rann of Kutch, Gir, Modhera, Champaner
  const featuredIds = ['somnath', 'dwarka', 'rann-of-kutch', 'gir', 'modhera', 'champaner'];
  const featuredDestinations = GUJARAT_DESTINATIONS.filter(d => featuredIds.includes(d.id));

  return (
    <section id="explore" className="bg-salt py-16 lg:py-24 border-b border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-stone/30 pb-6">
          <div>
            <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-2">
              Terrace Grid Inventory
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal tracking-tight">
              Featured Heritage Sites
            </h2>
          </div>
          <p className="text-sm font-body text-charcoal/70 max-w-md mt-3 md:mt-0">
            Arranged in descending terrace order. Select any site to inspect entry fee ledgers, optimal seasons, and craft connections.
          </p>
        </div>

        {/* Terrace Grid Layout: Staggered Vertically on Desktop (Odd items shifted down) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pb-12">
          {featuredDestinations.map((site, index) => {
            const isOddCol = index % 2 === 1;
            return (
              <div
                key={site.id}
                className={`group bg-salt border border-stone/40 hover:border-gold transition-colors duration-200 p-3 flex flex-col justify-between ${
                  isOddCol ? 'terrace-card-odd' : 'terrace-card-even'
                }`}
              >
                <div>
                  {/* Image with Tag Overlay */}
                  <div className="relative h-60 overflow-hidden bg-ink mb-4 border border-stone/20">
                    <img
                      src={site.imageUrl}
                      alt={site.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Category Tag Pill */}
                    <div className="absolute top-3 left-3 bg-ink/90 text-salt px-2.5 py-1 text-[11px] font-mono border border-stone/40">
                      {site.category}
                    </div>

                    {/* Stepped Corner Detail */}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-salt border-t border-l border-stone/40 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gold"></div>
                    </div>
                  </div>

                  {/* Header & Subhead */}
                  <div className="space-y-2 mb-4 px-1">
                    <div className="flex items-center justify-between text-xs font-mono text-stone">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gold" />
                        {site.location}
                      </span>
                      <span className="text-gold font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        {site.rating}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-charcoal font-medium leading-snug group-hover:text-ink transition-colors">
                      {site.name}
                    </h3>

                    <p className="text-xs text-charcoal/70 line-clamp-2 font-body leading-relaxed">
                      {site.description}
                    </p>
                  </div>
                </div>

                {/* Ledger Data Footer in IBM Plex Mono */}
                <div className="pt-3 border-t border-stone/30 px-1 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold" />
                      Best Time:
                    </span>
                    <span className="text-gold font-semibold">{site.bestTime}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone">Entry Fee:</span>
                    <span className="text-ink font-semibold">{site.entryFee}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-stone">Ahmedabad Dist:</span>
                    <span className="text-charcoal">{site.distanceFromAhmedabad}</span>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectDestination(site)}
                      className="flex-1 bg-ink/5 hover:bg-ink hover:text-salt text-ink border border-stone/40 py-2 px-3 text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5 text-gold" />
                      <span>Inspect Details</span>
                    </button>

                    <button
                      onClick={() => onStartTripWithDestination(site)}
                      className="bg-madder hover:bg-madder/90 text-salt p-2 text-xs transition-colors duration-150 border border-madder"
                      title={`Plan trip including ${site.name}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
