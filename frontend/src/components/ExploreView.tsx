import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Destination, GUJARAT_DESTINATIONS, OFFICIAL_CATEGORIES } from '../data/destinations';
import { Search, Star, MapPin, Compass, ArrowUpDown, Clock, Ticket, RefreshCw, ChevronRight, Accessibility, Mic } from 'lucide-react';
import { SVG_COLORS } from '../data/colors';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { AccessibilityBadge } from './AccessibilityBadge';
import { searchDestinationsWithTrie, getDestinationMap } from '../utils/destinationTrie';
import { ImageWithFallback } from './ImageWithFallback';

interface ExploreViewProps {
  onSelectDestination: (dest: Destination) => void;
  onStartTripWithDestination: (dest: Destination) => void;
}

type SortOption = 'rating' | 'fee' | 'alphabetical' | 'distance' | 'demand';

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectDestination,
  onStartTripWithDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [selectedDemands, setSelectedDemands] = useState<('low' | 'moderate' | 'high')[]>([]);
  const { language, t, getName } = useLanguage();

  // Voice Search / Web Speech API State
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSpeechSupported) return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setAriaAnnouncement('Voice listening stopped.');
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map language code to Web Speech API lang
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setAriaAnnouncement('Listening...');
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setSearchQuery(transcript);
            setAriaAnnouncement(`Transcribed: "${transcript}"`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setAriaAnnouncement(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const toggleDemandFilter = (level: 'low' | 'moderate' | 'high') => {
    setSelectedDemands(prev =>
      prev.includes(level) ? prev.filter(d => d !== level) : [...prev, level]
    );
  };

  // Map category to localized string key
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All Categories': return t('cat.all', 'All Categories');
      case 'Heritage Sites': return t('cat.heritage', 'Heritage Sites');
      case 'UNESCO World Heritage Site': return t('cat.unesco', 'UNESCO World Heritage Site');
      case 'Religious Sites': return t('cat.religious', 'Religious Sites');
      case 'Beaches': return t('cat.beaches', 'Beaches');
      case 'Bird Watching Sites': return t('cat.birds', 'Bird Watching Sites');
      case 'Museums': return t('cat.museums', 'Museums');
      case 'Weekend Get-aways': return t('cat.weekend', 'Weekend Get-aways');
      default: return cat;
    }
  };

  // ─── TRIE SEARCH & DISCOVERY PIPELINE ──────────────────────────────────────
  // Architecture Flow:
  // USER QUERY -> TRIE SEARCH -> MATCHING RESULT IDS -> LOOK UP ORIGINAL RECORDS -> FILTERS -> SORTING -> UI

  // 1. Trie Search: query the memoized Suffix/Prefix Trie index to get matching destination IDs
  const matchingDestinationIds = useMemo(() => {
    return searchDestinationsWithTrie(searchQuery);
  }, [searchQuery]);

  // 2. Lookup Original Records: map matched IDs directly to destination records using O(1) Map lookup
  const candidateDestinations = useMemo(() => {
    if (matchingDestinationIds === null) {
      // Empty search query: all destinations are candidates
      return GUJARAT_DESTINATIONS;
    }
    const destMap = getDestinationMap();
    const records: Destination[] = [];
    for (const id of matchingDestinationIds) {
      const dest = destMap.get(id);
      if (dest) {
        records.push(dest);
      }
    }
    return records;
  }, [matchingDestinationIds]);

  // 3 & 4. Filter & Sort: apply existing category/demand/accessibility filters and sorting to Trie candidates
  const filteredDestinations = useMemo(() => {
    return candidateDestinations
      .filter((dest) => {
        // Category match
        if (selectedCategory !== 'All Categories' && dest.officialCategory !== selectedCategory) {
          return false;
        }

        // Wheelchair accessibility match
        if (wheelchairOnly) {
          const hasWheelchair = dest.attractions.some(a => a.wheelchairAccessible === true);
          if (!hasWheelchair) return false;
        }

        // Physical demand match
        if (selectedDemands.length > 0) {
          const primaryDemand = dest.attractions?.[0]?.physicalDemand || 'moderate';
          if (!selectedDemands.includes(primaryDemand)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.ratingValue - a.ratingValue;
        } else if (sortBy === 'fee') {
          return a.entryFeeNumeric - b.entryFeeNumeric;
        } else if (sortBy === 'alphabetical') {
          return getName(a).localeCompare(getName(b));
        } else if (sortBy === 'distance') {
          return a.distanceNumeric - b.distanceNumeric;
        } else if (sortBy === 'demand') {
          // Demand ordering: MODERATE > HIGH > LOW, alphabetical tie-break
          const demandOrder: Record<string, number> = { 'moderate': 0, 'high': 1, 'low': 2 };
          const getDemandRank = (dest: typeof a) => {
            const primaryDemand = dest.attractions?.[0]?.physicalDemand || 'moderate';
            return demandOrder[primaryDemand] ?? 1;
          };
          const rankDiff = getDemandRank(a) - getDemandRank(b);
          if (rankDiff !== 0) return rankDiff;
          return getName(a).localeCompare(getName(b));
        }
        return 0;
      });
  }, [candidateDestinations, selectedCategory, sortBy, wheelchairOnly, selectedDemands, getName]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('rating');
    setWheelchairOnly(false);
    setSelectedDemands([]);
  };

  return (
    <div id="explore" className="bg-salt py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="border-b border-stone/30 pb-6">
          <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
            {language === 'hi' ? 'इंटरएक्टिव हेरिटेज खोज और खोज' : 'Interactive Heritage Search & Discovery'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-charcoal tracking-tight font-bold">
            {t('explore.title', 'Explore Heritage Monuments')}
          </h1>
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
                placeholder={t('explore.searchPlaceholder', 'Search destinations or districts...')}
                className="w-full bg-transparent font-display text-xl sm:text-2xl text-charcoal placeholder:text-stone/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-stone hover:text-madder uppercase px-2 py-1 cursor-pointer shrink-0 rounded-md"
                >
                  {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                </button>
              )}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={isListening ? 'Stop voice search' : 'Search by voice'}
                  title={
                    isListening
                      ? 'Listening... click to stop'
                      : language === 'hi'
                      ? 'आवाज़ से खोजें'
                      : 'Search by voice'
                  }
                  className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-gold/20 text-gold ring-2 ring-gold animate-pulse motion-reduce:animate-none motion-reduce:bg-gold motion-reduce:text-ink'
                      : 'text-stone hover:text-gold hover:bg-stone/10'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Screen Reader Aria-Live Announcement Region */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {ariaAnnouncement}
            </div>
            <span className="text-[11px] font-mono text-stone/80 mt-1 block">
              {language === 'hi'
                ? 'सक्रिय भाषा के अनुसार स्थान, जिला और श्रेणी द्वारा त्वरित खोज।'
                : 'Instant prefix match across site names, districts (Narmada, Gandhinagar, Mehsana...), and architecture tags.'}
            </span>
          </div>

          {/* 2. Full-width Category Chips Scrollable Container */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-none pt-2">
            <div className="inline-flex items-center gap-2 pr-6">
              {OFFICIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-mono transition-all duration-150 border cursor-pointer rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-madder text-salt border-madder font-semibold shadow-sm'
                        : 'bg-transparent text-ink border-stone/50 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Filter Options & Sort Control Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone/20 text-xs font-mono">
            {/* Left: Accessibility & Physical Demand Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setWheelchairOnly(!wheelchairOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer font-semibold rounded-lg ${
                wheelchairOnly
                  ? 'bg-emerald-800 text-salt border-emerald-900 shadow-xs'
                  : 'bg-salt text-emerald-950 border-emerald-400 hover:bg-emerald-100'
              }`}
            >
              <Accessibility className={`w-4 h-4 ${wheelchairOnly ? 'text-emerald-300' : 'text-emerald-700'}`} />
              <span>Wheelchair Accessible</span>
              {wheelchairOnly && <span className="text-[10px] bg-emerald-950 text-salt px-1 rounded">ACTIVE</span>}
            </button>

            <span className="text-stone/40 hidden sm:inline">|</span>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-stone font-semibold uppercase text-[10px]">Demand:</span>
              {(['low', 'moderate', 'high'] as const).map((level) => {
                const isSelected = selectedDemands.includes(level);
                const badgeStyle =
                  level === 'low'
                    ? isSelected ? 'bg-emerald-800 text-salt border-emerald-900' : 'bg-salt text-emerald-900 border-stone/30 hover:border-emerald-500'
                    : level === 'moderate'
                    ? isSelected ? 'bg-amber-800 text-salt border-amber-900' : 'bg-salt text-amber-900 border-stone/30 hover:border-amber-500'
                    : isSelected ? 'bg-madder text-salt border-red-900' : 'bg-salt text-madder border-stone/30 hover:border-red-500';

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleDemandFilter(level)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 border text-[10px] uppercase transition-all cursor-pointer font-bold rounded-md ${badgeStyle}`}
                  >
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>

              {(wheelchairOnly || selectedDemands.length > 0) && (
                <button
                  type="button"
                  onClick={() => { setWheelchairOnly(false); setSelectedDemands([]); }}
                  className="text-stone hover:text-madder text-[10px] underline uppercase font-semibold cursor-pointer rounded-md ml-2"
                >
                  Clear Accessibility
                </button>
              )}
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto pt-2 sm:pt-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone" />
              <label htmlFor="sort-dropdown" className="font-mono text-xs text-stone uppercase tracking-wider">
                {language === 'hi' ? 'क्रम:' : 'Sort by:'}
              </label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="font-mono text-xs text-charcoal bg-transparent border-b border-stone/50 py-1 font-semibold focus:outline-none focus:border-gold cursor-pointer rounded-md"
              >
                <option value="rating">
                  {language === 'hi' ? 'रेटिंग (उच्चतम पहले)' : 'Rating (Highest First)'}
                </option>
                <option value="fee">
                  {language === 'hi' ? 'प्रवेश शुल्क (कम से अधिक)' : 'Entry Fee (Lowest First)'}
                </option>
                <option value="alphabetical">
                  {language === 'hi' ? 'वर्णमाला के अनुसार (A – Z)' : 'Alphabetical (A – Z)'}
                </option>
                <option value="distance">
                  {language === 'hi' ? 'अहमदाबाद से दूरी' : 'Distance from Ahmedabad'}
                </option>
                <option value="demand">
                  {language === 'hi' ? 'शारीरिक माँग (मध्यम > उच्च > निम्न)' : 'Physical Demand (Moderate → High → Low)'}
                </option>
              </select>
            </div>
          </div>

        </div>

        {/* RESULTS METRICS & COUNT */}
        <div className="flex items-center justify-between text-xs font-mono text-stone border-b border-stone/20 pb-2">
          <span>
            {language === 'hi' ? 'दर्शाया जा रहा है' : 'Showing'} <strong className="text-charcoal">{filteredDestinations.length}</strong> {language === 'hi' ? 'में से' : 'of'}{' '}
            <strong className="text-charcoal">{GUJARAT_DESTINATIONS.length}</strong> {language === 'hi' ? 'विरासत स्थल' : 'heritage destinations'}
          </span>
          {(searchQuery || selectedCategory !== 'All Categories') && (
            <button
              onClick={handleResetFilters}
              className="text-madder hover:underline flex items-center gap-1 font-semibold cursor-pointer rounded-md"
            >
              <RefreshCw className="w-3 h-3" />
              {t('explore.resetFilters', 'Reset Filters')}
            </button>
          )}
        </div>

        {/* MAIN GRID or EMPTY STATE */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pt-4">
            {filteredDestinations.map((dest, idx) => {
              const terraceShift = idx % 3 === 1 ? 'lg:translate-y-4' : idx % 3 === 2 ? 'lg:translate-y-8' : '';

              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: (idx % 3) * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`group bg-ink text-salt border border-stone/40 hover:border-gold transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm rounded-xl ${terraceShift}`}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-charcoal rounded-t-xl">
                    <ImageWithFallback
                      src={dest.imageUrl}
                      alt={dest.imageAlt || dest.name}
                      category={dest.officialCategory || dest.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl"
                    />
                    
                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 left-3 bg-ink/90 backdrop-blur-sm border border-stone/40 px-2.5 py-1 text-[11px] font-mono text-salt uppercase tracking-wider rounded-md">
                      {getCategoryLabel(dest.officialCategory)}
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute bottom-3 right-3 bg-salt text-ink font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {dest.distanceFromAhmedabad} {language === 'hi' ? 'अहमदाबाद से' : 'from AHD'}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-stone">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{dest.district} {language === 'hi' ? 'ज़िला' : 'District'}</span>
                        </span>
                        <span className="text-gold font-semibold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          {dest.rating}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-salt group-hover:text-gold transition-colors leading-tight">
                        {getName(dest)}
                      </h3>

                      <p className="text-xs font-body text-stone/90 line-clamp-2 pt-1 leading-relaxed">
                        {dest.description}
                      </p>

                      {/* Accessibility Summary Badges */}
                      {dest.attractions && dest.attractions.length > 0 && (
                        <div className="pt-2">
                          <AccessibilityBadge
                            wheelchairAccessible={dest.attractions.some(a => a.wheelchairAccessible)}
                            physicalDemand={dest.attractions[0]?.physicalDemand}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="space-y-2 pt-3 border-t border-stone/30">
                      
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gold font-medium">
                            <Clock className="w-3 h-3 text-gold shrink-0" />
                            {language === 'hi' ? 'उत्तम समय:' : 'Best Time:'}
                          </span>
                          <span className="text-salt font-semibold">{dest.bestTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone">
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3 h-3 text-gold shrink-0" />
                            {language === 'hi' ? 'टिकट:' : 'Ticket:'}
                          </span>
                          <span>{dest.entryFee}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onSelectDestination(dest)}
                          className="flex-1 bg-stone/20 hover:bg-gold hover:text-ink text-salt text-xs font-mono py-2 px-3 border border-stone/40 hover:border-gold transition-colors duration-150 text-center font-semibold cursor-pointer rounded-lg"
                        >
                          {t('explore.inspectSite', 'Inspect Site')}
                        </button>
                        <button
                          onClick={() => onStartTripWithDestination(dest)}
                          className="bg-gold hover:bg-gold/90 text-ink text-xs font-mono py-2 px-3 flex items-center gap-1 font-bold transition-colors duration-150 cursor-pointer rounded-lg"
                          title="Add to Itinerary Planner"
                        >
                          <span>{t('explore.plan', 'Plan')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE WITH STEPPED CHEVRON WATERMARK PATTERN */
          <div className="bg-ink text-salt p-12 lg:p-16 border border-stone/40 text-center space-y-6 my-8 relative overflow-hidden rounded-2xl">
            
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
                {t('explore.emptyTitle', 'No Heritage Destinations Found')}
              </h3>

              <p className="text-sm font-mono text-stone leading-relaxed">
                {t('explore.emptyText', 'No monuments match your current search terms or category selection.')}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-madder text-salt font-mono text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-madder/90 transition-colors border border-madder font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('explore.resetFilters', 'Reset Filters')}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
