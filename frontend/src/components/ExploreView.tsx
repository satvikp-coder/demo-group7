import React, { useState, useMemo } from 'react';
import { Destination, GUJARAT_DESTINATIONS, OFFICIAL_CATEGORIES } from '../data/destinations';
import { Search, Star, MapPin, Compass, ArrowUpDown, Clock, Ticket, RefreshCw, ChevronRight } from 'lucide-react';
import { SVG_COLORS } from '../data/colors';

interface ExploreViewProps {
  onSelectDestination: (dest: Destination) => void;
  onStartTripWithDestination: (dest: Destination) => void;
}

type SortOption = 'rating' | 'fee' | 'alphabetical' | 'distance';

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectDestination,
  onStartTripWithDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Filter & Sort Logic
  const filteredDestinations = useMemo(() => {
    let list = GUJARAT_DESTINATIONS.filter((dest) => {
      // Category match
      if (selectedCategory !== 'All Categories' && dest.officialCategory !== selectedCategory) {
        return false;
      }

      // Search prefix / substring match across name, district, location, highlights, description
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = dest.name.toLowerCase().includes(query);
        const districtMatch = dest.district.toLowerCase().includes(query);
        const locationMatch = dest.location.toLowerCase().includes(query);
        const categoryMatch = dest.category.toLowerCase().includes(query);
        const highlightMatch = dest.highlights.some((h) => h.toLowerCase().includes(query));

        return nameMatch || districtMatch || locationMatch || categoryMatch || highlightMatch;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.ratingValue - a.ratingValue;
      } else if (sortBy === 'fee') {
        return a.entryFeeNumeric - b.entryFeeNumeric;
      } else if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'distance') {
        return a.distanceNumeric - b.distanceNumeric;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('rating');
  };

  return (
    <div id="explore" className="bg-salt py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone/30 pb-6 gap-4">
          <div>
            <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
              Interactive Heritage Search & Discovery
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-charcoal tracking-tight font-bold">
              Explore Gujarat’s Sacred & Living Heritage
            </h1>
          </div>
          <p className="text-xs text-stone font-mono max-w-sm">
            Search 10 premier Solanki stepwells, Harappan salt deserts, Jyotirlinga shrines & UNESCO sanctuaries across Gujarat.
          </p>
        </div>

        {/* TOP SECTION: Search Field, Category Chips, Sort Dropdown */}
        <div className="space-y-6">
          
          {/* 1. Single Underlined Search Input */}
          <div className="relative group max-w-3xl">
            <div className="flex items-center gap-3 border-b-2 border-ink focus-within:border-gold transition-colors duration-200 py-2">
              <Search className="w-6 h-6 text-stone group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Somnath, Dwarka, Gir..."
                className="w-full bg-transparent font-display text-xl sm:text-2xl text-charcoal placeholder:text-stone/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-stone hover:text-madder uppercase px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
            <span className="text-[11px] font-mono text-stone/80 mt-1 block">
              Instant prefix match across site names, districts (Narmada, Gandhinagar, Mehsana...), and architecture tags.
            </span>
          </div>

          {/* 2. Horizontal Filter Chips & Sort Control Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            
            {/* Category Chips Scrollable Container */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {OFFICIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-mono transition-all duration-150 border ${
                      isSelected
                        ? 'bg-madder text-salt border-madder font-semibold shadow-sm'
                        : 'bg-transparent text-ink border-stone/50 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Right-aligned Sort Dropdown */}
            <div className="flex items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 border-stone/20 pt-3 lg:pt-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone" />
              <label htmlFor="sort-dropdown" className="font-mono text-xs text-stone uppercase tracking-wider">
                Sort by:
              </label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="font-mono text-xs text-charcoal bg-transparent border-b border-stone/50 py-1 font-semibold focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="rating">Rating (Highest First)</option>
                <option value="fee">Entry Fee (Lowest First)</option>
                <option value="alphabetical">Alphabetical (A – Z)</option>
                <option value="distance">Distance from Ahmedabad</option>
              </select>
            </div>

          </div>

        </div>

        {/* RESULTS METRICS & COUNT */}
        <div className="flex items-center justify-between text-xs font-mono text-stone border-b border-stone/20 pb-2">
          <span>
            Showing <strong className="text-charcoal">{filteredDestinations.length}</strong> of{' '}
            <strong className="text-charcoal">{GUJARAT_DESTINATIONS.length}</strong> heritage destinations
          </span>
          {(searchQuery || selectedCategory !== 'All Categories') && (
            <button
              onClick={handleResetFilters}
              className="text-madder hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* MAIN GRID or EMPTY STATE */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pt-4">
            {filteredDestinations.map((dest, idx) => {
              // Staggered Terrace layout effect on desktop
              const terraceShift = idx % 3 === 1 ? 'lg:translate-y-4' : idx % 3 === 2 ? 'lg:translate-y-8' : '';

              return (
                <div
                  key={dest.id}
                  className={`group bg-ink text-salt border border-stone/40 hover:border-gold transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${terraceShift}`}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-charcoal">
                    <img
                      src={dest.imageUrl}
                      alt={dest.imageAlt}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    
                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 left-3 bg-ink/90 backdrop-blur-sm border border-stone/40 px-2.5 py-1 text-[11px] font-mono text-salt uppercase tracking-wider">
                      {dest.officialCategory}
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute bottom-3 right-3 bg-salt text-ink font-mono text-[11px] font-bold px-2 py-0.5">
                      {dest.distanceFromAhmedabad} from AHD
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-stone">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{dest.district} District</span>
                        </span>
                        <span className="text-gold font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          {dest.rating}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-salt group-hover:text-gold transition-colors leading-tight">
                        {dest.name}
                      </h3>

                      <p className="text-xs font-body text-stone/90 line-clamp-2 pt-1 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="space-y-3 pt-3 border-t border-stone/30">
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone">
                        <div className="flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-gold shrink-0" />
                          <span className="truncate">{dest.entryFee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold shrink-0" />
                          <span className="truncate">{dest.avgVisitTime}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onSelectDestination(dest)}
                          className="flex-1 bg-stone/20 hover:bg-gold hover:text-ink text-salt text-xs font-mono py-2 px-3 border border-stone/40 hover:border-gold transition-colors duration-150 text-center font-semibold"
                        >
                          Inspect Site
                        </button>
                        <button
                          onClick={() => onStartTripWithDestination(dest)}
                          className="bg-gold hover:bg-gold/90 text-ink text-xs font-mono py-2 px-3 flex items-center gap-1 font-bold transition-colors duration-150"
                          title="Add to Itinerary Planner"
                        >
                          <span>Plan</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE WITH STEPPED CHEVRON WATERMARK PATTERN */
          <div className="bg-ink text-salt p-12 lg:p-16 border border-stone/40 text-center space-y-6 my-8 relative overflow-hidden">
            
            {/* Stepped Chevron Watermark Motif Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20L100 100L180 20M100 100L180 180M100 100L20 180" stroke={SVG_COLORS.gold} strokeWidth="8" />
                <path d="M220 20L300 100L380 20M300 100L380 180M300 100L220 180" stroke={SVG_COLORS.gold} strokeWidth="8" />
                <rect x="180" y="80" width="40" height="40" fill={SVG_COLORS.gold} />
              </svg>
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-salt/10 border border-gold/40 text-gold mb-2">
                <Compass className="w-8 h-8" />
              </div>

              <h3 className="font-display text-2xl font-bold text-salt">
                No Destinations Found
              </h3>

              <p className="text-sm font-mono text-stone leading-relaxed">
                No destinations match <span className="text-gold font-semibold">&apos;{searchQuery || selectedCategory}&apos;</span>. Try a different name or clear your filters.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-madder text-salt font-mono text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-madder/90 transition-colors border border-madder font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
