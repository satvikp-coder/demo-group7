import React from 'react';
import { Destination } from '../data/destinations';
import { ArrowLeft, Star, MapPin, Clock, Ticket, Calendar, ShieldCheck, Hotel, PlusCircle, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface DestinationDetailViewProps {
  destination: Destination;
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onBack: () => void;
  onAddToTrip: (dest: Destination) => void;
  isAddedToTrip: boolean;
  onSelectNearbyDestination?: (destId: string) => void;
  onOpenPlannerWithSite?: (dest: Destination) => void;
}

export const DestinationDetailView: React.FC<DestinationDetailViewProps> = ({
  destination,
  preferredHotels,
  onSelectPreferredHotel,
  onBack,
  onAddToTrip,
  isAddedToTrip,
  onSelectNearbyDestination,
  onOpenPlannerWithSite,
}) => {
  return (
    <div className="bg-salt min-h-screen border-b border-stone/30 animate-fadeIn">
      
      {/* 1. FULL-WIDTH HERO IMAGE BAND */}
      <div className="relative h-80 sm:h-96 md:h-[480px] w-full bg-ink overflow-hidden">
        {/* Background Image */}
        <img
          src={destination.imageUrl}
          alt={destination.imageAlt || destination.name}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />

        {/* Ink Indigo Gradient Overlay at bottom edge for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent" />

        {/* Top Floating Back Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-ink/80 hover:bg-ink text-salt border border-stone/40 hover:border-gold text-xs font-mono px-3.5 py-1.5 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gold" />
            <span>Back to All Destinations</span>
          </button>
        </div>

        {/* Overlaid Hero Content */}
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10 space-y-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gold text-ink font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
              {destination.officialCategory}
            </span>
            <span className="bg-ink/80 text-salt font-mono text-[11px] px-3 py-1 border border-stone/40 uppercase">
              {destination.district} District
            </span>
            <span className="text-gold font-mono text-sm font-bold flex items-center gap-1 bg-ink/80 px-2.5 py-0.5 border border-gold/40">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              {destination.rating}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-salt font-bold tracking-tight leading-tight">
            {destination.name}
          </h1>

          <p className="font-mono text-xs text-stone/90 max-w-2xl flex items-center gap-2">
            <Compass className="w-4 h-4 text-gold shrink-0" />
            <span>{destination.tag} • {destination.distanceFromAhmedabad} from Ahmedabad</span>
          </p>

        </div>
      </div>

      {/* 2. TWO-COLUMN MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* LEFT COLUMN (WIDER - lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Detailed Description Section */}
            <div className="bg-white p-6 sm:p-8 border border-stone/30 space-y-6 shadow-sm">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                  Heritage Monograph & Architectural Overview
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-charcoal font-bold">
                  About {destination.name}
                </h2>
              </div>

              <p className="text-stone/90 text-sm sm:text-base leading-relaxed font-body">
                {destination.description}
              </p>

              {/* Highlights List */}
              {destination.highlights && destination.highlights.length > 0 && (
                <div className="pt-4 border-t border-stone/20 space-y-3">
                  <h3 className="font-mono text-xs text-charcoal uppercase tracking-wider font-semibold">
                    Key Historical & Architectural Highlights:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {destination.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-mono text-stone bg-salt/60 p-2.5 border border-stone/20">
                        <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visiting Information Panel */}
            <div className="bg-ink text-salt p-6 sm:p-8 border border-stone/40 space-y-6">
              <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                Visitor Experience & Timing Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                
                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">Best Season</span>
                  <div className="font-bold text-salt text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.bestTime}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">Optimal climate for heritage walks</p>
                </div>

                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">Avg Visit Time</span>
                  <div className="font-bold text-salt text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.avgVisitTime}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">Recommended exploration duration</p>
                </div>

                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">Entry Ticket</span>
                  <div className="font-bold text-gold text-sm flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.entryFee}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">Official ASI / TCGL tariff</p>
                </div>

              </div>
            </div>

            {/* NEARBY ATTRACTIONS TERRACE-MINI-GRID */}
            {destination.nearbyAttractions && destination.nearbyAttractions.length > 0 && (
              <div className="space-y-4">
                <div className="border-l-2 border-gold pl-3">
                  <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                    Regional Circuit
                  </span>
                  <h3 className="font-display text-2xl text-charcoal font-bold">
                    Nearby Monuments & Heritage Attractions
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.nearbyAttractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      onClick={() => onSelectNearbyDestination && onSelectNearbyDestination(attraction.id)}
                      className="group bg-white p-3.5 border border-stone/30 hover:border-gold transition-all duration-200 cursor-pointer flex gap-3 items-center"
                    >
                      <img
                        src={attraction.imageUrl}
                        alt={attraction.name}
                        className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all shrink-0 border border-stone/20"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-gold uppercase block truncate">
                          {attraction.category}
                        </span>
                        <h4 className="font-display text-base font-bold text-charcoal group-hover:text-gold transition-colors truncate">
                          {attraction.name}
                        </h4>
                        <span className="text-xs font-mono text-stone flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold" />
                          {attraction.distance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN (NARROWER - lg:col-span-4, STICKY ON DESKTOP) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-ink text-salt p-6 border-2 border-gold/60 space-y-6 shadow-md">
              
              <div className="border-b border-stone/30 pb-4">
                <span className="font-mono text-xs text-gold uppercase tracking-wider block mb-1">
                  Official Heritage Summary
                </span>
                <h3 className="font-display text-2xl font-bold text-salt">
                  {destination.name}
                </h3>
              </div>

              {/* IBM Plex Mono Logistical Specs Panel */}
              <div className="space-y-3 font-mono text-xs">
                
                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">Entry Fee</span>
                  <span className="text-gold font-bold">{destination.entryFee}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">Avg Visit Time</span>
                  <span className="text-salt font-semibold">{destination.avgVisitTime}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">District</span>
                  <span className="text-salt font-semibold">{destination.district}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">Category</span>
                  <span className="text-salt font-semibold text-[11px] truncate max-w-[150px]">
                    {destination.officialCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">From Ahmedabad</span>
                  <span className="text-salt font-semibold">{destination.distanceFromAhmedabad}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-stone uppercase">Visitor Rating</span>
                  <span className="text-gold font-bold">{destination.rating}</span>
                </div>

              </div>

              {/* MADDER RED ACTION BUTTON: "Add to Trip Plan" */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onAddToTrip(destination)}
                  className={`w-full py-3.5 px-4 text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 flex items-center justify-center gap-2 border ${
                    isAddedToTrip
                      ? 'bg-emerald-800 text-salt border-emerald-600'
                      : 'bg-madder hover:bg-madder/90 text-salt border-madder'
                  }`}
                >
                  {isAddedToTrip ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Added to Trip Plan</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-salt" />
                      <span>Add to Trip Plan</span>
                    </>
                  )}
                </button>

                {onOpenPlannerWithSite && (
                  <button
                    onClick={() => onOpenPlannerWithSite(destination)}
                    className="w-full py-2.5 px-4 bg-transparent hover:bg-salt/10 text-gold hover:text-salt border border-gold/40 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Build Custom Itinerary</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-[10px] font-mono text-stone text-center">
                Adds site directly to your active route builder in the navigation bar.
              </p>

            </div>

          </div>

        </div>

        {/* 3. SUGGESTED HOTELS NEAR HERE STRIP */}
        {destination.nearbyHotels && destination.nearbyHotels.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone/30 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-l-2 border-gold pl-3">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                  Heritage Stay Accommodations
                </span>
                <h3 className="font-display text-2xl text-charcoal font-bold">
                  Suggested Hotels Near {destination.name}
                </h3>
              </div>
              <span className="font-mono text-xs text-stone">
                Toran TCGL Bungalows & Restored Haveli Stays
              </span>
            </div>

            {/* Horizontally Scrollable Row of Hotel Cards */}
            <div className="flex items-stretch gap-6 overflow-x-auto pb-4 scrollbar-none">
              {destination.nearbyHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-ink text-salt border border-stone/40 min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 flex flex-col justify-between p-4 space-y-4"
                >
                  <div className="relative h-40 overflow-hidden border border-stone/30 bg-charcoal">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    
                    {/* Official Stay Type Badge */}
                    <span className="absolute top-2 left-2 bg-salt text-ink font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      {hotel.stayType}
                    </span>

                    {/* Rating Badge */}
                    <span className="absolute bottom-2 right-2 bg-ink/90 text-gold font-mono text-[10px] font-bold px-2 py-0.5 border border-gold/40">
                      {hotel.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold text-salt leading-tight">
                      {hotel.name}
                    </h4>
                    <p className="text-xs font-mono text-stone flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{hotel.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone/30 text-xs font-mono">
                    <span className="text-stone">Tariff:</span>
                    <span className="text-gold font-bold">{hotel.pricePerNight}</span>
                  </div>

                  {onSelectPreferredHotel && (
                    <button
                      onClick={() => onSelectPreferredHotel(destination.id, hotel.id)}
                      className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                        preferredHotels?.[destination.id] === hotel.id
                          ? 'bg-gold text-ink border-gold shadow-xs'
                          : 'bg-salt/10 hover:bg-gold hover:text-ink text-salt border-stone/40'
                      }`}
                    >
                      {preferredHotels?.[destination.id] === hotel.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
                          <span>Preferred Stay Selected</span>
                        </>
                      ) : (
                        <span>Set as Preferred Stay</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
