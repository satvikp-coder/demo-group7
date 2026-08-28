import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Destination,
  GUJARAT_DESTINATIONS,
  OFFICIAL_CATEGORIES,
} from "../data/destinations";
import { Trie } from "@dsa/trie/Trie";
import { mergeSort } from "@dsa/sorting/mergeSort";
import {
  Search,
  Star,
  MapPin,
  Compass,
  ArrowUpDown,
  Clock,
  Ticket,
  Calendar,
  RefreshCw,
  ChevronRight,
  Accessibility,
  Mic,
} from "lucide-react";
import { SVG_COLORS } from "../data/colors";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { AccessibilityBadge } from "./AccessibilityBadge";

interface ExploreViewProps {
  onSelectDestination: (dest: Destination) => void;
  onStartTripWithDestination: (dest: Destination) => void;
}

type SortOption = "rating" | "fee" | "alphabetical" | "distance" | "demand";

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectDestination,
  onStartTripWithDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [selectedDemands, setSelectedDemands] = useState<
    ("low" | "moderate" | "high")[]
  >([]);
  const { language, t, getName } = useLanguage();

  // Voice Search / Web Speech API State
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        setIsSpeechSupported(true);
      }
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
      setAriaAnnouncement("Voice listening stopped.");
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map language code to Web Speech API lang
      if (language === "gu") {
        recognition.lang = "gu-IN";
      } else if (language === "hi") {
        recognition.lang = "hi-IN";
      } else {
        recognition.lang = "en-IN";
      }

      recognition.onstart = () => {
        setIsListening(true);
        setAriaAnnouncement("Listening...");
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
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setAriaAnnouncement(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const toggleDemandFilter = (level: "low" | "moderate" | "high") => {
    setSelectedDemands((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level],
    );
  };

  // Map category to localized string key
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "All Categories":
        return t("cat.all", "All Categories");
      case "Heritage Sites":
        return t("cat.heritage", "Heritage Sites");
      case "UNESCO World Heritage Site":
        return t("cat.unesco", "UNESCO World Heritage Site");
      case "Religious Sites":
        return t("cat.religious", "Religious Sites");
      case "Beaches":
        return t("cat.beaches", "Beaches");
      case "Bird Watching Sites":
        return t("cat.birds", "Bird Watching Sites");
      case "Museums":
        return t("cat.museums", "Museums");
      case "Weekend Get-aways":
        return t("cat.weekend", "Weekend Get-aways");
      default:
        return cat;
    }
  };

  // Initialize and populate Trie index of destinations
  const searchTrie = useMemo(() => {
    const trie = new Trie();
    for (const dest of GUJARAT_DESTINATIONS) {
      const id = dest.id;
      trie.insert(dest.name, id);
      trie.insert(getName(dest), id);
      if (dest.gujaratiName) trie.insert(dest.gujaratiName, id);
      if (dest.hindiName) trie.insert(dest.hindiName, id);
      trie.insert(dest.district, id);
      trie.insert(dest.location, id);
      trie.insert(dest.category, id);
      trie.insert(dest.officialCategory, id);
      for (const a of dest.attractions) {
        trie.insert(a.name, id);
        if (a.gujaratiName) trie.insert(a.gujaratiName, id);
        if (a.hindiName) trie.insert(a.hindiName, id);
      }
    }
    return trie;
  }, [getName]);

  // Priority ranking for Physical Demand: 1. MODERATE (rank 0), 2. HIGH (rank 1), 3. LOW (rank 2)
  const getDemandPriority = (dest: Destination): number => {
    const demands = dest.attractions.map((a) => a.physicalDemand);
    if (demands.includes("moderate")) return 0;
    if (demands.includes("high")) return 1;
    return 2;
  };

  // Filter & Sort Logic
  const filteredDestinations = useMemo(() => {
    let candidates = GUJARAT_DESTINATIONS;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchingIds = searchTrie.searchPrefix(q);
      
      candidates = candidates.filter((dest) => {
        // Specific disambiguation for short keywords like "gir" (matches Gir National Park / Somnath, excludes Saputara)
        if (q === "gir") {
          return (
            dest.id === "gir" ||
            dest.name.toLowerCase().includes("gir national") ||
            dest.district.toLowerCase().includes("gir")
          );
        }

        if (matchingIds.includes(dest.id)) return true;

        const nameEn = dest.name.toLowerCase();
        const nameGu = (dest.gujaratiName || "").toLowerCase();
        const nameHi = (dest.hindiName || "").toLowerCase();
        const district = dest.district.toLowerCase();
        const location = dest.location.toLowerCase();

        return (
          nameEn.includes(q) ||
          nameGu.includes(q) ||
          nameHi.includes(q) ||
          district.includes(q) ||
          location.includes(q)
        );
      });
    }

    const filtered = candidates.filter((dest) => {
      // Category match
      if (
        selectedCategory !== "All Categories" &&
        dest.officialCategory !== selectedCategory
      ) {
        return false;
      }

      // Wheelchair accessibility match
      if (wheelchairOnly) {
        const hasWheelchair = dest.attractions.some(
          (a) => a.wheelchairAccessible === true,
        );
        if (!hasWheelchair) return false;
      }

      // Physical demand match
      if (selectedDemands.length > 0) {
        const hasMatchingDemand = dest.attractions.some((a) =>
          selectedDemands.includes(a.physicalDemand),
        );
        if (!hasMatchingDemand) return false;
      }

      return true;
    });

    return mergeSort(filtered, (a, b) => {
      if (sortBy === "demand") {
        const rankA = getDemandPriority(a);
        const rankB = getDemandPriority(b);
        if (rankA !== rankB) {
          return rankA - rankB; // 0 (Moderate) comes before 1 (High) and 2 (Low)
        }
        return b.ratingValue - a.ratingValue;
      } else if (sortBy === "rating") {
        return b.ratingValue - a.ratingValue;
      } else if (sortBy === "fee") {
        return a.entryFeeNumeric - b.entryFeeNumeric;
      } else if (sortBy === "alphabetical") {
        return getName(a).localeCompare(getName(b));
      } else if (sortBy === "distance") {
        return a.distanceNumeric - b.distanceNumeric;
      }
      return 0;
    });
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    wheelchairOnly,
    selectedDemands,
    language,
    getName,
    searchTrie,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSortBy("rating");
    setWheelchairOnly(false);
    setSelectedDemands([]);
  };

  return (
    <div
      id="explore"
      className="bg-salt py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone/30"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone/30 pb-6 gap-4">
          <div>
            <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
              {language === "gu"
                ? "ઇન્ટરેક્ટિવ હેરિટેજ શોધ અને ડિસ્કવરી"
                : language === "hi"
                  ? "इंटरएक्टिव हेरिटेज खोज और खोज"
                  : "Interactive Heritage Search & Discovery"}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-charcoal tracking-tight font-bold">
              {t("explore.title", "Explore Heritage Monuments")}
            </h1>
          </div>
          <p className="text-xs text-stone font-mono max-w-sm">
            {language === "gu"
              ? "સોમનાથ, દ્વારકા, મોઢેરા, કચ્છ અને ગીર સહિત ગુજરાતના ૧૦ પ્રમુખ વારસા સ્થળો શોધો."
              : language === "hi"
                ? "सोमनाथ, द्वारका, मोढेरा, कच्छ और गिर सहित गुजरात के 10 प्रमुख विरासत स्थलों की खोज करें।"
                : "Search 10 premier Solanki stepwells, Harappan salt deserts, Jyotirlinga shrines & UNESCO sanctuaries across Gujarat."}
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
                placeholder={t(
                  "explore.searchPlaceholder",
                  "Search destinations or districts...",
                )}
                className="w-full bg-transparent font-display text-xl sm:text-2xl text-charcoal placeholder:text-stone/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-mono text-stone hover:text-madder uppercase px-2 py-1 cursor-pointer shrink-0"
                >
                  {language === "gu"
                    ? "સાફ કરો"
                    : language === "hi"
                      ? "साफ़ करें"
                      : "Clear"}
                </button>
              )}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={
                    isListening ? "Stop voice search" : "Search by voice"
                  }
                  title={
                    isListening
                      ? "Listening... click to stop"
                      : language === "gu"
                        ? "અવાજ દ્વારા શોધો"
                        : language === "hi"
                          ? "આવાઝ સે ખોજેં"
                          : "Search by voice"
                  }
                  className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? "bg-gold/20 text-gold ring-2 ring-gold animate-pulse motion-reduce:animate-none motion-reduce:bg-gold motion-reduce:text-ink"
                      : "text-stone hover:text-gold hover:bg-stone/10"
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
              {language === "gu"
                ? "સક્રિય ભાષા અનુસાર સ્થળ, જિલ્લો અને શ્રેણી દ્વારા ત્વરિત શોધ."
                : language === "hi"
                  ? "सक्रिय भाषा के अनुसार स्थान, जिला और श्रेणी द्वारा त्वरित खोज।"
                  : "Instant prefix match across site names, districts (Narmada, Gandhinagar, Mehsana...), and architecture tags."}
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
                    className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-mono transition-all duration-150 border cursor-pointer ${
                      isSelected
                        ? "bg-madder text-salt border-madder font-semibold shadow-sm"
                        : "bg-transparent text-ink border-stone/50 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
            </div>

            {/* Right-aligned Sort Dropdown */}
            <div className="flex items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 border-stone/20 pt-3 lg:pt-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone" />
              <label
                htmlFor="sort-dropdown"
                className="font-mono text-xs text-stone uppercase tracking-wider"
              >
                {language === "gu"
                  ? "ક્રમ:"
                  : language === "hi"
                    ? "क्रम:"
                    : "Sort by:"}
              </label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="font-mono text-xs text-charcoal bg-transparent border-b border-stone/50 py-1 font-semibold focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="demand">
                  {language === "gu"
                    ? "શારીરિક ક્ષમતા (મધ્યમ પ્રથમ)"
                    : language === "hi"
                      ? "शारीरिक मांग (मध्यम पहले)"
                      : "Physical Demand (Moderate First)"}
                </option>
                <option value="rating">
                  {language === "gu"
                    ? "રેટિંગ (સૌથી વધુ સંચાલિત)"
                    : language === "hi"
                      ? "रेटिंग (उच्चतम पहले)"
                      : "Rating (Highest First)"}
                </option>
                <option value="fee">
                  {language === "gu"
                    ? "પ્રવેશ ફી (ઓછી ફી)"
                    : language === "hi"
                      ? "प्रवेश शुल्क (कम से अधिक)"
                      : "Entry Fee (Lowest First)"}
                </option>
                <option value="alphabetical">
                  {language === "gu"
                    ? "કક્કાવારી મુજબ (A – Z)"
                    : language === "hi"
                      ? "वर्णमाला के अनुसार (A – Z)"
                      : "Alphabetical (A – Z)"}
                </option>
                <option value="distance">
                  {language === "gu"
                    ? "અમદાવાદથી અંતર"
                    : language === "hi"
                      ? "अहमदाबाद से दूरी"
                      : "Distance from Ahmedabad"}
                </option>
              </select>
            </div>
          </div>

          {/* 3. Accessibility Filter Chips Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 border-t border-stone/20 text-xs font-mono">
            <button
              type="button"
              onClick={() => setWheelchairOnly(!wheelchairOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer font-semibold ${
                wheelchairOnly
                  ? "bg-emerald-800 text-salt border-emerald-900 shadow-xs"
                  : "bg-salt text-emerald-950 border-emerald-400 hover:bg-emerald-100"
              }`}
            >
              <Accessibility
                className={`w-4 h-4 ${wheelchairOnly ? "text-emerald-300" : "text-emerald-700"}`}
              />
              <span>Wheelchair Accessible</span>
              {wheelchairOnly && (
                <span className="text-[10px] bg-emerald-950 text-salt px-1">
                  ACTIVE
                </span>
              )}
            </button>

            <span className="text-stone/40 hidden sm:inline">|</span>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-stone font-semibold uppercase text-[10px]">
                Demand:
              </span>
              {(["low", "moderate", "high"] as const).map((level) => {
                const isSelected = selectedDemands.includes(level);
                const badgeStyle =
                  level === "low"
                    ? isSelected
                      ? "bg-emerald-800 text-salt border-emerald-900"
                      : "bg-salt text-emerald-900 border-stone/30 hover:border-emerald-500"
                    : level === "moderate"
                      ? isSelected
                        ? "bg-amber-800 text-salt border-amber-900"
                        : "bg-salt text-amber-900 border-stone/30 hover:border-amber-500"
                      : isSelected
                        ? "bg-madder text-salt border-red-900"
                        : "bg-salt text-madder border-stone/30 hover:border-red-500";

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleDemandFilter(level)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 border text-[10px] uppercase transition-all cursor-pointer font-bold ${badgeStyle}`}
                  >
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>

            {(wheelchairOnly || selectedDemands.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setWheelchairOnly(false);
                  setSelectedDemands([]);
                }}
                className="text-stone hover:text-madder text-[10px] underline ml-auto uppercase font-semibold cursor-pointer"
              >
                Clear Accessibility
              </button>
            )}
          </div>
        </div>

        {/* RESULTS METRICS & COUNT */}
        <div className="flex items-center justify-between text-xs font-mono text-stone border-b border-stone/20 pb-2">
          <span>
            {language === "gu"
              ? "દર્શાવાયેલ"
              : language === "hi"
                ? "दर्शाया जा रहा है"
                : "Showing"}{" "}
            <strong className="text-charcoal">
              {filteredDestinations.length}
            </strong>{" "}
            {language === "gu" ? "માંથી" : language === "hi" ? "में से" : "of"}{" "}
            <strong className="text-charcoal">
              {GUJARAT_DESTINATIONS.length}
            </strong>{" "}
            {language === "gu"
              ? "વારસાગત સ્થળો"
              : language === "hi"
                ? "विरासत स्थल"
                : "heritage destinations"}
          </span>
          {(searchQuery || selectedCategory !== "All Categories" || wheelchairOnly || selectedDemands.length > 0) && (
            <button
              onClick={handleResetFilters}
              className="text-madder hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              {t("explore.resetFilters", "Reset Filters")}
            </button>
          )}
        </div>

        {/* MAIN GRID or EMPTY STATE */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 pt-4">
            {filteredDestinations.map((dest, idx) => {
              const terraceShift =
                idx % 3 === 1
                  ? "lg:translate-y-4"
                  : idx % 3 === 2
                    ? "lg:translate-y-8"
                    : "";

              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: (idx % 3) * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${getName(dest)}`}
                  onClick={() => onSelectDestination(dest)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDestination(dest);
                    }
                  }}
                  className={`group bg-ink text-salt border border-stone/40 hover:border-gold transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm cursor-pointer ${terraceShift}`}
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
                      {getCategoryLabel(dest.officialCategory)}
                    </div>

                    {/* Best Time Overlay Badge */}
                    <div className="absolute top-3 right-3 bg-ink/90 backdrop-blur-sm border border-gold/50 px-2.5 py-1 text-[11px] font-mono text-gold flex items-center gap-1.5 shadow-sm">
                      <Calendar className="w-3 h-3 text-gold shrink-0" />
                      <span className="font-semibold">{dest.bestTime}</span>
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute bottom-3 right-3 bg-salt text-ink font-mono text-[11px] font-bold px-2 py-0.5">
                      {dest.distanceFromAhmedabad}{" "}
                      {language === "gu"
                        ? "અમદાવાદથી"
                        : language === "hi"
                          ? "अहमदाबाद से"
                          : "from AHD"}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-stone">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>
                            {dest.district}{" "}
                            {language === "gu"
                              ? "જિલ્લો"
                              : language === "hi"
                                ? "ज़िला"
                                : "District"}
                          </span>
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
                            wheelchairAccessible={dest.attractions.some(
                              (a) => a.wheelchairAccessible,
                            )}
                            physicalDemand={dest.attractions[0]?.physicalDemand}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="space-y-2.5 pt-3 border-t border-stone/30">
                      {/* Best Time to Visit Row */}
                      <div className="flex items-center justify-between text-[11px] font-mono bg-salt/5 border border-stone/30 px-2.5 py-1.5">
                        <span className="flex items-center gap-1.5 text-stone/90">
                          <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>
                            {language === "gu"
                              ? "મુલાકાત માટે શ્રેષ્ઠ સમય:"
                              : language === "hi"
                                ? "यात्रा का सर्वोत्तम समय:"
                                : "Best Time to Visit:"}
                          </span>
                        </span>
                        <span className="text-gold font-bold">{dest.bestTime}</span>
                      </div>

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
                          className="flex-1 bg-stone/20 hover:bg-gold hover:text-ink text-salt text-xs font-mono py-2 px-3 border border-stone/40 hover:border-gold transition-colors duration-150 text-center font-semibold cursor-pointer"
                        >
                          {t("explore.inspectSite", "Inspect Site")}
                        </button>
                        <button
                          onClick={() => onStartTripWithDestination(dest)}
                          className="bg-gold hover:bg-gold/90 text-ink text-xs font-mono py-2 px-3 flex items-center gap-1 font-bold transition-colors duration-150 cursor-pointer"
                          title="Add to Itinerary Planner"
                        >
                          <span>{t("explore.plan", "Plan")}</span>
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
          <div className="bg-ink text-salt p-12 lg:p-16 border border-stone/40 text-center space-y-6 my-8 relative overflow-hidden">
            {/* Stepped Chevron Watermark Motif Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg
                width="400"
                height="200"
                viewBox="0 0 400 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 20L100 100L180 20M100 100L180 180M100 100L20 180"
                  stroke={SVG_COLORS.gold}
                  strokeWidth="8"
                />
                <path
                  d="M220 20L300 100L380 20M300 100L380 180M300 100L220 180"
                  stroke={SVG_COLORS.gold}
                  strokeWidth="8"
                />
                <rect
                  x="180"
                  y="80"
                  width="40"
                  height="40"
                  fill={SVG_COLORS.gold}
                />
              </svg>
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-salt/10 border border-gold/40 text-gold mb-2">
                <Compass className="w-8 h-8" />
              </div>

              <h3 className="font-display text-2xl font-bold text-salt">
                {t("explore.emptyTitle", "No Heritage Destinations Found")}
              </h3>

              <p className="text-sm font-mono text-stone leading-relaxed">
                {t(
                  "explore.emptyText",
                  "No monuments match your current search terms or category selection.",
                )}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-madder text-salt font-mono text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-madder/90 transition-colors border border-madder font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t("explore.resetFilters", "Reset Filters")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
