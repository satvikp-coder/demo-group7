import React from 'react';
import { Destination } from '../data/destinations';
import { X, MapPin, Star, Ticket, Clock, ArrowRight, ShieldCheck, Landmark } from 'lucide-react';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (destination: Destination) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onPlanTrip,
}) => {
  if (!destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-salt border-2 border-gold/60 max-w-2xl w-full text-charcoal p-6 sm:p-8 relative shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone hover:text-ink hover:bg-stone/20 border border-stone/30 transition-colors"
          aria-label="Close details modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Tag & Category */}
        <div className="flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-widest mb-2">
          <Landmark className="w-4 h-4 text-gold" />
          <span>{destination.category}</span>
        </div>

        {/* Title in Fraunces */}
        <h2 className="font-display text-3xl sm:text-4xl text-ink font-semibold mb-2">
          {destination.name}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone mb-6 border-b border-stone/30 pb-4">
          <span className="flex items-center gap-1 text-charcoal">
            <MapPin className="w-3.5 h-3.5 text-gold" />
            {destination.location}
          </span>
          <span className="text-gold font-bold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            {destination.rating}
          </span>
          <span className="text-stone">Distance: {destination.distanceFromAhmedabad}</span>
        </div>

        {/* Image */}
        <div className="relative h-64 sm:h-72 overflow-hidden bg-ink mb-6 border border-stone/40">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-ink/90 text-salt px-3 py-1 font-mono text-xs border border-stone/40">
            {destination.tag}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-body text-charcoal/90 leading-relaxed mb-6">
          {destination.description}
        </p>

        {/* Highlights List */}
        <div className="mb-6 bg-ink/5 p-4 border border-stone/30 space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-stone font-semibold block">
            Architectural & Cultural Highlights:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-body text-charcoal">
            {destination.highlights.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ledger Details Grid in IBM Plex Mono */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-ink text-salt border border-stone/40 font-mono text-xs mb-6">
          <div>
            <span className="text-stone block uppercase text-[10px]">Entry Fee Ledger</span>
            <span className="text-gold font-semibold text-xs sm:text-sm">{destination.entryFee}</span>
          </div>
          <div>
            <span className="text-stone block uppercase text-[10px]">Optimal Season</span>
            <span className="text-salt font-semibold text-xs sm:text-sm">{destination.bestTime}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-stone block uppercase text-[10px]">Recommended Stay</span>
            <span className="text-salt font-semibold text-xs sm:text-sm">{destination.duration}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => {
              onPlanTrip(destination);
              onClose();
            }}
            className="flex-1 bg-madder hover:bg-madder/90 text-salt py-3 px-4 text-xs uppercase font-mono tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 border border-madder"
          >
            <span>Plan Route Including This Site</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="border border-stone/40 hover:border-stone py-3 px-5 text-xs font-mono uppercase text-stone hover:text-charcoal transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
