export interface Attraction {
  bestTimeNote?: string;
  wheelchairAccessible: boolean;
  physicalDemand: "low" | "moderate" | "high";
  id: string;
  name: string;
  lat: number;
  lng: number;
  durationHours: number;
  rating: number;
  category: string;
  entryFee: string;
  entryFeeNumeric: number;
  imageUrl?: string;
  imageAlt?: string;
  description?: string;
  gujaratiName?: string;
  hindiName?: string;
  gujaratiDescription?: string;
  hindiDescription?: string;
  transportMode?: "road" | "boat" | "other";
}

export interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pricePerNight: string;
  priceNumeric: number;
  rating: string;
  ratingNumeric: number;
  tier: "Budget" | "Mid-range" | "Luxury";
  stayType: "Toran Hotel" | "Heritage Hotel" | "Registered Hotel" | "Homestay";
  location: string;
  description: string;
  valueScore: number;
  imageUrl: string;
  gujaratiName?: string;
  hindiName?: string;
  gujaratiDescription?: string;
  hindiDescription?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  avgCostPerPerson: number;
  location: string;
  cuisine?: string;
  gujaratiName?: string;
  hindiName?: string;
  gujaratiDescription?: string;
  hindiDescription?: string;
}

export interface NearbyAttraction {
  id: string;
  name: string;
  category: string;
  distance: string;
  imageUrl: string;
  gujaratiName?: string;
  hindiName?: string;
}

export type HotelOption = Hotel;

export interface SeasonalAdvisory {
  note: string;
  gujaratiNote?: string;
  hindiNote?: string;
  activeMonths: number[]; // 1-indexed (1 = Jan, ..., 12 = Dec)
  peakWindowLabel?: string;
}

export interface Destination {
  seasonalAdvisory?: SeasonalAdvisory;
  nearestHospital?: string;
  nearestPoliceStation?: string;
  id: string;
  name: string;
  district: string;
  location: string;
  category: string;
  officialCategory:
    | "Heritage Sites"
    | "Religious Sites"
    | "UNESCO World Heritage Site"
    | "Beaches"
    | "Bird Watching Sites"
    | "Museums"
    | "Weekend Get-aways";
  tag: string;
  rating: string;
  ratingValue: number;
  entryFee: string;
  entryFeeNumeric: number;
  bestTime: string;
  distanceFromAhmedabad: string;
  distanceNumeric: number;
  duration: string;
  avgVisitTime: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  highlights: string[];
  gujaratiName?: string;
  hindiName?: string;
  gujaratiDescription?: string;
  hindiDescription?: string;
  attractions: Attraction[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  nearbyAttractions: NearbyAttraction[];
  nearbyHotels: HotelOption[];
}

export const OFFICIAL_CATEGORIES = [
  "All Categories",
  "Heritage Sites",
  "Religious Sites",
  "UNESCO World Heritage Site",
  "Beaches",
  "Bird Watching Sites",
  "Museums",
  "Weekend Get-aways",
] as const;

