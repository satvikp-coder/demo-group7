import React, { useState, useRef } from 'react';
import { Destination, GUJARAT_DESTINATIONS, getCityById, Attraction, Hotel, Restaurant } from '../data/destinations';
import { DijkstraVisualizer } from './DijkstraVisualizer';
import { SVG_COLORS } from '../data/colors';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Printer,
  DollarSign,
  Hotel as HotelIcon,
  Ticket,
  Utensils,
  Compass,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Cpu,
  Download,
  Loader2,
  Check,
  RotateCcw
} from 'lucide-react';

export interface ItineraryConfig {
  cityId: string;
  tripDays: number;
  budget: number;
  startingHotelId?: string;
  startTime?: string;
  selectedSites?: string[]; // Backwards compatibility fallback
}

interface ItineraryViewProps {
  config: ItineraryConfig;
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onBackToPlanner: () => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenBudgetPlanner?: () => void;
}

interface ItineraryStop {
  id: string;
  type: 'hotel' | 'attraction' | 'meal';
  name: string;
  category: string;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
  cost: number;
  location: string;
  imageUrl?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

interface DayRoute {
  dayNumber: number;
  dateLabel: string;
  title: string;
  stops: ItineraryStop[];
  totalKm: number;
  totalCost: number;
}

// Helper: Format minutes from midnight into 12-hour AM/PM string
function formatTime(minutesFromMidnight: number): string {
  const mins = Math.floor(minutesFromMidnight) % (24 * 60);
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = m < 10 ? `0${m}` : m;
  return `${displayHours}:${displayMins} ${ampm}`;
}

// Helper: Parse "08:00 AM" or "8:00 AM" into minutes from midnight
function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 8 * 60; // Default 8:00 AM
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 8 * 60;
  const [hStr, mStr] = parts[0].split(':');
  let hours = parseInt(hStr, 10) || 8;
  const mins = parseInt(mStr, 10) || 0;
  const ampm = parts[1].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  config,
  preferredHotels,
  onSelectPreferredHotel,
  onBackToPlanner,
  onSelectDestination,
  onOpenBudgetPlanner,
}) => {
  // Resolve city
  const activeCity = getCityById(config.cityId) || GUJARAT_DESTINATIONS[0];

  // Resolve starting hotel using config startingHotelId or preferredHotels fallback
  const preferredHotelId = preferredHotels?.[config.cityId];
  const startingHotel: Hotel =
    activeCity.hotels.find(h => h.id === config.startingHotelId) ||
    (preferredHotelId ? activeCity.hotels.find(h => h.id === preferredHotelId) : undefined) ||
    activeCity.hotels[0];

  const isPreferredBase = preferredHotelId === startingHotel.id;

  // Title
  const [tripTitle, setTripTitle] = useState<string>(`${activeCity.name} Circular Heritage Circuit`);

  // State toggles
  const [showAlgorithm, setShowAlgorithm] = useState<boolean>(false);
  const [savedShareNotice, setSavedShareNotice] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState<boolean>(true);

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Download PDF generator (dynamically imported)
  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const [jspdfModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const jsPDF = jspdfModule.default;
      const html2canvas = html2canvasModule.default;

      const element = pdfContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F6F4EF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const sanitizeName = tripTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      pdf.save(`${sanitizeName}-itinerary.pdf`);
    } catch (err) {
      console.error('Error generating itinerary PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Build Day-by-Day Circular Itinerary Loops
  const numDays = Math.max(1, config.tripDays || 2);
  const startMinsBase = parseTimeToMinutes(config.startTime);

  const attractions = activeCity.attractions || [];
  const restaurants = activeCity.restaurants || [];

  const dayPlans: DayRoute[] = [];

  const datesList = ['DAY 1', 'DAY 2', 'DAY 3', 'DAY 4', 'DAY 5', 'DAY 6', 'DAY 7'];

  // Distribute city attractions evenly across days
  const attractionsPerDay = Math.ceil(attractions.length / numDays);

  for (let i = 0; i < numDays; i++) {
    const dayAttractions = attractions.slice(i * attractionsPerDay, (i + 1) * attractionsPerDay);
    const actualAttractions = dayAttractions.length > 0 ? dayAttractions : [attractions[i % attractions.length]];

    const stops: ItineraryStop[] = [];
    let currentClock = startMinsBase;
    let dayTotalKm = 0;
    let dayTotalCost = 0;

    // 1. Depart Hotel
    const hotelDepartMins = currentClock;
    stops.push({
      id: `${startingHotel.id}-start-day-${i + 1}`,
      type: 'hotel',
      name: `Depart ${startingHotel.name}`,
      category: 'Starting Accommodation',
      arrivalTime: formatTime(hotelDepartMins),
      departureTime: formatTime(hotelDepartMins + 15),
      durationMinutes: 15,
      cost: startingHotel.priceNumeric / numDays,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Morning departure from starting hotel.`,
      lat: startingHotel.lat,
      lng: startingHotel.lng
    });

    currentClock += 15; // 15 mins travel to first attraction
    dayTotalKm += 2.5;

    // 2. Attractions & Automatic Meals
    let lunchInserted = false;

    actualAttractions.forEach((attr, idx) => {
      // Check if time for Lunch (12:00 PM - 2:00 PM, 720 - 840 mins)
      if (!lunchInserted && currentClock >= 720 && restaurants.length > 0) {
        const resto = restaurants[idx % restaurants.length];
        const lunchStart = currentClock;
        const lunchEnd = lunchStart + 60; // 1 hour meal break
        stops.push({
          id: `lunch-stop-day-${i + 1}`,
          type: 'meal',
          name: `Lunch Break at ${resto.name}`,
          category: 'Culinary Stop',
          arrivalTime: formatTime(lunchStart),
          departureTime: formatTime(lunchEnd),
          durationMinutes: 60,
          cost: resto.avgCostPerPerson,
          location: resto.location,
          description: `Authentic ${resto.cuisine || 'Gujarati meal'} stop.`,
          lat: resto.lat,
          lng: resto.lng
        });
        currentClock = lunchEnd + 15; // 15 min travel back to attraction
        dayTotalKm += 1.5;
        dayTotalCost += resto.avgCostPerPerson;
        lunchInserted = true;
      }

      // Attraction Visit
      const attrStart = currentClock;
      const durationMins = Math.round((attr.durationHours || 1.5) * 60);
      const attrEnd = attrStart + durationMins;

      stops.push({
        id: `${attr.id}-day-${i + 1}`,
        type: 'attraction',
        name: attr.name,
        category: attr.category,
        arrivalTime: formatTime(attrStart),
        departureTime: formatTime(attrEnd),
        durationMinutes: durationMins,
        cost: attr.entryFeeNumeric || 0,
        location: activeCity.name,
        imageUrl: attr.imageUrl,
        description: attr.description,
        lat: attr.lat,
        lng: attr.lng
      });

      currentClock = attrEnd + 15; // 15 mins travel to next stop
      dayTotalKm += 3.2;
      dayTotalCost += (attr.entryFeeNumeric || 0);
    });

    // Dinner break if late
    if (currentClock >= 1140 && restaurants.length > 0) {
      const resto = restaurants[restaurants.length - 1];
      const dinnerStart = currentClock;
      const dinnerEnd = dinnerStart + 60;
      stops.push({
        id: `dinner-stop-day-${i + 1}`,
        type: 'meal',
        name: `Dinner Stop at ${resto.name}`,
        category: 'Evening Dining',
        arrivalTime: formatTime(dinnerStart),
        departureTime: formatTime(dinnerEnd),
        durationMinutes: 60,
        cost: resto.avgCostPerPerson,
        location: resto.location,
        description: `Evening thali & local dinner stop.`,
        lat: resto.lat,
        lng: resto.lng
      });
      currentClock = dinnerEnd + 15;
      dayTotalKm += 2.0;
      dayTotalCost += resto.avgCostPerPerson;
    }

    // 3. Return to Hotel (Closing Circular Loop)
    const returnStart = currentClock;
    stops.push({
      id: `${startingHotel.id}-return-day-${i + 1}`,
      type: 'hotel',
      name: `Return to ${startingHotel.name}`,
      category: 'Night Stay Loop Complete',
      arrivalTime: formatTime(returnStart),
      departureTime: formatTime(returnStart + 15),
      durationMinutes: 15,
      cost: 0,
      location: startingHotel.location,
      imageUrl: startingHotel.imageUrl,
      description: `Return to starting hotel completing the day's circular route.`,
      lat: startingHotel.lat,
      lng: startingHotel.lng
    });

    dayTotalKm += 2.5;

    dayPlans.push({
      dayNumber: i + 1,
      dateLabel: datesList[i % datesList.length],
      title: `${activeCity.name} Intra-City Day ${i + 1} Circuit`,
      stops,
      totalKm: Math.round(dayTotalKm * 10) / 10,
      totalCost: Math.round(dayTotalCost)
    });
  }

  // Calculate global totals
  const totalDistanceKm = dayPlans.reduce((acc, d) => acc + d.totalKm, 0);
  const totalHotelCost = startingHotel.priceNumeric * numDays;
  const totalAttractionCost = dayPlans.reduce((acc, d) => acc + d.stops.filter(s => s.type === 'attraction').reduce((a, s) => a + s.cost, 0), 0);
  const totalMealCost = dayPlans.reduce((acc, d) => acc + d.stops.filter(s => s.type === 'meal').reduce((a, s) => a + s.cost, 0), 0);
  const totalTransportCost = numDays * 350; // Local rickshaw / taxi estimate
  const estimatedTotalCost = totalHotelCost + totalAttractionCost + totalMealCost + totalTransportCost;

  const handlePrint = () => window.print();
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tripTitle,
        text: `Check out my circular ${numDays}-day itinerary for ${activeCity.name}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSavedShareNotice(true);
      setTimeout(() => setSavedShareNotice(false), 3000);
    }
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Control Bar: Back / Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone/30 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPlanner}
              className="inline-flex items-center gap-2 bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 text-xs font-mono px-4 py-2 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
              <span>Adjust plan</span>
            </button>

            <button
              onClick={() => {
                if (onOpenBudgetPlanner) {
                  onOpenBudgetPlanner();
                }
              }}
              className="inline-flex items-center gap-2 bg-madder hover:bg-madder/90 text-salt border border-madder text-xs font-mono font-bold px-4 py-2 transition-colors shadow-xs cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-salt" />
              <span>View budget breakdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-gold" />
              <span>Share Route</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>Print Ledger</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              aria-label="Download PDF Itinerary"
              className="inline-flex items-center gap-1.5 bg-ink text-salt border border-gold hover:bg-ink/90 text-xs font-mono font-bold px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-gold" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {savedShareNotice && (
          <div className="p-3 bg-emerald-900 text-salt border border-emerald-500 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Itinerary route link copied to clipboard!</span>
          </div>
        )}

        {/* Printable Container */}
        <div ref={pdfContainerRef} className="space-y-8 bg-salt p-2 sm:p-4 border border-stone/20">

          {/* Header Banner */}
          <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-6 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-stepwell-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold">
                <Compass className="w-4 h-4 text-gold" />
                <span>Intra-City Circular Route Plan • {activeCity.name}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                {tripTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone pt-2 border-t border-stone/30">
                <span className="flex items-center gap-1.5 text-salt font-bold">
                  <MapPin className="w-4 h-4 text-gold" />
                  City: {activeCity.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <HotelIcon className="w-4 h-4 text-gold" />
                  <span>Base Hotel: <strong>{startingHotel.name}</strong></span>
                  {isPreferredBase && (
                    <span className="bg-gold text-ink font-bold text-[10px] px-1.5 py-0.5 border border-gold uppercase">
                      ✓ Preferred Stay
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold" />
                  Start Time: {config.startTime || '08:00 AM'}
                </span>
                <span className="flex items-center gap-1.5 text-gold font-bold">
                  <RotateCcw className="w-4 h-4 text-gold" />
                  Circular Route (Hotel → Attractions → Meals → Hotel)
                </span>
              </div>
            </div>
          </div>

          {/* Dijkstra Supporting Algorithm Visualizer Accordion */}
          <div className="border-2 border-gold bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-ink font-bold">
                <Cpu className="w-4 h-4 text-gold" />
                <span>Intra-City Shortest Path Visualizer</span>
              </div>
              <button
                onClick={() => setShowAlgorithm(!showAlgorithm)}
                className="bg-salt hover:bg-stone/20 text-charcoal border border-stone/40 font-mono text-xs font-bold px-3 py-1 flex items-center gap-1 cursor-pointer"
              >
                <span>{showAlgorithm ? 'Hide Visualizer' : 'Expand Visualizer'}</span>
                {showAlgorithm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <p className="font-mono text-xs text-stone italic border-l-2 border-gold pl-2">
              "Dijkstra finds the shortest path between two attractions when they aren't directly connected -- most stops in your route are direct, this shows what happens when one isn't."
            </p>

            {showAlgorithm && (
              <div className="pt-3 border-t border-stone/30 animate-fadeIn">
                <DijkstraVisualizer cityId={activeCity.id} />
              </div>
            )}
          </div>

          {/* Day-by-Day Circular Itinerary Cards */}
          <div className="space-y-8">
            {dayPlans.map((day) => (
              <div key={day.dayNumber} className="bg-white border-2 border-stone/40 p-5 sm:p-6 space-y-6 shadow-sm">
                
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-gold pb-3">
                  <div>
                    <span className="bg-ink text-gold font-mono text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                      {day.dateLabel}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl text-ink font-bold mt-1">
                      {day.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-stone">
                    <span>🚗 {day.totalKm} km local circuit</span>
                    <span className="font-bold text-ink">Est. Day Cost: ₹{day.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Circular Timed Stops List */}
                <div className="space-y-4">
                  {day.stops.map((stop, idx) => {
                    const stopNumber = idx + 1;
                    const isFirstStop = idx === 0;
                    const isFinalStop = idx === day.stops.length - 1;

                    const accessibleLabel = stop.type === 'meal'
                      ? `Stop ${stopNumber} of ${day.stops.length}: Lunch break at ${stop.name}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, duration ${stop.durationMinutes} minutes, estimated cost ₹${stop.cost.toLocaleString('en-IN')}`
                      : stop.type === 'hotel'
                      ? isFinalStop
                        ? `Stop ${stopNumber} of ${day.stops.length} (Final Stop): Return to ${stop.name}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, completing circular route`
                        : `Stop ${stopNumber} of ${day.stops.length} (Start): Depart ${stop.name}, depart at ${stop.departureTime}`
                      : `Stop ${stopNumber} of ${day.stops.length}: ${stop.name}, ${stop.category}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, duration ${stop.durationMinutes} minutes, cost ${stop.cost > 0 ? '₹' + stop.cost.toLocaleString('en-IN') : 'Free'}`;

                    return (
                      <div
                        key={stop.id}
                        tabIndex={0}
                        aria-label={accessibleLabel}
                        className={`p-4 border text-xs font-mono transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-gold ${
                          stop.type === 'meal'
                            ? 'bg-amber-50/70 border-gold/80'
                            : stop.type === 'hotel'
                            ? 'bg-salt border-stone/40'
                            : 'bg-white border-stone/30 hover:border-gold'
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full sm:w-auto">
                          
                          {/* Stop Number Badge */}
                          <div className="bg-gold text-ink font-bold px-2 py-1 text-[11px] border border-ink shrink-0 text-center">
                            <span>#{stopNumber}</span>
                          </div>

                          {/* Timed Badge */}
                          <div className="bg-ink text-salt px-2.5 py-1 text-[11px] font-bold border border-gold shrink-0 text-center">
                            <span className="block text-gold text-[10px] uppercase">Arrival - Depart</span>
                            <span>{stop.arrivalTime} - {stop.departureTime}</span>
                          </div>

                          {/* Stop Icon & Description */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2 font-bold text-sm text-ink">
                              {stop.type === 'meal' ? (
                                <>
                                  <Utensils className="w-4 h-4 text-gold shrink-0" />
                                  <span className="bg-gold/20 text-ink px-1.5 py-0.5 text-[10px] uppercase font-mono border border-gold/40">Meal Break</span>
                                </>
                              ) : stop.type === 'hotel' ? (
                                <HotelIcon className="w-4 h-4 text-ink shrink-0" />
                              ) : (
                                <Ticket className="w-4 h-4 text-madder shrink-0" />
                              )}
                              <span>{stop.name}</span>
                            </div>
                            <p className="text-stone text-[11px] mt-0.5">{stop.description}</p>
                            <span className="text-[10px] text-stone/80 uppercase tracking-wider block mt-1">
                              {stop.category} • {stop.location}
                            </span>
                          </div>
                        </div>

                        {/* Cost & Duration */}
                        <div className="text-right shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-stone/20 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                          <span className="font-bold text-ink text-sm">
                            {stop.cost > 0 ? `₹${stop.cost.toLocaleString('en-IN')}` : 'Free / Included'}
                          </span>
                          <span className="text-[10px] text-stone">
                            Duration: {stop.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day Summary Loop Banner */}
                <div className="p-3 bg-salt border border-stone/30 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-stone">
                  <span className="flex items-center gap-1.5 text-ink font-bold">
                    <span>🔁 Circular Route Loop:</span>
                    <span className="font-normal text-stone">
                      Start at {startingHotel.name} → {day.stops.length - 2} Stops → Return to {startingHotel.name}
                    </span>
                  </span>
                  <span className="font-bold text-ink shrink-0">{day.stops.length} Timed Stops Complete</span>
                </div>

              </div>
            ))}
          </div>

          {/* Overall Budget Summary Card */}
          <div className="bg-ink text-salt p-6 border-2 border-gold space-y-4">
            <h4 className="font-display text-xl text-gold font-bold border-b border-stone/30 pb-2">
              {activeCity.name} Circuit Budget Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">Hotels ({numDays} Nights)</span>
                <span className="font-bold text-salt text-sm">₹{totalHotelCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">Attraction Entry Fees</span>
                <span className="font-bold text-salt text-sm">₹{totalAttractionCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">Meals (Restaurants)</span>
                <span className="font-bold text-gold text-sm">₹{totalMealCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">Local Transport</span>
                <span className="font-bold text-salt text-sm">₹{totalTransportCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone/30 font-mono text-sm">
              <span className="text-stone">Estimated Total Outlay:</span>
              <span className="font-bold text-gold text-lg">₹{estimatedTotalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
