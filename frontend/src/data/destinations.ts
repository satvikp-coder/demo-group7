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

export const GUJARAT_DESTINATIONS: Destination[] = [
  {
    id: "somnath",
    seasonalAdvisory: {
      note: "Kartik Purnima Fair (Nov) and Maha Shivratri (Feb/Mar) bring intense pilgrimage crowds. October to March offers pleasant coastal weather, whereas April to June is extremely humid and hot.",
      activeMonths: [10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Oct – Mar (Festivals: Nov & Feb/Mar)",
    },
    name: "Somnath",
    nearestHospital:
      "Civil Hospital Veraval (Government General Hospital), ~10 min from city center",
    nearestPoliceStation:
      "Prabhas Patan Police Station, ~5 min from Somnath Temple",
    district: "Gir Somnath",
    location: "Prabhas Patan, Gir Somnath",
    category: "Sacred Jyotirlinga & Ocean Coast",
    officialCategory: "Religious Sites",
    tag: "First Among the 12 Sacred Jyotirlingas",
    rating: "4.8 ★",
    ratingValue: 4.8,
    entryFee: "Free Darshan",
    entryFeeNumeric: 0,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "390 km",
    distanceNumeric: 390,
    duration: "1–2 Days",
    avgVisitTime: "2–3 Hours",
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Somnath Temple spire on the shores of the Arabian Sea at sunset",
    description:
      "Located at Prabhas Patan, Somnath is the first among the twelve holy Jyotirlinga shrines of Lord Shiva, overlooking the roaring waves of the Arabian Sea.",
    highlights: [
      "Somnath Temple Light & Sound Show",
      "Triveni Sangam Holy Dip",
      "Bhalka Tirth Sacred Grove",
    ],
    attractions: [
      {
        id: "somnath-temple",
        bestTimeNote:
          "Evening aarti draws large crowds -- visit mid-morning for a quieter experience.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Somnath Temple",
        lat: 20.888,
        lng: 70.4012,
        durationHours: 2,
        rating: 4.6,
        category: "Spiritual/Heritage",
        entryFee: "Free Darshan",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description:
          "Majestic Chalukya-style temple standing at the confluence of myth and ocean horizon.",
        gujaratiName: "સોમનાથ મંદિર",
        hindiName: "सोमनाथ मंदिर",
        gujaratiDescription:
          "પ્રભાત પટણમાં આવેલું સોમનાથ ભગવાન શિવના બાર પવિત્ર જ્યોતિર્લિંગોમાં પ્રથમ છે, જે અરબી સમુદ્રના કિનારે સ્થિત છે.",
        hindiDescription:
          "प्रभास पाटन में स्थित सोमनाथ भगवान शिव के बारह ज्योतिर्लिंगों में से पहला पवित्र स्थल है, जो अरब सागर के तट पर स्थित है।",
      },
      {
        id: "bhalka-tirth",
        bestTimeNote:
          "Best visited during morning hours before afternoon heat increases.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Bhalka Tirth",
        lat: 20.9,
        lng: 70.37,
        durationHours: 1,
        rating: 4.5,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        description:
          "Sacred banyan grove marking where Lord Krishna departed his earthly realm.",
        gujaratiName: "ભાલકા તીર્થ",
        hindiName: "भालका तीर्थ",
        gujaratiDescription:
          "Sacred banyan grove marking where Lord Krishna departed his earthly realm.",
        hindiDescription:
          "Sacred banyan grove marking where Lord Krishna departed his earthly realm.",
      },
      {
        id: "triveni-sangam",
        bestTimeNote:
          "Best during early morning sunrise or sunset for holy bath rituals.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Triveni Sangam",
        lat: 20.887,
        lng: 70.41,
        durationHours: 1,
        rating: 4.4,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description:
          "Holy confluence of Hiran, Kapila, and Saraswati rivers before entering the ocean.",
        gujaratiName: "ત્રિવેણી સંગમ",
        hindiName: "त्रिवेणी संगम",
        gujaratiDescription:
          "Holy confluence of Hiran, Kapila, and Saraswati rivers before entering the ocean.",
        hindiDescription:
          "Holy confluence of Hiran, Kapila, and Saraswati rivers before entering the ocean.",
      },
      {
        id: "somnath-beach",
        bestTimeNote:
          "Best at sunset -- swimming is restricted due to strong currents.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Somnath Beach",
        lat: 20.883,
        lng: 70.403,
        durationHours: 1.5,
        rating: 4.3,
        category: "Nature",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description:
          "Scenic coastal promenade with roaring waves and camel rides near temple grounds.",
        gujaratiName: "સોમનાથ બીચ",
        hindiName: "सोमनाथ बीच",
        gujaratiDescription:
          "Scenic coastal promenade with roaring waves and camel rides near temple grounds.",
        hindiDescription:
          "Scenic coastal promenade with roaring waves and camel rides near temple grounds.",
      },
    ],
    hotels: [
      {
        id: "premier-somnath",
        name: "Hotel The Premier Somnath",
        lat: 20.892,
        lng: 70.405,
        pricePerNight: "₹1,047",
        priceNumeric: 1047,
        rating: "3.6 ★",
        ratingNumeric: 3.6,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Station Road, Somnath",
        description:
          "Clean budget hotel close to Veraval station and Somnath temple shuttle stops.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Hotel The Premier Somnath",
        hindiName: "Hotel The Premier Somnath",
        gujaratiDescription:
          "Clean budget hotel close to Veraval station and Somnath temple shuttle stops.",
        hindiDescription:
          "Clean budget hotel close to Veraval station and Somnath temple shuttle stops.",
      },
      {
        id: "sarovar-portico-somnath",
        name: "Sarovar Portico Somnath",
        lat: 20.895,
        lng: 70.402,
        pricePerNight: "₹3,500",
        priceNumeric: 3500,
        rating: "4.2 ★",
        ratingNumeric: 4.2,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Bypass Road, Somnath",
        description:
          "Modern comfort resort with swimming pool and pure vegetarian multi-cuisine dining.",
        valueScore: 88,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Sarovar Portico Somnath",
        hindiName: "Sarovar Portico Somnath",
        gujaratiDescription:
          "Modern comfort resort with swimming pool and pure vegetarian multi-cuisine dining.",
        hindiDescription:
          "Modern comfort resort with swimming pool and pure vegetarian multi-cuisine dining.",
      },
      {
        id: "fern-residency-somnath",
        name: "The Fern Residency Somnath",
        lat: 20.898,
        lng: 70.408,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.4 ★",
        ratingNumeric: 4.4,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Prabhas Patan Highway",
        description:
          "Eco-certified luxury hotel featuring temple view suites and serene gardens.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "The Fern Residency Somnath",
        hindiName: "The Fern Residency Somnath",
        gujaratiDescription:
          "Eco-certified luxury hotel featuring temple view suites and serene gardens.",
        hindiDescription:
          "Eco-certified luxury hotel featuring temple view suites and serene gardens.",
      },
    ],
    restaurants: [
      {
        id: "sarvodaya-dining",
        name: "Sarvodaya Dining Hall",
        lat: 20.891,
        lng: 70.403,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Near Temple Gate",
        cuisine: "Gujarati Thali",
        gujaratiName: "Sarvodaya Dining Hall",
        hindiName: "Sarvodaya Dining Hall",
      },
      {
        id: "somnath-sagar",
        name: "Somnath Sagar Restaurant",
        lat: 20.889,
        lng: 70.402,
        rating: 4.4,
        avgCostPerPerson: 200,
        location: "Veraval Road",
        cuisine: "North Indian & Kathiyawadi",
        gujaratiName: "Somnath Sagar Restaurant",
        hindiName: "Somnath Sagar Restaurant",
      },
      {
        id: "grand-radhe-thali",
        name: "Grand Radhe Thali",
        lat: 20.893,
        lng: 70.406,
        rating: 4.5,
        avgCostPerPerson: 300,
        location: "Prabhas Patan",
        cuisine: "Unlimited Royal Thali",
        gujaratiName: "Grand Radhe Thali",
        hindiName: "Grand Radhe Thali",
      },
    ],
    nearbyAttractions: [
      {
        id: "somnath-temple",
        name: "Somnath Temple",
        category: "Spiritual/Heritage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સોમનાથ મંદિર",
        hindiName: "सोमनाथ मंदिर",
      },
      {
        id: "bhalka-tirth",
        name: "Bhalka Tirth",
        category: "Pilgrimage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "ભાલકા તીર્થ",
        hindiName: "भालका तीर्थ",
      },
      {
        id: "triveni-sangam",
        name: "Triveni Sangam",
        category: "Pilgrimage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "ત્રિવેણી સંગમ",
        hindiName: "त्रिवेणी संगम",
      },
      {
        id: "somnath-beach",
        name: "Somnath Beach",
        category: "Nature",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સોમનાથ બીચ",
        hindiName: "सोमनाथ बीच",
      },
    ],
    nearbyHotels: [
      {
        id: "premier-somnath",
        name: "Hotel The Premier Somnath",
        lat: 20.892,
        lng: 70.405,
        pricePerNight: "₹1,047",
        priceNumeric: 1047,
        rating: "3.6 ★",
        ratingNumeric: 3.6,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Station Road, Somnath",
        description:
          "Clean budget hotel close to Veraval station and Somnath temple shuttle stops.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "sarovar-portico-somnath",
        name: "Sarovar Portico Somnath",
        lat: 20.895,
        lng: 70.402,
        pricePerNight: "₹3,500",
        priceNumeric: 3500,
        rating: "4.2 ★",
        ratingNumeric: 4.2,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Bypass Road, Somnath",
        description:
          "Modern comfort resort with swimming pool and pure vegetarian multi-cuisine dining.",
        valueScore: 88,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "fern-residency-somnath",
        name: "The Fern Residency Somnath",
        lat: 20.898,
        lng: 70.408,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.4 ★",
        ratingNumeric: 4.4,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Prabhas Patan Highway",
        description:
          "Eco-certified luxury hotel featuring temple view suites and serene gardens.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Somnath",
    hindiName: "Somnath",
    gujaratiDescription:
      "Located at Prabhas Patan, Somnath is the first among the twelve holy Jyotirlinga shrines of Lord Shiva, overlooking the roaring waves of the Arabian Sea.",
    hindiDescription:
      "Located at Prabhas Patan, Somnath is the first among the twelve holy Jyotirlinga shrines of Lord Shiva, overlooking the roaring waves of the Arabian Sea.",
  },
  {
    id: "dwarka",
    seasonalAdvisory: {
      note: "Janmashtami festival (August/September) sees massive devotional gatherings; book lodging months in advance. October to March is pleasant for pilgrimage and Bet Dwarka ferry rides.",
      activeMonths: [8, 9, 10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Aug – Mar (Janmashtami & Winter)",
    },
    name: "Dwarka",
    nearestHospital:
      "Government General Hospital Dwarka, ~8 min from city center",
    nearestPoliceStation:
      "Dwarka City Police Station, ~5 min from Dwarkadhish Temple",
    district: "Devbhumi Dwarka",
    location: "Saurashtra Coast",
    category: "Kingdom of Krishna & Sacred Shore",
    officialCategory: "Religious Sites",
    tag: "Ancient Capital of Lord Krishna",
    rating: "4.8 ★",
    ratingValue: 4.8,
    entryFee: "Free Darshan",
    entryFeeNumeric: 0,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "440 km",
    distanceNumeric: 440,
    duration: "2 Days",
    avgVisitTime: "Full Day",
    imageUrl:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1000",
    imageAlt:
      "Dwarkadhish Temple 5-story spire and flag rising above Gomti Ghat",
    description:
      "One of the four sacred Char Dham pilgrimage sites, Dwarka sits at the western tip of Gujarat where the Gomti River meets the Arabian Sea.",
    highlights: [
      "Dwarkadhish Jagat Mandir Spire",
      "Bet Dwarka Island Boat Ride",
      "Gomti Ghat Aarti",
    ],
    attractions: [
      {
        id: "dwarkadhish-temple",
        bestTimeNote:
          "Best during morning mangla aarti (6:30 AM) or evening 7:30 PM aarti.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Dwarkadhish Temple",
        lat: 22.2376,
        lng: 68.9674,
        durationHours: 2,
        rating: 4.6,
        category: "Spiritual/Heritage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description:
          "5-story carved limestone temple dedicated to Krishna as King of Dwarka.",
        gujaratiName: "દ્વારકાધીશ મંદિર",
        hindiName: "द्वारकाधीश मंदिर",
        gujaratiDescription:
          "ભગવાન કૃષ્ણની પ્રાચીન રાજ્ય રાજધાની અને ચાર ધામ પૈકીનું એક પવિત્ર યાત્રાધામ.",
        hindiDescription:
          "भगवान कृष्ण की प्राचीन राज्य राजधानी और चार धाम यात्रा में से एक पवित्र तीर्थस्थल।",
      },
      {
        id: "nageshwar-jyotirlinga",
        bestTimeNote:
          "Best in early morning before tour buses arrive around 11am.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Nageshwar Jyotirlinga",
        lat: 22.3364,
        lng: 69.0853,
        durationHours: 1.5,
        rating: 4.5,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description:
          "Sacred shrine featuring a giant 80ft seated statue of Lord Shiva.",
        gujaratiName: "નાગેશ્વર જ્યોતિર્લિંગ",
        hindiName: "नागेश्वर ज्योतिर्लिंग",
        gujaratiDescription:
          "Sacred shrine featuring a giant 80ft seated statue of Lord Shiva.",
        hindiDescription:
          "Sacred shrine featuring a giant 80ft seated statue of Lord Shiva.",
      },
      {
        id: "rukmini-devi-temple",
        bestTimeNote: "Visit mid-morning after Dwarkadhish temple visit.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Rukmini Devi Temple",
        lat: 22.253,
        lng: 68.98,
        durationHours: 1,
        rating: 4.4,
        category: "Heritage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "12th-century architectural gem decorated with intricate panels and carvings.",
        gujaratiName: "રૂક્ષ્મણી દેવી મંદિર",
        hindiName: "रुक्मिणी देवी मंदिर",
        gujaratiDescription:
          "12th-century architectural gem decorated with intricate panels and carvings.",
        hindiDescription:
          "12th-century architectural gem decorated with intricate panels and carvings.",
      },
      {
        id: "bet-dwarka",
        bestTimeNote:
          "Check boat ferry tide timings before departing Okha jetty; best in morning.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Bet Dwarka",
        lat: 22.4633,
        lng: 69.1114,
        durationHours: 3,
        rating: 4.5,
        category: "Island/Pilgrimage",
        entryFee: "~₹30 boat fare",
        entryFeeNumeric: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description:
          "Sacred island off Okha coast believed to be the residence of Lord Krishna.",
        gujaratiName: "બેટ દ્વારકા",
        hindiName: "बेट द्वारका",
        gujaratiDescription:
          "Sacred island off Okha coast believed to be the residence of Lord Krishna.",
        hindiDescription:
          "Sacred island off Okha coast believed to be the residence of Lord Krishna.",
        transportMode: "boat",
      },
    ],
    hotels: [
      {
        id: "darshan-palace",
        name: "Hotel Darshan Palace",
        lat: 22.239,
        lng: 68.969,
        pricePerNight: "₹1,050",
        priceNumeric: 1050,
        rating: "3.5 ★",
        ratingNumeric: 3.5,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Gomti Ghat Road",
        description:
          "Cozy family stay minutes away from Gomti Ghat and the main temple entrance.",
        valueScore: 92,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Hotel Darshan Palace",
        hindiName: "Hotel Darshan Palace",
        gujaratiDescription:
          "Cozy family stay minutes away from Gomti Ghat and the main temple entrance.",
        hindiDescription:
          "Cozy family stay minutes away from Gomti Ghat and the main temple entrance.",
      },
      {
        id: "the-dwarika-hotel",
        name: "The Dwarika Hotel",
        lat: 22.242,
        lng: 68.972,
        pricePerNight: "₹4,355",
        priceNumeric: 4355,
        rating: "3.9 ★",
        ratingNumeric: 3.9,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Station Road, Dwarka",
        description:
          "Comfortable hospitality stay featuring vegetarian dining hall and temple tour assistance.",
        valueScore: 84,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "The Dwarika Hotel",
        hindiName: "The Dwarika Hotel",
        gujaratiDescription:
          "Comfortable hospitality stay featuring vegetarian dining hall and temple tour assistance.",
        hindiDescription:
          "Comfortable hospitality stay featuring vegetarian dining hall and temple tour assistance.",
      },
      {
        id: "mercure-dwarka",
        name: "Mercure Dwarka",
        lat: 22.248,
        lng: 68.978,
        pricePerNight: "₹6,500",
        priceNumeric: 6500,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Porbandar Highway",
        description:
          "Spacious international hotel featuring lawn dining and wellness therapies.",
        valueScore: 78,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Mercure Dwarka",
        hindiName: "Mercure Dwarka",
        gujaratiDescription:
          "Spacious international hotel featuring lawn dining and wellness therapies.",
        hindiDescription:
          "Spacious international hotel featuring lawn dining and wellness therapies.",
      },
    ],
    restaurants: [
      {
        id: "shrinath-dining",
        name: "Shrinath Dining Hall",
        lat: 22.238,
        lng: 68.968,
        rating: 4.4,
        avgCostPerPerson: 220,
        location: "Near Temple Gate",
        cuisine: "Kathiyawadi Thali",
        gujaratiName: "Shrinath Dining Hall",
        hindiName: "Shrinath Dining Hall",
      },
      {
        id: "govinda-restaurant",
        name: "Govinda Restaurant",
        lat: 22.24,
        lng: 68.97,
        rating: 4.5,
        avgCostPerPerson: 350,
        location: "Gomti Ghat",
        cuisine: "Pure Veg Multi-Cuisine",
        gujaratiName: "Govinda Restaurant",
        hindiName: "Govinda Restaurant",
      },
      {
        id: "charmi-thali-house",
        name: "Charmi Thali House",
        lat: 22.236,
        lng: 68.966,
        rating: 4.2,
        avgCostPerPerson: 180,
        location: "Station Road",
        cuisine: "Gujarati Meal",
        gujaratiName: "Charmi Thali House",
        hindiName: "Charmi Thali House",
      },
    ],
    nearbyAttractions: [
      {
        id: "dwarkadhish-temple",
        name: "Dwarkadhish Temple",
        category: "Spiritual/Heritage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "દ્વારકાધીશ મંદિર",
        hindiName: "द्वारकाधीश मंदिर",
      },
      {
        id: "nageshwar-jyotirlinga",
        name: "Nageshwar Jyotirlinga",
        category: "Pilgrimage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "નાગેશ્વર જ્યોતિર્લિંગ",
        hindiName: "नागेश्वर ज्योतिर्लिंग",
      },
      {
        id: "rukmini-devi-temple",
        name: "Rukmini Devi Temple",
        category: "Heritage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "રૂક્ષ્મણી દેવી મંદિર",
        hindiName: "रुक्मिणी देवी मंदिर",
      },
      {
        id: "bet-dwarka",
        name: "Bet Dwarka",
        category: "Island/Pilgrimage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "બેટ દ્વારકા",
        hindiName: "बेट द्वारका",
      },
    ],
    nearbyHotels: [
      {
        id: "darshan-palace",
        name: "Hotel Darshan Palace",
        lat: 22.239,
        lng: 68.969,
        pricePerNight: "₹1,050",
        priceNumeric: 1050,
        rating: "3.5 ★",
        ratingNumeric: 3.5,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Gomti Ghat Road",
        description:
          "Cozy family stay minutes away from Gomti Ghat and the main temple entrance.",
        valueScore: 92,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "the-dwarika-hotel",
        name: "The Dwarika Hotel",
        lat: 22.242,
        lng: 68.972,
        pricePerNight: "₹4,355",
        priceNumeric: 4355,
        rating: "3.9 ★",
        ratingNumeric: 3.9,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Station Road, Dwarka",
        description:
          "Comfortable hospitality stay featuring vegetarian dining hall and temple tour assistance.",
        valueScore: 84,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "mercure-dwarka",
        name: "Mercure Dwarka",
        lat: 22.248,
        lng: 68.978,
        pricePerNight: "₹6,500",
        priceNumeric: 6500,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Porbandar Highway",
        description:
          "Spacious international hotel featuring lawn dining and wellness therapies.",
        valueScore: 78,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Dwarka",
    hindiName: "Dwarka",
    gujaratiDescription:
      "One of the four sacred Char Dham pilgrimage sites, Dwarka sits at the western tip of Gujarat where the Gomti River meets the Arabian Sea.",
    hindiDescription:
      "One of the four sacred Char Dham pilgrimage sites, Dwarka sits at the western tip of Gujarat where the Gomti River meets the Arabian Sea.",
  },
  {
    id: "rann-of-kutch",
    seasonalAdvisory: {
      note: "Rann Utsav runs roughly November to February -- book well ahead during this window, most other months are extremely hot or flooded during monsoon (July-Sept).",
      activeMonths: [10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Nov – Feb (Rann Utsav)",
    },
    name: "Rann of Kutch",
    nearestHospital:
      "G K General Hospital Bhuj, ~1 hr 15 min (CHC Khavda ~30 min) from Dhordo",
    nearestPoliceStation:
      "Khavda Police Station, ~30 min from Dhordo / White Desert gate",
    district: "Kutch",
    location: "Kutch District",
    category: "Salt Desert & Artisan Guilds",
    officialCategory: "Weekend Get-aways",
    tag: "Salt Desert & Ajrakh Artisans",
    rating: "4.9 ★",
    ratingValue: 4.9,
    entryFee: "₹100 Permit",
    entryFeeNumeric: 100,
    bestTime: "Nov – Feb",
    distanceFromAhmedabad: "330 km",
    distanceNumeric: 330,
    duration: "2–3 Days",
    avgVisitTime: "Full Day",
    imageUrl:
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=1000",
    imageAlt:
      "Glistening white salt desert of Rann of Kutch under twilight sky",
    description:
      "A vast 7,500 sq km expanse of glistening white salt desert with moonlight vistas, Rogan art, and Ajrakh block-printing craft villages.",
    highlights: [
      "White Desert Sunset",
      "Kalo Dungar Panoramic View",
      "Nirona Rogan Crafts",
    ],
    attractions: [
      {
        id: "white-desert-gate",
        bestTimeNote:
          "Avoid midday (11am-3pm) -- open salt flat heat is intense with no shade.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Dhordo White Desert Gate",
        lat: 23.778,
        lng: 69.512,
        durationHours: 3,
        rating: 4.9,
        category: "Nature/Wonder",
        entryFee: "₹100",
        entryFeeNumeric: 100,
        imageUrl:
          "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600",
        description:
          "Vast endless white salt desert expanse, spectacular during full moon nights.",
        gujaratiName: "ધોરડો સફેદ રણ ગેટ",
        hindiName: "धोर्डो सफेद मरुस्थल द्वार",
        gujaratiDescription:
          "વિશ્વનું સૌથી મોટું સફેદ મીઠાનું રણ, જે સૂર્યાસ્ત, લોકસંગીત અને રણોત્સવ માટે પ્રખ્યાત છે.",
        hindiDescription:
          "विश्व का सबसे बड़ा सफेद नमक का मरुस्थल, जो सूर्यास्त, लोक संगीत और रणोत्सव के लिए प्रसिद्ध है।",
      },
      {
        id: "kalo-dungar",
        bestTimeNote:
          "Best in late afternoon before sunset for panoramic view over Rann.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Kalo Dungar (Black Hill)",
        lat: 23.931,
        lng: 69.789,
        durationHours: 2,
        rating: 4.7,
        category: "Viewpoint",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description:
          "Highest point in Kutch offering sweeping views of the Great Rann and Pakistan border.",
        gujaratiName: "કાળો ડુંગર",
        hindiName: "कालो डूंगर (ब्लैक हिल)",
        gujaratiDescription:
          "Highest point in Kutch offering sweeping views of the Great Rann and Pakistan border.",
        hindiDescription:
          "Highest point in Kutch offering sweeping views of the Great Rann and Pakistan border.",
      },
      {
        id: "nirona-craft-village",
        bestTimeNote: "Best between 10am-4pm when artisan workshops are open.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Nirona Crafts Village",
        lat: 23.472,
        lng: 69.341,
        durationHours: 2,
        rating: 4.8,
        category: "Heritage Crafts",
        entryFee: "Free Entry",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description:
          "Home to the world's last surviving Rogan oil-painting master artisans.",
        gujaratiName: "નિરોના ક્રાફ્ટ વિલેજ",
        hindiName: "निरोना क्राफ्ट गांव",
        gujaratiDescription:
          "Home to the world's last surviving Rogan oil-painting master artisans.",
        hindiDescription:
          "Home to the world's last surviving Rogan oil-painting master artisans.",
      },
      {
        id: "hodka-village",
        bestTimeNote:
          "Best in morning or late afternoon to interact with local Banni embroiderers.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Hodka Artisans Hamlet",
        lat: 23.652,
        lng: 69.601,
        durationHours: 1.5,
        rating: 4.6,
        category: "Culture",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        description:
          "Traditional Kutchi mud Bhunga village with mirrorwork textile workshops.",
        gujaratiName: "હોડકા કારીગર ગામ",
        hindiName: "होड़का कारीगर बस्ती",
        gujaratiDescription:
          "Traditional Kutchi mud Bhunga village with mirrorwork textile workshops.",
        hindiDescription:
          "Traditional Kutchi mud Bhunga village with mirrorwork textile workshops.",
      },
    ],
    hotels: [
      {
        id: "kutch-homestay",
        name: "Hodka Artisans Homestay",
        lat: 23.653,
        lng: 69.602,
        pricePerNight: "₹2,200",
        priceNumeric: 2200,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Budget",
        stayType: "Homestay",
        location: "Hodka Village",
        description:
          "Authentic mud Bhunga cottage run by local Kutchi craft families.",
        valueScore: 98,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Hodka Artisans Homestay",
        hindiName: "Hodka Artisans Homestay",
        gujaratiDescription:
          "Authentic mud Bhunga cottage run by local Kutchi craft families.",
        hindiDescription:
          "Authentic mud Bhunga cottage run by local Kutchi craft families.",
      },
      {
        id: "toran-resort-rann",
        name: "Toran Resort Dhordo",
        lat: 23.776,
        lng: 69.51,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Dhordo Gate",
        description:
          "Official TCGL gateway resort located directly at the White Desert permit gate.",
        valueScore: 84,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Toran Resort Dhordo",
        hindiName: "Toran Resort Dhordo",
        gujaratiDescription:
          "Official TCGL gateway resort located directly at the White Desert permit gate.",
        hindiDescription:
          "Official TCGL gateway resort located directly at the White Desert permit gate.",
      },
      {
        id: "rann-riders",
        name: "Rann Riders Safari Resort",
        lat: 23.48,
        lng: 69.35,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Dasada",
        description:
          "Eco-heritage resort styled like traditional Kutch villages with horse stables.",
        valueScore: 79,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Rann Riders Safari Resort",
        hindiName: "Rann Riders Safari Resort",
        gujaratiDescription:
          "Eco-heritage resort styled like traditional Kutch villages with horse stables.",
        hindiDescription:
          "Eco-heritage resort styled like traditional Kutch villages with horse stables.",
      },
    ],
    restaurants: [
      {
        id: "kutchi-rasoi",
        name: "Kutchi Rasoi Thali",
        lat: 23.654,
        lng: 69.603,
        rating: 4.5,
        avgCostPerPerson: 250,
        location: "Hodka Crossroads",
        cuisine: "Kutchi Bajra Roti & Thali",
        gujaratiName: "Kutchi Rasoi Thali",
        hindiName: "Kutchi Rasoi Thali",
      },
      {
        id: "hodka-craft-cafe",
        name: "Hodka Craft Cafe",
        lat: 23.651,
        lng: 69.599,
        rating: 4.3,
        avgCostPerPerson: 200,
        location: "Hodka Artisans Hub",
        cuisine: "Local Snacks & Tea",
        gujaratiName: "Hodka Craft Cafe",
        hindiName: "Hodka Craft Cafe",
      },
      {
        id: "dhordo-resort-dining",
        name: "Dhordo Food Pavilion",
        lat: 23.777,
        lng: 69.511,
        rating: 4.4,
        avgCostPerPerson: 300,
        location: "Dhordo Permit Gate",
        cuisine: "Traditional Gujarati Meal",
        gujaratiName: "Dhordo Food Pavilion",
        hindiName: "Dhordo Food Pavilion",
      },
    ],
    nearbyAttractions: [
      {
        id: "white-desert-gate",
        name: "Dhordo White Desert Gate",
        category: "Nature/Wonder",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "ધોરડો સફેદ રણ ગેટ",
        hindiName: "धोर्डो सफेद मरुस्थल द्वार",
      },
      {
        id: "kalo-dungar",
        name: "Kalo Dungar (Black Hill)",
        category: "Viewpoint",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કાળો ડુંગર",
        hindiName: "कालो डूंगर (ब्लैक हिल)",
      },
      {
        id: "nirona-craft-village",
        name: "Nirona Crafts Village",
        category: "Heritage Crafts",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "નિરોના ક્રાફ્ટ વિલેજ",
        hindiName: "निरोना क्राफ्ट गांव",
      },
      {
        id: "hodka-village",
        name: "Hodka Artisans Hamlet",
        category: "Culture",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "હોડકા કારીગર ગામ",
        hindiName: "होड़का कारीगर बस्ती",
      },
    ],
    nearbyHotels: [
      {
        id: "kutch-homestay",
        name: "Hodka Artisans Homestay",
        lat: 23.653,
        lng: 69.602,
        pricePerNight: "₹2,200",
        priceNumeric: 2200,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Budget",
        stayType: "Homestay",
        location: "Hodka Village",
        description:
          "Authentic mud Bhunga cottage run by local Kutchi craft families.",
        valueScore: 98,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "toran-resort-rann",
        name: "Toran Resort Dhordo",
        lat: 23.776,
        lng: 69.51,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Dhordo Gate",
        description:
          "Official TCGL gateway resort located directly at the White Desert permit gate.",
        valueScore: 84,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "rann-riders",
        name: "Rann Riders Safari Resort",
        lat: 23.48,
        lng: 69.35,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Dasada",
        description:
          "Eco-heritage resort styled like traditional Kutch villages with horse stables.",
        valueScore: 79,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Rann of Kutch",
    hindiName: "Rann of Kutch",
    gujaratiDescription:
      "A vast 7,500 sq km expanse of glistening white salt desert with moonlight vistas, Rogan art, and Ajrakh block-printing craft villages.",
    hindiDescription:
      "A vast 7,500 sq km expanse of glistening white salt desert with moonlight vistas, Rogan art, and Ajrakh block-printing craft villages.",
  },
  {
    id: "gir",
    seasonalAdvisory: {
      note: "Gir National Park is closed annually from June 16 to October 15 for monsoon breeding season. Safari permits for peak winter (Nov-Feb) sell out early. [TODO: confirm exact 2026-27 online permit window reopening date]",
      activeMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
      peakWindowLabel: "Oct 16 – Jun 15 (Park Open)",
    },
    name: "Gir National Park",
    nearestHospital:
      "Civil Hospital Junagadh, ~1 hr 15 min (CHC Mendarda ~30 min) from Sasan Gir",
    nearestPoliceStation: "Sasan Gir Police Station, ~5 min from park entrance",
    district: "Junagadh / Gir Somnath",
    location: "Sasan Gir Sanctuary",
    category: "Wildlife & Asiatic Lion Habitat",
    officialCategory: "Weekend Get-aways",
    tag: "Last Refuge of the Asiatic Lion",
    rating: "4.8 ★",
    ratingValue: 4.8,
    entryFee: "₹800 Permit",
    entryFeeNumeric: 800,
    bestTime: "Dec – Mar",
    distanceFromAhmedabad: "360 km",
    distanceNumeric: 360,
    duration: "2 Days",
    avgVisitTime: "Half Day",
    imageUrl:
      "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=1000",
    imageAlt:
      "Asiatic Lion resting in dry deciduous forest of Gir National Park",
    description:
      "The sole natural habitat of the endangered Asiatic Lion in the world, spanning dry deciduous teak forest, scrubland, and rocky hills.",
    highlights: [
      "Lion Open-Jeep Safari",
      "Devalia Interpretation Zone",
      "Kamleshwar Dam Crocodile Spotting",
    ],
    attractions: [
      {
        id: "gir-lion-safari",
        bestTimeNote:
          "Best on early morning safari slot (6:00am-9:00am) when wildlife is active.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Gir Jungle Jeep Safari",
        lat: 21.161,
        lng: 70.598,
        durationHours: 3.5,
        rating: 4.8,
        category: "Wildlife Safari",
        entryFee: "₹800 Permit",
        entryFeeNumeric: 800,
        imageUrl:
          "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=600",
        description:
          "Open jeep safari through core teak forest in search of Asiatic lions and leopards.",
        gujaratiName: "ગીર જંગલ જીપ સફારી",
        hindiName: "गिर जंगल जीप सफारी",
        gujaratiDescription:
          "એશિયાઈ સિંહોનું વિશ્વનું એકમાત્ર કુદરતી નિવાસસ્થાન અને વન્યજીવ અભયારણ્ય.",
        hindiDescription:
          "एशियाई शेरों का विश्व में एकमात्र प्राकृतिक आवास और वन्यजीव अभयारण्य।",
      },
      {
        id: "devalia-safari-park",
        bestTimeNote: "Best in morning or 3:00pm-5:00pm safari slots.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Devalia Safari Park",
        lat: 21.145,
        lng: 70.531,
        durationHours: 2,
        rating: 4.6,
        category: "Interpretation Zone",
        entryFee: "₹250",
        entryFeeNumeric: 250,
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description:
          "Fenced eco-tourism zone offering guaranteed lion and chinkara sightings via safari bus.",
        gujaratiName: "દેવાળિયા સફારી પાર્ક",
        hindiName: "देवालिया सफारी पार्क",
        gujaratiDescription:
          "Fenced eco-tourism zone offering guaranteed lion and chinkara sightings via safari bus.",
        hindiDescription:
          "Fenced eco-tourism zone offering guaranteed lion and chinkara sightings via safari bus.",
      },
      {
        id: "kamleshwar-dam",
        bestTimeNote:
          "Best in early morning for birdwatching along Hiran river.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Kamleshwar Dam",
        lat: 21.12,
        lng: 70.62,
        durationHours: 1.5,
        rating: 4.4,
        category: "Nature",
        entryFee: "Free with Permit",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description:
          "Scenic reservoir in the heart of Gir, known as a marsh crocodile breeding site.",
        gujaratiName: "કમલેશ્વર ડેમ",
        hindiName: "कमलेश्वर बांध",
        gujaratiDescription:
          "Scenic reservoir in the heart of Gir, known as a marsh crocodile breeding site.",
        hindiDescription:
          "Scenic reservoir in the heart of Gir, known as a marsh crocodile breeding site.",
      },
      {
        id: "kankai-mata-temple",
        bestTimeNote:
          "Open only 6:00am to 5:00pm due to sanctuary wildlife regulations.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Kankai Mata Temple",
        lat: 21.1,
        lng: 70.55,
        durationHours: 2,
        rating: 4.5,
        category: "Spiritual/Forest",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description:
          "Deep jungle shrine inside Gir forest, visited by pilgrims surrounded by wilderness.",
        gujaratiName: "કાંકઈ માતાજી મંદિર",
        hindiName: "कंकाई माता मंदिर",
        gujaratiDescription:
          "Deep jungle shrine inside Gir forest, visited by pilgrims surrounded by wilderness.",
        hindiDescription:
          "Deep jungle shrine inside Gir forest, visited by pilgrims surrounded by wilderness.",
      },
    ],
    hotels: [
      {
        id: "maldhari-homestay",
        name: "Maldhari Eco Homestay",
        lat: 21.162,
        lng: 70.599,
        pricePerNight: "₹2,500",
        priceNumeric: 2500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Bhalchel Village",
        description:
          "Traditional Maldhari cattle-breeder hamlet offering organic farm meals.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Maldhari Eco Homestay",
        hindiName: "Maldhari Eco Homestay",
        gujaratiDescription:
          "Traditional Maldhari cattle-breeder hamlet offering organic farm meals.",
        hindiDescription:
          "Traditional Maldhari cattle-breeder hamlet offering organic farm meals.",
      },
      {
        id: "toran-sasan-gir",
        name: "Toran Resort Sasan Gir",
        lat: 21.16,
        lng: 70.597,
        pricePerNight: "₹3,200",
        priceNumeric: 3200,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Sasan Gir Safari Office",
        description:
          "TCGL sanctuary lodge situated adjacent to the Sasan Gir Wildlife Permit Centre.",
        valueScore: 86,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Toran Resort Sasan Gir",
        hindiName: "Toran Resort Sasan Gir",
        gujaratiDescription:
          "TCGL sanctuary lodge situated adjacent to the Sasan Gir Wildlife Permit Centre.",
        hindiDescription:
          "TCGL sanctuary lodge situated adjacent to the Sasan Gir Wildlife Permit Centre.",
      },
      {
        id: "woods-at-sasan",
        name: "The Woods at Sasan",
        lat: 21.165,
        lng: 70.605,
        pricePerNight: "₹9,500",
        priceNumeric: 9500,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Sasan Forest Border",
        description:
          "Boutique eco-villa sanctuary immersed in mango orchards at the edge of lion territory.",
        valueScore: 62,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "The Woods at Sasan",
        hindiName: "The Woods at Sasan",
        gujaratiDescription:
          "Boutique eco-villa sanctuary immersed in mango orchards at the edge of lion territory.",
        hindiDescription:
          "Boutique eco-villa sanctuary immersed in mango orchards at the edge of lion territory.",
      },
    ],
    restaurants: [
      {
        id: "kathiyawadi-zayka",
        name: "Kathiyawadi Zayka Dhaba",
        lat: 21.163,
        lng: 70.6,
        rating: 4.5,
        avgCostPerPerson: 220,
        location: "Sasan Highway",
        cuisine: "Kathiyawadi Sev Tameta & Ringan Bhartha",
        gujaratiName: "Kathiyawadi Zayka Dhaba",
        hindiName: "Kathiyawadi Zayka Dhaba",
      },
      {
        id: "sasan-jungle-view",
        name: "Jungle View Restaurant",
        lat: 21.161,
        lng: 70.596,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Safari Office Road",
        cuisine: "Gujarati & North Indian",
        gujaratiName: "Jungle View Restaurant",
        hindiName: "Jungle View Restaurant",
      },
      {
        id: "maldhari-rasoi",
        name: "Maldhari Farm Rasoi",
        lat: 21.164,
        lng: 70.602,
        rating: 4.6,
        avgCostPerPerson: 280,
        location: "Bhalchel Village",
        cuisine: "Organic Farm Thali",
        gujaratiName: "Maldhari Farm Rasoi",
        hindiName: "Maldhari Farm Rasoi",
      },
    ],
    nearbyAttractions: [
      {
        id: "gir-lion-safari",
        name: "Gir Jungle Jeep Safari",
        category: "Wildlife Safari",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "ગીર જંગલ જીપ સફારી",
        hindiName: "गिर जंगल जीप सफारी",
      },
      {
        id: "devalia-safari-park",
        name: "Devalia Safari Park",
        category: "Interpretation Zone",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "દેવાળિયા સફારી પાર્ક",
        hindiName: "देवालिया सफारी पार्क",
      },
      {
        id: "kamleshwar-dam",
        name: "Kamleshwar Dam",
        category: "Nature",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કમલેશ્વર ડેમ",
        hindiName: "कमलेश्वर बांध",
      },
      {
        id: "kankai-mata-temple",
        name: "Kankai Mata Temple",
        category: "Spiritual/Forest",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કાંકઈ માતાજી મંદિર",
        hindiName: "कंकाई माता मंदिर",
      },
    ],
    nearbyHotels: [
      {
        id: "maldhari-homestay",
        name: "Maldhari Eco Homestay",
        lat: 21.162,
        lng: 70.599,
        pricePerNight: "₹2,500",
        priceNumeric: 2500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Bhalchel Village",
        description:
          "Traditional Maldhari cattle-breeder hamlet offering organic farm meals.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "toran-sasan-gir",
        name: "Toran Resort Sasan Gir",
        lat: 21.16,
        lng: 70.597,
        pricePerNight: "₹3,200",
        priceNumeric: 3200,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Sasan Gir Safari Office",
        description:
          "TCGL sanctuary lodge situated adjacent to the Sasan Gir Wildlife Permit Centre.",
        valueScore: 86,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "woods-at-sasan",
        name: "The Woods at Sasan",
        lat: 21.165,
        lng: 70.605,
        pricePerNight: "₹9,500",
        priceNumeric: 9500,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Sasan Forest Border",
        description:
          "Boutique eco-villa sanctuary immersed in mango orchards at the edge of lion territory.",
        valueScore: 62,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Gir National Park",
    hindiName: "Gir National Park",
    gujaratiDescription:
      "The sole natural habitat of the endangered Asiatic Lion in the world, spanning dry deciduous teak forest, scrubland, and rocky hills.",
    hindiDescription:
      "The sole natural habitat of the endangered Asiatic Lion in the world, spanning dry deciduous teak forest, scrubland, and rocky hills.",
  },
  {
    id: "modhera",
    seasonalAdvisory: {
      note: "The Uttarayan Kite Festival and annual Modhera Dance Festival take place in mid-to-late January. October to March is ideal; April to June temperatures exceed 42°C on stone temple grounds.",
      activeMonths: [10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Oct – Mar (Dance Fest: Jan)",
    },
    name: "Modhera",
    nearestHospital: "Civil Hospital Mehsana, ~35 min from Modhera Sun Temple",
    nearestPoliceStation: "Modhera Police Station, ~5 min from temple complex",
    district: "Mehsana",
    location: "Mehsana District",
    category: "Architecture & Stepwell",
    officialCategory: "UNESCO World Heritage Site",
    tag: "11th Century Solanki Architecture",
    rating: "4.8 ★",
    ratingValue: 4.8,
    entryFee: "₹25 (Indian)",
    entryFeeNumeric: 25,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "98 km",
    distanceNumeric: 98,
    duration: "1–2 Days",
    avgVisitTime: "2–3 Hours",
    imageUrl:
      "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=1000",
    imageAlt:
      "Carved stone architecture and stepped tank Ramakunda at Modhera Sun Temple",
    description:
      "Dedicated to the solar deity Surya, this 11th-century Solanki monument features a geometrically carved stepped tank (Ramakunda) with 108 miniature shrines.",
    highlights: [
      "Ramakunda Stepped Tank",
      "Equinox Sun Alignment",
      "Surya Dance Festival Grounds",
    ],
    attractions: [
      {
        id: "modhera-sun-temple",
        bestTimeNote:
          "Best at sunrise -- the temple is aligned to catch first light directly on the sanctum.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Modhera Sun Temple & Ramakunda",
        lat: 23.5836,
        lng: 72.1328,
        durationHours: 2.5,
        rating: 4.8,
        category: "Architecture/Stepwell",
        entryFee: "₹25",
        entryFeeNumeric: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        description:
          "Masterpiece of 11th-century Solanki stone carving with a 108-shrine stepped tank.",
        gujaratiName: "મોઢેરા સૂર્ય મંદિર અને રામકુંડ",
        hindiName: "मोढेरा सूर्य मंदिर एवं रामकुंड",
        gujaratiDescription:
          "૧૧મી સદીનું સોલંકી શૈલીનું સૂર્ય મંદિર અને પાટણની યુનેસ્કો રાણી કી વાવ.",
        hindiDescription:
          "11वीं सदी का सोलंकी शैली का सूर्य मंदिर और पाटन की यूनेस्को रानी की वाव।",
      },
      {
        id: "rani-ki-vav",
        bestTimeNote:
          "Best in morning before 11am for optimal sunlight inside the deep stepwell.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Rani Ki Vav Stepwell (Patan)",
        lat: 23.8589,
        lng: 72.1018,
        durationHours: 2,
        rating: 4.9,
        category: "UNESCO World Heritage Stepwell",
        entryFee: "₹40",
        entryFeeNumeric: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "7-storey inverted subterranean temple stepwell decorated with over 500 major sculptures.",
        gujaratiName: "રાણી કી વાવ (પાટણ)",
        hindiName: "रानी की वाव (पाटन)",
        gujaratiDescription:
          "7-storey inverted subterranean temple stepwell decorated with over 500 major sculptures.",
        hindiDescription:
          "7-storey inverted subterranean temple stepwell decorated with over 500 major sculptures.",
      },
      {
        id: "patan-patola-house",
        bestTimeNote: "Best between 10:00am-5:00pm when weavers are at looms.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Patan Patola Weaving Guild",
        lat: 23.851,
        lng: 72.105,
        durationHours: 1.5,
        rating: 4.7,
        category: "Heritage Crafts",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description:
          "Authentic Salvi family double-ikat silk weaving guild and museum.",
        gujaratiName: "પાટણ પટોળા વણાટ કેન્દ્ર",
        hindiName: "पाटन पटोला बुनाई केंद्र",
        gujaratiDescription:
          "Authentic Salvi family double-ikat silk weaving guild and museum.",
        hindiDescription:
          "Authentic Salvi family double-ikat silk weaving guild and museum.",
      },
      {
        id: "bahucharaji-shakti-peeth",
        bestTimeNote: "Best early morning to avoid noon temple queues.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Bahucharaji Temple",
        lat: 23.498,
        lng: 72.062,
        durationHours: 1,
        rating: 4.5,
        category: "Spiritual",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description:
          "Historic Shakti Peeth temple complex known for colorful festival processions.",
        gujaratiName: "બહુચરાજી મંદિર",
        hindiName: "बहुचराजी मंदिर",
        gujaratiDescription:
          "Historic Shakti Peeth temple complex known for colorful festival processions.",
        hindiDescription:
          "Historic Shakti Peeth temple complex known for colorful festival processions.",
      },
    ],
    hotels: [
      {
        id: "toran-rani-ki-vav",
        name: "Toran Hotel Rani Ki Vav",
        lat: 23.855,
        lng: 72.103,
        pricePerNight: "₹2,400",
        priceNumeric: 2400,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Budget",
        stayType: "Toran Hotel",
        location: "Patan (Near Modhera)",
        description:
          "Official TCGL government bungalow with traditional Kathiawadi thali & stepwell proximity.",
        valueScore: 92,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Toran Hotel Rani Ki Vav",
        hindiName: "Toran Hotel Rani Ki Vav",
        gujaratiDescription:
          "Official TCGL government bungalow with traditional Kathiawadi thali & stepwell proximity.",
        hindiDescription:
          "Official TCGL government bungalow with traditional Kathiawadi thali & stepwell proximity.",
      },
      {
        id: "house-of-mg-circuit",
        name: "The House of MG (Heritage Base)",
        lat: 23.023,
        lng: 72.58,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Mid-range",
        stayType: "Heritage Hotel",
        location: "Mehsana Highway Circuit",
        description:
          "Restored Gaekwad-era mansion featuring Agashiye terrace dining & heritage rooms.",
        valueScore: 78,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "The House of MG (Heritage Base)",
        hindiName: "The House of MG (Heritage Base)",
        gujaratiDescription:
          "Restored Gaekwad-era mansion featuring Agashiye terrace dining & heritage rooms.",
        hindiDescription:
          "Restored Gaekwad-era mansion featuring Agashiye terrace dining & heritage rooms.",
      },
      {
        id: "royal-oasis-palace",
        name: "Royal Oasis Palace Estate",
        lat: 22.82,
        lng: 70.96,
        pricePerNight: "₹7,800",
        priceNumeric: 7800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Wankaner Estate",
        description:
          "Grand Art Deco palace estate set amidst 22 acres of private riverbank grounds.",
        valueScore: 68,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Royal Oasis Palace Estate",
        hindiName: "Royal Oasis Palace Estate",
        gujaratiDescription:
          "Grand Art Deco palace estate set amidst 22 acres of private riverbank grounds.",
        hindiDescription:
          "Grand Art Deco palace estate set amidst 22 acres of private riverbank grounds.",
      },
    ],
    restaurants: [
      {
        id: "solanki-heritage-dining",
        name: "Solanki Heritage Dining",
        lat: 23.584,
        lng: 72.133,
        rating: 4.4,
        avgCostPerPerson: 220,
        location: "Modhera Sun Temple Plaza",
        cuisine: "Gujarati Kathiyawadi Thali",
        gujaratiName: "Solanki Heritage Dining",
        hindiName: "Solanki Heritage Dining",
      },
      {
        id: "patan-kathiyawadi",
        name: "Patan Thali House",
        lat: 23.856,
        lng: 72.104,
        rating: 4.5,
        avgCostPerPerson: 200,
        location: "Near Rani Ki Vav Gate",
        cuisine: "Unlimited Traditional Meal",
        gujaratiName: "Patan Thali House",
        hindiName: "Patan Thali House",
      },
      {
        id: "stepwell-view-cafe",
        name: "Stepwell View Cafe",
        lat: 23.582,
        lng: 72.131,
        rating: 4.2,
        avgCostPerPerson: 280,
        location: "Modhera Bypass",
        cuisine: "Tea, Snacks & South Indian",
        gujaratiName: "Stepwell View Cafe",
        hindiName: "Stepwell View Cafe",
      },
    ],
    nearbyAttractions: [
      {
        id: "modhera-sun-temple",
        name: "Modhera Sun Temple & Ramakunda",
        category: "Architecture/Stepwell",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "મોઢેરા સૂર્ય મંદિર અને રામકુંડ",
        hindiName: "मोढेरा सूर्य मंदिर एवं रामकुंड",
      },
      {
        id: "rani-ki-vav",
        name: "Rani Ki Vav Stepwell (Patan)",
        category: "UNESCO World Heritage Stepwell",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "રાણી કી વાવ (પાટણ)",
        hindiName: "रानी की वाव (पाटन)",
      },
      {
        id: "patan-patola-house",
        name: "Patan Patola Weaving Guild",
        category: "Heritage Crafts",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "પાટણ પટોળા વણાટ કેન્દ્ર",
        hindiName: "पाटन पटोला बुनाई केंद्र",
      },
      {
        id: "bahucharaji-shakti-peeth",
        name: "Bahucharaji Temple",
        category: "Spiritual",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "બહુચરાજી મંદિર",
        hindiName: "बहुचराजी मंदिर",
      },
    ],
    nearbyHotels: [
      {
        id: "toran-rani-ki-vav",
        name: "Toran Hotel Rani Ki Vav",
        lat: 23.855,
        lng: 72.103,
        pricePerNight: "₹2,400",
        priceNumeric: 2400,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Budget",
        stayType: "Toran Hotel",
        location: "Patan (Near Modhera)",
        description:
          "Official TCGL government bungalow with traditional Kathiawadi thali & stepwell proximity.",
        valueScore: 92,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "house-of-mg-circuit",
        name: "The House of MG (Heritage Base)",
        lat: 23.023,
        lng: 72.58,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Mid-range",
        stayType: "Heritage Hotel",
        location: "Mehsana Highway Circuit",
        description:
          "Restored Gaekwad-era mansion featuring Agashiye terrace dining & heritage rooms.",
        valueScore: 78,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "royal-oasis-palace",
        name: "Royal Oasis Palace Estate",
        lat: 22.82,
        lng: 70.96,
        pricePerNight: "₹7,800",
        priceNumeric: 7800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Wankaner Estate",
        description:
          "Grand Art Deco palace estate set amidst 22 acres of private riverbank grounds.",
        valueScore: 68,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Modhera",
    hindiName: "Modhera",
    gujaratiDescription:
      "Dedicated to the solar deity Surya, this 11th-century Solanki monument features a geometrically carved stepped tank (Ramakunda) with 108 miniature shrines.",
    hindiDescription:
      "Dedicated to the solar deity Surya, this 11th-century Solanki monument features a geometrically carved stepped tank (Ramakunda) with 108 miniature shrines.",
  },
  {
    id: "champaner",
    seasonalAdvisory: {
      note: "Navratri festival (September/October) brings heavy pilgrimage traffic to Pavagadh Ropeway. Monsoon (July-Sept) makes the UNESCO ruins lush, while Nov-Feb offers cool hill climbing weather.",
      activeMonths: [7, 8, 9, 10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Jul – Mar (Monsoon & Winter)",
    },
    name: "Champaner",
    nearestHospital:
      "Halol Referral Hospital, ~15 min from Champaner foothill (SSG Hospital Vadodara ~50 min)",
    nearestPoliceStation:
      "Pavagadh Police Station (Halol), ~10 min from foothill base",
    district: "Panchmahal",
    location: "Pavagadh Foothills",
    category: "UNESCO Archaeological Park",
    officialCategory: "UNESCO World Heritage Site",
    tag: "Pre-Mughal Islamic & Hindu Fortified City",
    rating: "4.7 ★",
    ratingValue: 4.7,
    entryFee: "₹40",
    entryFeeNumeric: 40,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "145 km",
    distanceNumeric: 145,
    duration: "1–2 Days",
    avgVisitTime: "Half Day",
    imageUrl:
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1000",
    imageAlt:
      "Intricate arches and sandstone domes of Jama Masjid at Champaner-Pavagadh",
    description:
      "A UNESCO World Heritage site showcasing a pre-Mughal Islamic city, ancient fortresses, stepwells, and the sacred hilltop Kalika Mata Temple.",
    highlights: [
      "Jama Masjid Arched Courtyard",
      "Pavagadh Ropeway Ride",
      "Kevada Masjid Carvings",
    ],
    attractions: [
      {
        id: "jama-masjid-champaner",
        bestTimeNote:
          "Best in morning when sunlight illuminates carved stone archways.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Jama Masjid Champaner",
        lat: 22.486,
        lng: 73.535,
        durationHours: 2,
        rating: 4.8,
        category: "UNESCO Mosque Architecture",
        entryFee: "₹40",
        entryFeeNumeric: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "15th-century Indo-Islamic architectural marvel with 172 carved pillars and twin minarets.",
        gujaratiName: "જામા મસ્જિદ ચાંપાનેર",
        hindiName: "जामा मस्जिद चांपानेर",
        gujaratiDescription:
          "યુનેસ્કો વિશ્વ વારસો પુરાતત્વીય પાર્ક અને પાવાગઢ પર્વત પર સ્થિત મહાકાળી મંદિર.",
        hindiDescription:
          "यूनेस्को विश्व धरोहर पुरातात्विक पार्क और पावागढ़ पर्वत पर स्थित महाकाली मंदिर।",
      },
      {
        id: "kalika-mata-ropeway",
        bestTimeNote:
          "Best early morning before 8:30am to avoid 2-hour ropeway queues.",
        wheelchairAccessible: false,
        physicalDemand: "high",
        name: "Kalika Mata Temple Ropeway",
        lat: 22.463,
        lng: 73.522,
        durationHours: 2.5,
        rating: 4.6,
        category: "Hilltop Shrine",
        entryFee: "₹170 Ropeway",
        entryFeeNumeric: 170,
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description:
          "Sacred Shakti Peeth perched atop Pavagadh Hill accessible via ropeway cable car.",
        gujaratiName: "કાલિકા માતા મંદિર રોપવે",
        hindiName: "कालिका माता मंदिर रोप-वे",
        gujaratiDescription:
          "Sacred Shakti Peeth perched atop Pavagadh Hill accessible via ropeway cable car.",
        hindiDescription:
          "Sacred Shakti Peeth perched atop Pavagadh Hill accessible via ropeway cable car.",
      },
      {
        id: "kevada-masjid",
        bestTimeNote: "Best during daytime hours before 5pm.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Kevada & Nagina Masjid",
        lat: 22.482,
        lng: 73.531,
        durationHours: 1.5,
        rating: 4.5,
        category: "Heritage Monument",
        entryFee: "Free with Pass",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        description:
          "Serene forested mosques featuring exquisite floral niche carvings.",
        gujaratiName: "કેવડા અને નગીના મસ્જિદ",
        hindiName: "केवड़ा और नगीना मस्जिद",
        gujaratiDescription:
          "Serene forested mosques featuring exquisite floral niche carvings.",
        hindiDescription:
          "Serene forested mosques featuring exquisite floral niche carvings.",
      },
      {
        id: "jambughoda-sanctuary",
        bestTimeNote:
          "Best early morning or late afternoon for nature trail walks.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Jambughoda Wildlife Sanctuary",
        lat: 22.368,
        lng: 73.652,
        durationHours: 2,
        rating: 4.4,
        category: "Nature",
        entryFee: "₹50",
        entryFeeNumeric: 50,
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description:
          "Lush teak forest reserve with leopard habitat, bamboo groves, and reservoirs.",
        gujaratiName: "જાંબુઘોડા અભયારણ્ય",
        hindiName: "जांबुघोड़ा अभयारण्य",
        gujaratiDescription:
          "Lush teak forest reserve with leopard habitat, bamboo groves, and reservoirs.",
        hindiDescription:
          "Lush teak forest reserve with leopard habitat, bamboo groves, and reservoirs.",
      },
    ],
    hotels: [
      {
        id: "champaner-homestay",
        name: "Pavagadh Valley Homestay",
        lat: 22.48,
        lng: 73.53,
        pricePerNight: "₹1,800",
        priceNumeric: 1800,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Budget",
        stayType: "Homestay",
        location: "Halol Highway",
        description:
          "Rustic organic farm stay near Pavagadh hill ropeway station with homemade Gujarati thali.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Pavagadh Valley Homestay",
        hindiName: "Pavagadh Valley Homestay",
        gujaratiDescription:
          "Rustic organic farm stay near Pavagadh hill ropeway station with homemade Gujarati thali.",
        hindiDescription:
          "Rustic organic farm stay near Pavagadh hill ropeway station with homemade Gujarati thali.",
      },
      {
        id: "toran-champaner",
        name: "Toran Hotel Champaner",
        lat: 22.485,
        lng: 73.534,
        pricePerNight: "₹2,000",
        priceNumeric: 2000,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Pavagadh Foothills",
        description:
          "Government stay situated at the base of Pavagadh Hill with direct access to UNESCO sites.",
        valueScore: 91,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Toran Hotel Champaner",
        hindiName: "Toran Hotel Champaner",
        gujaratiDescription:
          "Government stay situated at the base of Pavagadh Hill with direct access to UNESCO sites.",
        hindiDescription:
          "Government stay situated at the base of Pavagadh Hill with direct access to UNESCO sites.",
      },
      {
        id: "jambughoda-palace",
        name: "Jambughoda Palace Estate",
        lat: 22.37,
        lng: 73.655,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Jambughoda Sanctuary",
        description:
          "Ancestral Gaekwad principality estate offering organic farm walks and heritage suites.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Jambughoda Palace Estate",
        hindiName: "Jambughoda Palace Estate",
        gujaratiDescription:
          "Ancestral Gaekwad principality estate offering organic farm walks and heritage suites.",
        hindiDescription:
          "Ancestral Gaekwad principality estate offering organic farm walks and heritage suites.",
      },
    ],
    restaurants: [
      {
        id: "pavagadh-foothills-thali",
        name: "Pavagadh Foothills Thali",
        lat: 22.481,
        lng: 73.531,
        rating: 4.4,
        avgCostPerPerson: 180,
        location: "Ropeway Base Plaza",
        cuisine: "Gujarati Thali",
        gujaratiName: "Pavagadh Foothills Thali",
        hindiName: "Pavagadh Foothills Thali",
      },
      {
        id: "champaner-heritage-rasoi",
        name: "Champaner Heritage Rasoi",
        lat: 22.484,
        lng: 73.533,
        rating: 4.5,
        avgCostPerPerson: 220,
        location: "Jama Masjid Road",
        cuisine: "Kathiyawadi & Snacks",
        gujaratiName: "Champaner Heritage Rasoi",
        hindiName: "Champaner Heritage Rasoi",
      },
      {
        id: "halol-junction-dining",
        name: "Halol Junction Restaurant",
        lat: 22.49,
        lng: 73.54,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Halol Highway",
        cuisine: "North Indian & Gujarati",
        gujaratiName: "Halol Junction Restaurant",
        hindiName: "Halol Junction Restaurant",
      },
    ],
    nearbyAttractions: [
      {
        id: "jama-masjid-champaner",
        name: "Jama Masjid Champaner",
        category: "UNESCO Mosque Architecture",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "જામા મસ્જિદ ચાંપાનેર",
        hindiName: "जामा मस्जिद चांपानेर",
      },
      {
        id: "kalika-mata-ropeway",
        name: "Kalika Mata Temple Ropeway",
        category: "Hilltop Shrine",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કાલિકા માતા મંદિર રોપવે",
        hindiName: "कालिका माता मंदिर रोप-वे",
      },
      {
        id: "kevada-masjid",
        name: "Kevada & Nagina Masjid",
        category: "Heritage Monument",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કેવડા અને નગીના મસ્જિદ",
        hindiName: "केवड़ा और नगीना मस्जिद",
      },
      {
        id: "jambughoda-sanctuary",
        name: "Jambughoda Wildlife Sanctuary",
        category: "Nature",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "જાંબુઘોડા અભયારણ્ય",
        hindiName: "जांबुघोड़ा अभयारण्य",
      },
    ],
    nearbyHotels: [
      {
        id: "champaner-homestay",
        name: "Pavagadh Valley Homestay",
        lat: 22.48,
        lng: 73.53,
        pricePerNight: "₹1,800",
        priceNumeric: 1800,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Budget",
        stayType: "Homestay",
        location: "Halol Highway",
        description:
          "Rustic organic farm stay near Pavagadh hill ropeway station with homemade Gujarati thali.",
        valueScore: 94,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "toran-champaner",
        name: "Toran Hotel Champaner",
        lat: 22.485,
        lng: 73.534,
        pricePerNight: "₹2,000",
        priceNumeric: 2000,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Pavagadh Foothills",
        description:
          "Government stay situated at the base of Pavagadh Hill with direct access to UNESCO sites.",
        valueScore: 91,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "jambughoda-palace",
        name: "Jambughoda Palace Estate",
        lat: 22.37,
        lng: 73.655,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Jambughoda Sanctuary",
        description:
          "Ancestral Gaekwad principality estate offering organic farm walks and heritage suites.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Champaner",
    hindiName: "Champaner",
    gujaratiDescription:
      "A UNESCO World Heritage site showcasing a pre-Mughal Islamic city, ancient fortresses, stepwells, and the sacred hilltop Kalika Mata Temple.",
    hindiDescription:
      "A UNESCO World Heritage site showcasing a pre-Mughal Islamic city, ancient fortresses, stepwells, and the sacred hilltop Kalika Mata Temple.",
  },
  {
    id: "saputara",
    seasonalAdvisory: {
      note: "Monsoon season (July to September) is Saputara hill station prime spectacle with Gira Waterfalls, dense fog mist, and the Saputara Monsoon Festival. Winter (Oct-Feb) is pleasant.",
      activeMonths: [7, 8, 9, 10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Jul – Sep (Monsoon Fest) & Oct – Feb",
    },
    name: "Saputara",
    nearestHospital:
      "Civil Hospital Ahwa / CHC Waghai, ~35 min from Saputara lake",
    nearestPoliceStation: "Saputara Police Station, ~5 min from lake center",
    district: "Dang",
    location: "Sahyadri Western Ghats",
    category: "Hill Station & Tribal Heritage",
    officialCategory: "Weekend Get-aways",
    tag: "Only Hill Station of Gujarat",
    rating: "4.6 ★",
    ratingValue: 4.6,
    entryFee: "Free Entry",
    entryFeeNumeric: 0,
    bestTime: "Jul – Mar",
    distanceFromAhmedabad: "400 km",
    distanceNumeric: 400,
    duration: "2 Days",
    avgVisitTime: "Full Day",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Mist-covered green Sahyadri hills and Saputara Lake",
    description:
      "Gujarat's sole hill station nestled in the dense teak forests of the Dang district, featuring cool highland air, boating lakes, and Warli tribal artisan hamlets.",
    highlights: [
      "Saputara Lake Pedal Boating",
      "Pushpak Ropeway Cable Car",
      "Gira Waterfalls Monsoon Cascade",
    ],
    attractions: [
      {
        id: "saputara-lake",
        bestTimeNote:
          "Best during late afternoon (4pm-6pm) for boating at cooler temperatures.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Saputara Lake & Boating",
        lat: 20.575,
        lng: 73.748,
        durationHours: 2,
        rating: 4.6,
        category: "Lake/Boating",
        entryFee: "₹100 Boat Ride",
        entryFeeNumeric: 100,
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description:
          "Serene highland lake surrounded by gardens, offering rowboats and pedal boats.",
        gujaratiName: "સાપુતારા તળાવ અને બોટિંગ",
        hindiName: "सापुतारा झील और बोटिंग",
        gujaratiDescription:
          "ડાંગના ઘનઘોર જંગલો અને ધોધ વચ્ચે આવેલું ગુજરાતનું એકમાત્ર હિલ સ્ટેશન.",
        hindiDescription:
          "डांग के घने जंगलों और झरनों के बीच स्थित गुजरात का एकमात्र हिल स्टेशन।",
      },
      {
        id: "sunset-point-ropeway",
        bestTimeNote:
          "Best 1 hour before sunset (5:00pm-6:30pm) for clear valley views.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Sunset Point Cable Car",
        lat: 20.582,
        lng: 73.751,
        durationHours: 1.5,
        rating: 4.5,
        category: "Viewpoint",
        entryFee: "₹90 Cable Car",
        entryFeeNumeric: 90,
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description:
          "Panoramic highland ridge offering cable car rides over Dang forest valleys.",
        gujaratiName: "સનસેટ પોઈન્ટ કેબલ કાર",
        hindiName: "सनसेट पॉइंट केबल कार",
        gujaratiDescription:
          "Panoramic highland ridge offering cable car rides over Dang forest valleys.",
        hindiDescription:
          "Panoramic highland ridge offering cable car rides over Dang forest valleys.",
      },
      {
        id: "gira-waterfalls",
        bestTimeNote:
          "Best mid-day to afternoon when sun hits the waterfall spray.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Gira Waterfalls",
        lat: 20.738,
        lng: 73.612,
        durationHours: 2,
        rating: 4.7,
        category: "Waterfall",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "75ft monsoon waterfall cascading into Ambika River amidst bamboo thickets.",
        gujaratiName: "ગિરા ધોધ",
        hindiName: "गिरा झरना",
        gujaratiDescription:
          "75ft monsoon waterfall cascading into Ambika River amidst bamboo thickets.",
        hindiDescription:
          "75ft monsoon waterfall cascading into Ambika River amidst bamboo thickets.",
      },
      {
        id: "artist-village-saputara",
        bestTimeNote:
          "Best between 10:00am-5:00pm for artisan craft workshops.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Artist Village Dang",
        lat: 20.572,
        lng: 73.745,
        durationHours: 1.5,
        rating: 4.4,
        category: "Tribal Crafts",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description:
          "Artisan cooperative demonstrating bamboo craft, pottery, and Warli paintings.",
        gujaratiName: "આર્ટિસ્ટ વિલેજ ડાંગ",
        hindiName: "आर्टिस्ट विलेज डांग",
        gujaratiDescription:
          "Artisan cooperative demonstrating bamboo craft, pottery, and Warli paintings.",
        hindiDescription:
          "Artisan cooperative demonstrating bamboo craft, pottery, and Warli paintings.",
      },
    ],
    hotels: [
      {
        id: "dang-tribal-homestay",
        name: "Dang Bamboo Artisans Homestay",
        lat: 20.57,
        lng: 73.743,
        pricePerNight: "₹1,600",
        priceNumeric: 1600,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Waghai Village",
        description:
          "Authentic Dang tribal family stay surrounded by bamboo groves and Warli art workshops.",
        valueScore: 99,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Dang Bamboo Artisans Homestay",
        hindiName: "Dang Bamboo Artisans Homestay",
        gujaratiDescription:
          "Authentic Dang tribal family stay surrounded by bamboo groves and Warli art workshops.",
        hindiDescription:
          "Authentic Dang tribal family stay surrounded by bamboo groves and Warli art workshops.",
      },
      {
        id: "toran-saputara",
        name: "Toran Hill Resort Saputara",
        lat: 20.574,
        lng: 73.747,
        pricePerNight: "₹2,600",
        priceNumeric: 2600,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Lake Garden Road",
        description:
          "TCGL hilltop sanctuary with panoramic lake views and direct access to ropeway.",
        valueScore: 90,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Toran Hill Resort Saputara",
        hindiName: "Toran Hill Resort Saputara",
        gujaratiDescription:
          "TCGL hilltop sanctuary with panoramic lake views and direct access to ropeway.",
        hindiDescription:
          "TCGL hilltop sanctuary with panoramic lake views and direct access to ropeway.",
      },
      {
        id: "aakar-lords-inn",
        name: "Aakar Lords Inn Saputara",
        lat: 20.581,
        lng: 73.75,
        pricePerNight: "₹4,100",
        priceNumeric: 4100,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Sunset Point Road",
        description:
          "Highland valley resort featuring heated indoor pool and forest trail excursions.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Aakar Lords Inn Saputara",
        hindiName: "Aakar Lords Inn Saputara",
        gujaratiDescription:
          "Highland valley resort featuring heated indoor pool and forest trail excursions.",
        hindiDescription:
          "Highland valley resort featuring heated indoor pool and forest trail excursions.",
      },
    ],
    restaurants: [
      {
        id: "lake-view-thali",
        name: "Lake View Gujarati Thali",
        lat: 20.574,
        lng: 73.746,
        rating: 4.4,
        avgCostPerPerson: 200,
        location: "Lake Garden Road",
        cuisine: "Gujarati Thali",
        gujaratiName: "Lake View Gujarati Thali",
        hindiName: "Lake View Gujarati Thali",
      },
      {
        id: "dang-tribal-kitchen",
        name: "Dang Tribal Spice Kitchen",
        lat: 20.571,
        lng: 73.744,
        rating: 4.5,
        avgCostPerPerson: 180,
        location: "Artist Village",
        cuisine: "Local Bamboo Shoot & Nagli Roti",
        gujaratiName: "Dang Tribal Spice Kitchen",
        hindiName: "Dang Tribal Spice Kitchen",
      },
      {
        id: "highland-cafe-saputara",
        name: "Highland Cafe Saputara",
        lat: 20.58,
        lng: 73.749,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Sunset Point Plaza",
        cuisine: "Multi-Cuisine & Tea",
        gujaratiName: "Highland Cafe Saputara",
        hindiName: "Highland Cafe Saputara",
      },
    ],
    nearbyAttractions: [
      {
        id: "saputara-lake",
        name: "Saputara Lake & Boating",
        category: "Lake/Boating",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સાપુતારા તળાવ અને બોટિંગ",
        hindiName: "सापुतारा झील और बोटिंग",
      },
      {
        id: "sunset-point-ropeway",
        name: "Sunset Point Cable Car",
        category: "Viewpoint",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સનસેટ પોઈન્ટ કેબલ કાર",
        hindiName: "सनसेट पॉइंट केबल कार",
      },
      {
        id: "gira-waterfalls",
        name: "Gira Waterfalls",
        category: "Waterfall",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "ગિરા ધોધ",
        hindiName: "गिरा झरना",
      },
      {
        id: "artist-village-saputara",
        name: "Artist Village Dang",
        category: "Tribal Crafts",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "આર્ટિસ્ટ વિલેજ ડાંગ",
        hindiName: "आर्टिस्ट विलेज डांग",
      },
    ],
    nearbyHotels: [
      {
        id: "dang-tribal-homestay",
        name: "Dang Bamboo Artisans Homestay",
        lat: 20.57,
        lng: 73.743,
        pricePerNight: "₹1,600",
        priceNumeric: 1600,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Waghai Village",
        description:
          "Authentic Dang tribal family stay surrounded by bamboo groves and Warli art workshops.",
        valueScore: 99,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "toran-saputara",
        name: "Toran Hill Resort Saputara",
        lat: 20.574,
        lng: 73.747,
        pricePerNight: "₹2,600",
        priceNumeric: 2600,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Lake Garden Road",
        description:
          "TCGL hilltop sanctuary with panoramic lake views and direct access to ropeway.",
        valueScore: 90,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "aakar-lords-inn",
        name: "Aakar Lords Inn Saputara",
        lat: 20.581,
        lng: 73.75,
        pricePerNight: "₹4,100",
        priceNumeric: 4100,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Sunset Point Road",
        description:
          "Highland valley resort featuring heated indoor pool and forest trail excursions.",
        valueScore: 82,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Saputara",
    hindiName: "Saputara",
    gujaratiDescription:
      "Gujarat's sole hill station nestled in the dense teak forests of the Dang district, featuring cool highland air, boating lakes, and Warli tribal artisan hamlets.",
    hindiDescription:
      "Gujarat's sole hill station nestled in the dense teak forests of the Dang district, featuring cool highland air, boating lakes, and Warli tribal artisan hamlets.",
  },
  {
    id: "ahmedabad",
    seasonalAdvisory: {
      note: "International Kite Festival (Uttarayan) takes place every January 14. November to February is best for heritage walks; summer (April-June) is scorching with temperatures over 43°C.",
      activeMonths: [10, 11, 12, 1, 2, 3],
      peakWindowLabel: "Nov – Feb (Uttarayan: Jan 14)",
    },
    name: "Ahmedabad",
    nearestHospital:
      "Civil Hospital Asarwa / VS General Hospital, ~15 min from city center",
    nearestPoliceStation:
      "Navrangpura Police Station, ~10 min from city center",
    district: "Ahmedabad",
    location: "Sabarmati Basin",
    category: "UNESCO World Heritage City",
    officialCategory: "UNESCO World Heritage Site",
    tag: "India's First UNESCO World Heritage City",
    rating: "4.8 ★",
    ratingValue: 4.8,
    entryFee: "Free / Nominal",
    entryFeeNumeric: 0,
    bestTime: "Oct – Mar",
    distanceFromAhmedabad: "0 km",
    distanceNumeric: 0,
    duration: "2–3 Days",
    avgVisitTime: "Full Day",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Traditional carved wooden Haveli facades in Old Ahmedabad Pols",
    description:
      "Founded in 1411 AD by Sultan Ahmed Shah, Ahmedabad is India's premier UNESCO World Heritage city featuring carved pols, stepwells, and Sabarmati Ashram.",
    highlights: [
      "Sabarmati Ashram Quiet Courtyards",
      "Adalaj Stepwell Intricate Carvings",
      "Agashiye Rooftop Dining",
    ],
    attractions: [
      {
        id: "sabarmati-ashram",
        bestTimeNote:
          "Best in morning or quiet late afternoon; light and sound show in evening.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Sabarmati Ashram",
        lat: 23.0601,
        lng: 72.5808,
        durationHours: 2,
        rating: 4.8,
        category: "Heritage/National Monument",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        description:
          "Historical riverside headquarters of Mahatma Gandhi during the Indian freedom movement.",
        gujaratiName: "સાબરમતી આશ્રમ",
        hindiName: "साबरमती आश्रम",
        gujaratiDescription:
          "ભારતનું પ્રથમ યુનેસ્કો વિશ્વ વારસા શહેર, સાબરમતી આશ્રમ અને પ્રાચીન પોળ સંસ્કૃતિ.",
        hindiDescription:
          "भारत का पहला यूनेस्को विश्व धरोहर शहर, साबरमती आश्रम और प्राचीन पोल संस्कृति।",
      },
      {
        id: "adalaj-stepwell",
        bestTimeNote:
          "Best between 9:00am-11:00am for natural light penetrating lower carved levels.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Adalaj Ni Vav Stepwell",
        lat: 23.1667,
        lng: 72.5801,
        durationHours: 1.5,
        rating: 4.8,
        category: "Stepwell Architecture",
        entryFee: "₹25",
        entryFeeNumeric: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        description:
          "5-story subterranean stepwell built in 1498 with intricate Solanki floral stone carvings.",
        gujaratiName: "અડાલજ ની વાવ",
        hindiName: "अडालज की वाव",
        gujaratiDescription:
          "5-story subterranean stepwell built in 1498 with intricate Solanki floral stone carvings.",
        hindiDescription:
          "5-story subterranean stepwell built in 1498 with intricate Solanki floral stone carvings.",
      },
      {
        id: "sidi-saiyyed-mosque",
        bestTimeNote:
          "Best in late afternoon when sunlight shines through the stone lattice Jali.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Sidi Saiyyed Mosque & Old Pols",
        lat: 23.026,
        lng: 72.581,
        durationHours: 2,
        rating: 4.7,
        category: "UNESCO Heritage City",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "World-renowned stone latticework 'Tree of Life' jali windows and heritage pols.",
        gujaratiName: "સીદી સૈયદ મસ્જિદ અને પોળ",
        hindiName: "सीदी सैय्यद मस्जिद और पोल",
        gujaratiDescription:
          "World-renowned stone latticework 'Tree of Life' jali windows and heritage pols.",
        hindiDescription:
          "World-renowned stone latticework 'Tree of Life' jali windows and heritage pols.",
      },
      {
        id: "calico-museum",
        bestTimeNote:
          "Requires pre-booked morning tour slot (10:15am); closed Mondays.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Calico Textile Museum",
        lat: 23.053,
        lng: 72.592,
        durationHours: 2,
        rating: 4.9,
        category: "Museum",
        entryFee: "Free (Prior Booking)",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description:
          "World-class collection of Indian court textiles, brocades, and double-ikat weaves.",
        gujaratiName: "કેલિકો ટેક્સટાઈલ મ્યુઝિયમ",
        hindiName: "कैलिको टेक्सटाइल म्यूजियम",
        gujaratiDescription:
          "World-class collection of Indian court textiles, brocades, and double-ikat weaves.",
        hindiDescription:
          "World-class collection of Indian court textiles, brocades, and double-ikat weaves.",
      },
      {
        id: "sarkhej-roza",
        bestTimeNote:
          "Best in morning or late afternoon; women are restricted from entering the main dargah tomb.",
        wheelchairAccessible: false,
        physicalDemand: "moderate",
        name: "Sarkhej Roza",
        lat: 22.9814,
        lng: 72.5025,
        durationHours: 1.5,
        rating: 4.5,
        category: "Heritage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description:
          "Historic mosque and tomb complex featuring an elegant blend of Islamic and Hindu architectural styles.",
        gujaratiName: "સરખેજ રોઝા",
        hindiName: "सरखेज रोजा",
        gujaratiDescription:
          "Historic mosque and tomb complex featuring an elegant blend of Islamic and Hindu architectural styles.",
        hindiDescription:
          "Historic mosque and tomb complex featuring an elegant blend of Islamic and Hindu architectural styles.",
      },
      {
        id: "kankaria-lake",
        bestTimeNote:
          "Best in evening (5pm-9pm) for laser show and cooler temperatures; closed Mondays.",
        wheelchairAccessible: true,
        physicalDemand: "low",
        name: "Kankaria Lake",
        lat: 22.9976,
        lng: 72.5996,
        durationHours: 2,
        rating: 4.4,
        category: "Nature/Recreation",
        entryFee: "₹25",
        entryFeeNumeric: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        description:
          "Second largest lake in Ahmedabad, featuring a zoo, toy train, water rides, and food stalls.",
        gujaratiName: "કાંકરિયા તળાવ",
        hindiName: "कांकरिया झील",
        gujaratiDescription:
          "Second largest lake in Ahmedabad, featuring a zoo, toy train, water rides, and food stalls.",
        hindiDescription:
          "Second largest lake in Ahmedabad, featuring a zoo, toy train, water rides, and food stalls.",
      },
    ],
    hotels: [
      {
        id: "french-haveli",
        name: "French Haveli Heritage Stay",
        lat: 23.021,
        lng: 72.589,
        pricePerNight: "₹3,400",
        priceNumeric: 3400,
        rating: "4.4 ★",
        ratingNumeric: 4.4,
        tier: "Budget",
        stayType: "Homestay",
        location: "Dhal ni Pol, Old City",
        description:
          "Restored 150-year-old carved wooden Haveli tucked inside Dhal ni Pol in the Old City.",
        valueScore: 91,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "French Haveli Heritage Stay",
        hindiName: "French Haveli Heritage Stay",
        gujaratiDescription:
          "Restored 150-year-old carved wooden Haveli tucked inside Dhal ni Pol in the Old City.",
        hindiDescription:
          "Restored 150-year-old carved wooden Haveli tucked inside Dhal ni Pol in the Old City.",
      },
      {
        id: "lemon-tree-premier",
        name: "Lemon Tree Premier",
        lat: 23.0372,
        lng: 72.5719,
        pricePerNight: "₹4,000",
        priceNumeric: 4000,
        rating: "4.2 ★",
        ratingNumeric: 4.2,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Ashram Road, Sabarmati Riverfront",
        description:
          "Contemporary riverfront hotel featuring a fitness center, pool, and multi-cuisine restaurant.",
        valueScore: 88,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "Lemon Tree Premier",
        hindiName: "Lemon Tree Premier",
        gujaratiDescription:
          "Contemporary riverfront hotel featuring a fitness center, pool, and multi-cuisine restaurant.",
        hindiDescription:
          "Contemporary riverfront hotel featuring a fitness center, pool, and multi-cuisine restaurant.",
      },
      {
        id: "house-of-mg-ahmedabad",
        name: "The House of MG",
        lat: 23.025,
        lng: 72.5825,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Opposite Sidi Saiyyed Mosque",
        description:
          "Award-winning grand heritage hotel facing Sidi Saiyyed Jali with rooftop Agashiye dining.",
        valueScore: 80,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "The House of MG",
        hindiName: "The House of MG",
        gujaratiDescription:
          "Award-winning grand heritage hotel facing Sidi Saiyyed Jali with rooftop Agashiye dining.",
        hindiDescription:
          "Award-winning grand heritage hotel facing Sidi Saiyyed Jali with rooftop Agashiye dining.",
      },
    ],
    restaurants: [
      {
        id: "agashiye-terrace",
        name: "Agashiye Terrace Restaurant",
        lat: 23.0251,
        lng: 72.5826,
        rating: 4.9,
        avgCostPerPerson: 1200,
        location: "The House of MG",
        cuisine: "Royal Gujarati Terrace Thali",
        gujaratiName: "Agashiye Terrace Restaurant",
        hindiName: "Agashiye Terrace Restaurant",
      },
      {
        id: "vishalla-heritage",
        name: "Vishalla Village Restaurant",
        lat: 22.99,
        lng: 72.53,
        rating: 4.2,
        avgCostPerPerson: 1000,
        location: "Vasna, Ahmedabad",
        cuisine: "Traditional Village Style Thali",
        gujaratiName: "Vishalla Village Restaurant",
        hindiName: "Vishalla Village Restaurant",
      },
      {
        id: "chandravilas-dining",
        name: "Chandravilas Dining Hall",
        lat: 23.024,
        lng: 72.586,
        rating: 4.1,
        avgCostPerPerson: 350,
        location: "Gandhi Road, Old City",
        cuisine: "Classic Gujarati Meal",
        gujaratiName: "Chandravilas Dining Hall",
        hindiName: "Chandravilas Dining Hall",
      },
    ],
    nearbyAttractions: [
      {
        id: "sabarmati-ashram",
        name: "Sabarmati Ashram",
        category: "Heritage/National Monument",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સાબરમતી આશ્રમ",
        hindiName: "साबरमती आश्रम",
      },
      {
        id: "adalaj-stepwell",
        name: "Adalaj Ni Vav Stepwell",
        category: "Stepwell Architecture",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "અડાલજ ની વાવ",
        hindiName: "अडालज की वाव",
      },
      {
        id: "sidi-saiyyed-mosque",
        name: "Sidi Saiyyed Mosque & Old Pols",
        category: "UNESCO Heritage City",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સીદી સૈયદ મસ્જિદ અને પોળ",
        hindiName: "सीदी सैय्यद मस्जिद और पोल",
      },
      {
        id: "calico-museum",
        name: "Calico Textile Museum",
        category: "Museum",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કેલિકો ટેક્સટાઈલ મ્યુઝિયમ",
        hindiName: "कैलिको टेक्सटाइल म्यूजियम",
      },
      {
        id: "sarkhej-roza",
        name: "Sarkhej Roza",
        category: "Heritage",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "સરખેજ રોઝા",
        hindiName: "सरखेज रोजा",
      },
      {
        id: "kankaria-lake",
        name: "Kankaria Lake",
        category: "Nature/Recreation",
        distance: "Intra-city",
        imageUrl:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        gujaratiName: "કાંકરિયા તળાવ",
        hindiName: "कांकरिया झील",
      },
    ],
    nearbyHotels: [
      {
        id: "french-haveli",
        name: "French Haveli Heritage Stay",
        lat: 23.021,
        lng: 72.589,
        pricePerNight: "₹3,400",
        priceNumeric: 3400,
        rating: "4.4 ★",
        ratingNumeric: 4.4,
        tier: "Budget",
        stayType: "Homestay",
        location: "Dhal ni Pol, Old City",
        description:
          "Restored 150-year-old carved wooden Haveli tucked inside Dhal ni Pol in the Old City.",
        valueScore: 91,
        imageUrl:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "lemon-tree-premier",
        name: "Lemon Tree Premier",
        lat: 23.0372,
        lng: 72.5719,
        pricePerNight: "₹4,000",
        priceNumeric: 4000,
        rating: "4.2 ★",
        ratingNumeric: 4.2,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Ashram Road, Sabarmati Riverfront",
        description:
          "Contemporary riverfront hotel featuring a fitness center, pool, and multi-cuisine restaurant.",
        valueScore: 88,
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "house-of-mg-ahmedabad",
        name: "The House of MG",
        lat: 23.025,
        lng: 72.5825,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Opposite Sidi Saiyyed Mosque",
        description:
          "Award-winning grand heritage hotel facing Sidi Saiyyed Jali with rooftop Agashiye dining.",
        valueScore: 80,
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      },
    ],
    gujaratiName: "Ahmedabad",
    hindiName: "Ahmedabad",
    gujaratiDescription:
      "Founded in 1411 AD by Sultan Ahmed Shah, Ahmedabad is India's premier UNESCO World Heritage city featuring carved pols, stepwells, and Sabarmati Ashram.",
    hindiDescription:
      "Founded in 1411 AD by Sultan Ahmed Shah, Ahmedabad is India's premier UNESCO World Heritage city featuring carved pols, stepwells, and Sabarmati Ashram.",
  },
];

export function getCityById(id: string): Destination | undefined {
  return GUJARAT_DESTINATIONS.find((d) => d.id === id);
}
