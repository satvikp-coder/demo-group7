export interface Attraction {
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
  tier: 'Budget' | 'Mid-range' | 'Luxury';
  stayType: 'Toran Hotel' | 'Heritage Hotel' | 'Registered Hotel' | 'Homestay';
  location: string;
  description: string;
  valueScore: number;
  imageUrl: string;
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
}

export interface NearbyAttraction {
  id: string;
  name: string;
  category: string;
  distance: string;
  imageUrl: string;
}

export type HotelOption = Hotel;

export interface Destination {
  id: string;
  name: string;
  district: string;
  location: string;
  category: string;
  officialCategory: 'Heritage Sites' | 'Religious Sites' | 'UNESCO World Heritage Site' | 'Beaches' | 'Bird Watching Sites' | 'Museums' | 'Weekend Get-aways';
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
  // New Intra-City Collections
  attractions: Attraction[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  // Legacy fields for backwards compatibility
  nearbyAttractions: NearbyAttraction[];
  nearbyHotels: HotelOption[];
}

export const OFFICIAL_CATEGORIES = [
  'All Categories',
  'Heritage Sites',
  'Religious Sites',
  'UNESCO World Heritage Site',
  'Beaches',
  'Bird Watching Sites',
  'Museums',
  'Weekend Get-aways',
] as const;

export const GUJARAT_DESTINATIONS: Destination[] = [
  {
    id: "somnath",
    name: "Somnath",
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
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Somnath Temple spire on the shores of the Arabian Sea at sunset",
    description: "Located at Prabhas Patan, Somnath is the first among the twelve holy Jyotirlinga shrines of Lord Shiva, overlooking the roaring waves of the Arabian Sea.",
    highlights: ["Somnath Temple Light & Sound Show", "Triveni Sangam Holy Dip", "Bhalka Tirth Sacred Grove"],
    attractions: [
      {
        id: "somnath-temple",
        name: "Somnath Temple",
        lat: 20.8880,
        lng: 70.4012,
        durationHours: 2.0,
        rating: 4.6,
        category: "Spiritual/Heritage",
        entryFee: "Free Darshan",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description: "Majestic Chalukya-style temple standing at the confluence of myth and ocean horizon."
      },
      {
        id: "bhalka-tirth",
        name: "Bhalka Tirth",
        lat: 20.9000,
        lng: 70.3700,
        durationHours: 1.0,
        rating: 4.5,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        description: "Sacred banyan grove marking where Lord Krishna departed his earthly realm."
      },
      {
        id: "triveni-sangam",
        name: "Triveni Sangam",
        lat: 20.8870,
        lng: 70.4100,
        durationHours: 1.0,
        rating: 4.4,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description: "Holy confluence of Hiran, Kapila, and Saraswati rivers before entering the ocean."
      },
      {
        id: "somnath-beach",
        name: "Somnath Beach",
        lat: 20.8830,
        lng: 70.4030,
        durationHours: 1.5,
        rating: 4.3,
        category: "Nature",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description: "Scenic coastal promenade with roaring waves and camel rides near temple grounds."
      }
    ],
    hotels: [
      {
        id: "premier-somnath",
        name: "Hotel The Premier Somnath",
        lat: 20.8920,
        lng: 70.4050,
        pricePerNight: "₹1,047",
        priceNumeric: 1047,
        rating: "3.6 ★",
        ratingNumeric: 3.6,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Station Road, Somnath",
        description: "Clean budget hotel close to Veraval station and Somnath temple shuttle stops.",
        valueScore: 94,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "sarovar-portico-somnath",
        name: "Sarovar Portico Somnath",
        lat: 20.8950,
        lng: 70.4020,
        pricePerNight: "₹3,500",
        priceNumeric: 3500,
        rating: "4.2 ★",
        ratingNumeric: 4.2,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Bypass Road, Somnath",
        description: "Modern comfort resort with swimming pool and pure vegetarian multi-cuisine dining.",
        valueScore: 88,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "fern-residency-somnath",
        name: "The Fern Residency Somnath",
        lat: 20.8980,
        lng: 70.4080,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.4 ★",
        ratingNumeric: 4.4,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Prabhas Patan Highway",
        description: "Eco-certified luxury hotel featuring temple view suites and serene gardens.",
        valueScore: 82,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "sarvodaya-dining",
        name: "Sarvodaya Dining Hall",
        lat: 20.8910,
        lng: 70.4030,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Near Temple Gate",
        cuisine: "Gujarati Thali"
      },
      {
        id: "somnath-sagar",
        name: "Somnath Sagar Restaurant",
        lat: 20.8890,
        lng: 70.4020,
        rating: 4.4,
        avgCostPerPerson: 200,
        location: "Veraval Road",
        cuisine: "North Indian & Kathiyawadi"
      },
      {
        id: "grand-radhe-thali",
        name: "Grand Radhe Thali",
        lat: 20.8930,
        lng: 70.4060,
        rating: 4.5,
        avgCostPerPerson: 300,
        location: "Prabhas Patan",
        cuisine: "Unlimited Royal Thali"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "dwarka",
    name: "Dwarka",
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
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Dwarkadhish Temple 5-story spire and flag rising above Gomti Ghat",
    description: "One of the four sacred Char Dham pilgrimage sites, Dwarka sits at the western tip of Gujarat where the Gomti River meets the Arabian Sea.",
    highlights: ["Dwarkadhish Jagat Mandir Spire", "Bet Dwarka Island Boat Ride", "Gomti Ghat Aarti"],
    attractions: [
      {
        id: "dwarkadhish-temple",
        name: "Dwarkadhish Temple",
        lat: 22.2376,
        lng: 68.9674,
        durationHours: 2.0,
        rating: 4.6,
        category: "Spiritual/Heritage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description: "5-story carved limestone temple dedicated to Krishna as King of Dwarka."
      },
      {
        id: "nageshwar-jyotirlinga",
        name: "Nageshwar Jyotirlinga",
        lat: 22.3364,
        lng: 69.0853,
        durationHours: 1.5,
        rating: 4.5,
        category: "Pilgrimage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description: "Sacred shrine featuring a giant 80ft seated statue of Lord Shiva."
      },
      {
        id: "rukmini-devi-temple",
        name: "Rukmini Devi Temple",
        lat: 22.2530,
        lng: 68.9800,
        durationHours: 1.0,
        rating: 4.4,
        category: "Heritage",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description: "12th-century architectural gem decorated with intricate panels and carvings."
      },
      {
        id: "bet-dwarka",
        name: "Bet Dwarka",
        lat: 22.4633,
        lng: 69.1114,
        durationHours: 3.0,
        rating: 4.5,
        category: "Island/Pilgrimage",
        entryFee: "~₹30 boat fare",
        entryFeeNumeric: 30,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description: "Sacred island off Okha coast believed to be the residence of Lord Krishna."
      }
    ],
    hotels: [
      {
        id: "darshan-palace",
        name: "Hotel Darshan Palace",
        lat: 22.2390,
        lng: 68.9690,
        pricePerNight: "₹1,050",
        priceNumeric: 1050,
        rating: "3.5 ★",
        ratingNumeric: 3.5,
        tier: "Budget",
        stayType: "Registered Hotel",
        location: "Gomti Ghat Road",
        description: "Cozy family stay minutes away from Gomti Ghat and the main temple entrance.",
        valueScore: 92,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "the-dwarika-hotel",
        name: "The Dwarika Hotel",
        lat: 22.2420,
        lng: 68.9720,
        pricePerNight: "₹4,355",
        priceNumeric: 4355,
        rating: "3.9 ★",
        ratingNumeric: 3.9,
        tier: "Mid-range",
        stayType: "Registered Hotel",
        location: "Station Road, Dwarka",
        description: "Comfortable hospitality stay featuring vegetarian dining hall and temple tour assistance.",
        valueScore: 84,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "mercure-dwarka",
        name: "Mercure Dwarka",
        lat: 22.2480,
        lng: 68.9780,
        pricePerNight: "₹6,500",
        priceNumeric: 6500,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Porbandar Highway",
        description: "Spacious international hotel featuring lawn dining and wellness therapies.",
        valueScore: 78,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "shrinath-dining",
        name: "Shrinath Dining Hall",
        lat: 22.2380,
        lng: 68.9680,
        rating: 4.4,
        avgCostPerPerson: 220,
        location: "Near Temple Gate",
        cuisine: "Kathiyawadi Thali"
      },
      {
        id: "govinda-restaurant",
        name: "Govinda Restaurant",
        lat: 22.2400,
        lng: 68.9700,
        rating: 4.5,
        avgCostPerPerson: 350,
        location: "Gomti Ghat",
        cuisine: "Pure Veg Multi-Cuisine"
      },
      {
        id: "charmi-thali-house",
        name: "Charmi Thali House",
        lat: 22.2360,
        lng: 68.9660,
        rating: 4.2,
        avgCostPerPerson: 180,
        location: "Station Road",
        cuisine: "Gujarati Meal"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "rann-of-kutch",
    name: "Rann of Kutch",
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
    imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Glistening white salt desert of Rann of Kutch under twilight sky",
    description: "A vast 7,500 sq km expanse of glistening white salt desert with moonlight vistas, Rogan art, and Ajrakh block-printing craft villages.",
    highlights: ["White Desert Sunset", "Kalo Dungar Panoramic View", "Nirona Rogan Crafts"],
    attractions: [
      {
        id: "white-desert-gate",
        name: "Dhordo White Desert Gate",
        lat: 23.7780,
        lng: 69.5120,
        durationHours: 3.0,
        rating: 4.9,
        category: "Nature/Wonder",
        entryFee: "₹100",
        entryFeeNumeric: 100,
        imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600",
        description: "Vast endless white salt desert expanse, spectacular during full moon nights."
      },
      {
        id: "kalo-dungar",
        name: "Kalo Dungar (Black Hill)",
        lat: 23.9310,
        lng: 69.7890,
        durationHours: 2.0,
        rating: 4.7,
        category: "Viewpoint",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description: "Highest point in Kutch offering sweeping views of the Great Rann and Pakistan border."
      },
      {
        id: "nirona-craft-village",
        name: "Nirona Crafts Village",
        lat: 23.4720,
        lng: 69.3410,
        durationHours: 2.0,
        rating: 4.8,
        category: "Heritage Crafts",
        entryFee: "Free Entry",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description: "Home to the world's last surviving Rogan oil-painting master artisans."
      },
      {
        id: "hodka-village",
        name: "Hodka Artisans Hamlet",
        lat: 23.6520,
        lng: 69.6010,
        durationHours: 1.5,
        rating: 4.6,
        category: "Culture",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600",
        description: "Traditional Kutchi mud Bhunga village with mirrorwork textile workshops."
      }
    ],
    hotels: [
      {
        id: "kutch-homestay",
        name: "Hodka Artisans Homestay",
        lat: 23.6530,
        lng: 69.6020,
        pricePerNight: "₹2,200",
        priceNumeric: 2200,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Budget",
        stayType: "Homestay",
        location: "Hodka Village",
        description: "Authentic mud Bhunga cottage run by local Kutchi craft families.",
        valueScore: 98,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "toran-resort-rann",
        name: "Toran Resort Dhordo",
        lat: 23.7760,
        lng: 69.5100,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Dhordo Gate",
        description: "Official TCGL gateway resort located directly at the White Desert permit gate.",
        valueScore: 84,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "rann-riders",
        name: "Rann Riders Safari Resort",
        lat: 23.4800,
        lng: 69.3500,
        pricePerNight: "₹5,500",
        priceNumeric: 5500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Dasada",
        description: "Eco-heritage resort styled like traditional Kutch villages with horse stables.",
        valueScore: 79,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "kutchi-rasoi",
        name: "Kutchi Rasoi Thali",
        lat: 23.6540,
        lng: 69.6030,
        rating: 4.5,
        avgCostPerPerson: 250,
        location: "Hodka Crossroads",
        cuisine: "Kutchi Bajra Roti & Thali"
      },
      {
        id: "hodka-craft-cafe",
        name: "Hodka Craft Cafe",
        lat: 23.6510,
        lng: 69.5990,
        rating: 4.3,
        avgCostPerPerson: 200,
        location: "Hodka Artisans Hub",
        cuisine: "Local Snacks & Tea"
      },
      {
        id: "dhordo-resort-dining",
        name: "Dhordo Food Pavilion",
        lat: 23.7770,
        lng: 69.5110,
        rating: 4.4,
        avgCostPerPerson: 300,
        location: "Dhordo Permit Gate",
        cuisine: "Traditional Gujarati Meal"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "gir",
    name: "Gir National Park",
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
    imageUrl: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Asiatic Lion resting in dry deciduous forest of Gir National Park",
    description: "The sole natural habitat of the endangered Asiatic Lion in the world, spanning dry deciduous teak forest, scrubland, and rocky hills.",
    highlights: ["Lion Open-Jeep Safari", "Devalia Interpretation Zone", "Kamleshwar Dam Crocodile Spotting"],
    attractions: [
      {
        id: "gir-lion-safari",
        name: "Gir Jungle Jeep Safari",
        lat: 21.1610,
        lng: 70.5980,
        durationHours: 3.5,
        rating: 4.8,
        category: "Wildlife Safari",
        entryFee: "₹800 Permit",
        entryFeeNumeric: 800,
        imageUrl: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=600",
        description: "Open jeep safari through core teak forest in search of Asiatic lions and leopards."
      },
      {
        id: "devalia-safari-park",
        name: "Devalia Safari Park",
        lat: 21.1450,
        lng: 70.5310,
        durationHours: 2.0,
        rating: 4.6,
        category: "Interpretation Zone",
        entryFee: "₹250",
        entryFeeNumeric: 250,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description: "Fenced eco-tourism zone offering guaranteed lion and chinkara sightings via safari bus."
      },
      {
        id: "kamleshwar-dam",
        name: "Kamleshwar Dam",
        lat: 21.1200,
        lng: 70.6200,
        durationHours: 1.5,
        rating: 4.4,
        category: "Nature",
        entryFee: "Free with Permit",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description: "Scenic reservoir in the heart of Gir, known as a marsh crocodile breeding site."
      },
      {
        id: "kankai-mata-temple",
        name: "Kankai Mata Temple",
        lat: 21.1000,
        lng: 70.5500,
        durationHours: 2.0,
        rating: 4.5,
        category: "Spiritual/Forest",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description: "Deep jungle shrine inside Gir forest, visited by pilgrims surrounded by wilderness."
      }
    ],
    hotels: [
      {
        id: "maldhari-homestay",
        name: "Maldhari Eco Homestay",
        lat: 21.1620,
        lng: 70.5990,
        pricePerNight: "₹2,500",
        priceNumeric: 2500,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Bhalchel Village",
        description: "Traditional Maldhari cattle-breeder hamlet offering organic farm meals.",
        valueScore: 94,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "toran-sasan-gir",
        name: "Toran Resort Sasan Gir",
        lat: 21.1600,
        lng: 70.5970,
        pricePerNight: "₹3,200",
        priceNumeric: 3200,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Sasan Gir Safari Office",
        description: "TCGL sanctuary lodge situated adjacent to the Sasan Gir Wildlife Permit Centre.",
        valueScore: 86,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "woods-at-sasan",
        name: "The Woods at Sasan",
        lat: 21.1650,
        lng: 70.6050,
        pricePerNight: "₹9,500",
        priceNumeric: 9500,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Sasan Forest Border",
        description: "Boutique eco-villa sanctuary immersed in mango orchards at the edge of lion territory.",
        valueScore: 62,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "kathiyawadi-zayka",
        name: "Kathiyawadi Zayka Dhaba",
        lat: 21.1630,
        lng: 70.6000,
        rating: 4.5,
        avgCostPerPerson: 220,
        location: "Sasan Highway",
        cuisine: "Kathiyawadi Sev Tameta & Ringan Bhartha"
      },
      {
        id: "sasan-jungle-view",
        name: "Jungle View Restaurant",
        lat: 21.1610,
        lng: 70.5960,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Safari Office Road",
        cuisine: "Gujarati & North Indian"
      },
      {
        id: "maldhari-rasoi",
        name: "Maldhari Farm Rasoi",
        lat: 21.1640,
        lng: 70.6020,
        rating: 4.6,
        avgCostPerPerson: 280,
        location: "Bhalchel Village",
        cuisine: "Organic Farm Thali"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "modhera",
    name: "Modhera",
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
    imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Carved stone architecture and stepped tank Ramakunda at Modhera Sun Temple",
    description: "Dedicated to the solar deity Surya, this 11th-century Solanki monument features a geometrically carved stepped tank (Ramakunda) with 108 miniature shrines.",
    highlights: ["Ramakunda Stepped Tank", "Equinox Sun Alignment", "Surya Dance Festival Grounds"],
    attractions: [
      {
        id: "modhera-sun-temple",
        name: "Modhera Sun Temple & Ramakunda",
        lat: 23.5836,
        lng: 72.1328,
        durationHours: 2.5,
        rating: 4.8,
        category: "Architecture/Stepwell",
        entryFee: "₹25",
        entryFeeNumeric: 25,
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=600",
        description: "Masterpiece of 11th-century Solanki stone carving with a 108-shrine stepped tank."
      },
      {
        id: "rani-ki-vav",
        name: "Rani Ki Vav Stepwell (Patan)",
        lat: 23.8589,
        lng: 72.1018,
        durationHours: 2.0,
        rating: 4.9,
        category: "UNESCO World Heritage Stepwell",
        entryFee: "₹40",
        entryFeeNumeric: 40,
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description: "7-storey inverted subterranean temple stepwell decorated with over 500 major sculptures."
      },
      {
        id: "patan-patola-house",
        name: "Patan Patola Weaving Guild",
        lat: 23.8510,
        lng: 72.1050,
        durationHours: 1.5,
        rating: 4.7,
        category: "Heritage Crafts",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description: "Authentic Salvi family double-ikat silk weaving guild and museum."
      },
      {
        id: "bahucharaji-shakti-peeth",
        name: "Bahucharaji Temple",
        lat: 23.4980,
        lng: 72.0620,
        durationHours: 1.0,
        rating: 4.5,
        category: "Spiritual",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description: "Historic Shakti Peeth temple complex known for colorful festival processions."
      }
    ],
    hotels: [
      {
        id: "toran-rani-ki-vav",
        name: "Toran Hotel Rani Ki Vav",
        lat: 23.8550,
        lng: 72.1030,
        pricePerNight: "₹2,400",
        priceNumeric: 2400,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Budget",
        stayType: "Toran Hotel",
        location: "Patan (Near Modhera)",
        description: "Official TCGL government bungalow with traditional Kathiawadi thali & stepwell proximity.",
        valueScore: 92,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "house-of-mg-circuit",
        name: "The House of MG (Heritage Base)",
        lat: 23.0230,
        lng: 72.5800,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Mid-range",
        stayType: "Heritage Hotel",
        location: "Mehsana Highway Circuit",
        description: "Restored Gaekwad-era mansion featuring Agashiye terrace dining & heritage rooms.",
        valueScore: 78,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "royal-oasis-palace",
        name: "Royal Oasis Palace Estate",
        lat: 22.8200,
        lng: 70.9600,
        pricePerNight: "₹7,800",
        priceNumeric: 7800,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Wankaner Estate",
        description: "Grand Art Deco palace estate set amidst 22 acres of private riverbank grounds.",
        valueScore: 68,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "solanki-heritage-dining",
        name: "Solanki Heritage Dining",
        lat: 23.5840,
        lng: 72.1330,
        rating: 4.4,
        avgCostPerPerson: 220,
        location: "Modhera Sun Temple Plaza",
        cuisine: "Gujarati Kathiyawadi Thali"
      },
      {
        id: "patan-kathiyawadi",
        name: "Patan Thali House",
        lat: 23.8560,
        lng: 72.1040,
        rating: 4.5,
        avgCostPerPerson: 200,
        location: "Near Rani Ki Vav Gate",
        cuisine: "Unlimited Traditional Meal"
      },
      {
        id: "stepwell-view-cafe",
        name: "Stepwell View Cafe",
        lat: 23.5820,
        lng: 72.1310,
        rating: 4.2,
        avgCostPerPerson: 280,
        location: "Modhera Bypass",
        cuisine: "Tea, Snacks & South Indian"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "champaner",
    name: "Champaner",
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
    imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Intricate arches and sandstone domes of Jama Masjid at Champaner-Pavagadh",
    description: "A UNESCO World Heritage site showcasing a pre-Mughal Islamic city, ancient fortresses, stepwells, and the sacred hilltop Kalika Mata Temple.",
    highlights: ["Jama Masjid Arched Courtyard", "Pavagadh Ropeway Ride", "Kevada Masjid Carvings"],
    attractions: [
      {
        id: "jama-masjid-champaner",
        name: "Jama Masjid Champaner",
        lat: 22.4860,
        lng: 73.5350,
        durationHours: 2.0,
        rating: 4.8,
        category: "UNESCO Mosque Architecture",
        entryFee: "₹40",
        entryFeeNumeric: 40,
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description: "15th-century Indo-Islamic architectural marvel with 172 carved pillars and twin minarets."
      },
      {
        id: "kalika-mata-ropeway",
        name: "Kalika Mata Temple Ropeway",
        lat: 22.4630,
        lng: 73.5220,
        durationHours: 2.5,
        rating: 4.6,
        category: "Hilltop Shrine",
        entryFee: "₹170 Ropeway",
        entryFeeNumeric: 170,
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
        description: "Sacred Shakti Peeth perched atop Pavagadh Hill accessible via ropeway cable car."
      },
      {
        id: "kevada-masjid",
        name: "Kevada & Nagina Masjid",
        lat: 22.4820,
        lng: 73.5310,
        durationHours: 1.5,
        rating: 4.5,
        category: "Heritage Monument",
        entryFee: "Free with Pass",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=600",
        description: "Serene forested mosques featuring exquisite floral niche carvings."
      },
      {
        id: "jambughoda-sanctuary",
        name: "Jambughoda Wildlife Sanctuary",
        lat: 22.3680,
        lng: 73.6520,
        durationHours: 2.0,
        rating: 4.4,
        category: "Nature",
        entryFee: "₹50",
        entryFeeNumeric: 50,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description: "Lush teak forest reserve with leopard habitat, bamboo groves, and reservoirs."
      }
    ],
    hotels: [
      {
        id: "champaner-homestay",
        name: "Pavagadh Valley Homestay",
        lat: 22.4800,
        lng: 73.5300,
        pricePerNight: "₹1,800",
        priceNumeric: 1800,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Budget",
        stayType: "Homestay",
        location: "Halol Highway",
        description: "Rustic organic farm stay near Pavagadh hill ropeway station with homemade Gujarati thali.",
        valueScore: 94,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "toran-champaner",
        name: "Toran Hotel Champaner",
        lat: 22.4850,
        lng: 73.5340,
        pricePerNight: "₹2,000",
        priceNumeric: 2000,
        rating: "4.5 ★",
        ratingNumeric: 4.5,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Pavagadh Foothills",
        description: "Government stay situated at the base of Pavagadh Hill with direct access to UNESCO sites.",
        valueScore: 91,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "jambughoda-palace",
        name: "Jambughoda Palace Estate",
        lat: 22.3700,
        lng: 73.6550,
        pricePerNight: "₹4,800",
        priceNumeric: 4800,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Jambughoda Sanctuary",
        description: "Ancestral Gaekwad principality estate offering organic farm walks and heritage suites.",
        valueScore: 82,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "pavagadh-foothills-thali",
        name: "Pavagadh Foothills Thali",
        lat: 22.4810,
        lng: 73.5310,
        rating: 4.4,
        avgCostPerPerson: 180,
        location: "Ropeway Base Plaza",
        cuisine: "Gujarati Thali"
      },
      {
        id: "champaner-heritage-rasoi",
        name: "Champaner Heritage Rasoi",
        lat: 22.4840,
        lng: 73.5330,
        rating: 4.5,
        avgCostPerPerson: 220,
        location: "Jama Masjid Road",
        cuisine: "Kathiyawadi & Snacks"
      },
      {
        id: "halol-junction-dining",
        name: "Halol Junction Restaurant",
        lat: 22.4900,
        lng: 73.5400,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Halol Highway",
        cuisine: "North Indian & Gujarati"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "saputara",
    name: "Saputara",
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
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Mist-covered green Sahyadri hills and Saputara Lake",
    description: "Gujarat's sole hill station nestled in the dense teak forests of the Dang district, featuring cool highland air, boating lakes, and Warli tribal artisan hamlets.",
    highlights: ["Saputara Lake Pedal Boating", "Pushpak Ropeway Cable Car", "Gira Waterfalls Monsoon Cascade"],
    attractions: [
      {
        id: "saputara-lake",
        name: "Saputara Lake & Boating",
        lat: 20.5750,
        lng: 73.7480,
        durationHours: 2.0,
        rating: 4.6,
        category: "Lake/Boating",
        entryFee: "₹100 Boat Ride",
        entryFeeNumeric: 100,
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
        description: "Serene highland lake surrounded by gardens, offering rowboats and pedal boats."
      },
      {
        id: "sunset-point-ropeway",
        name: "Sunset Point Cable Car",
        lat: 20.5820,
        lng: 73.7510,
        durationHours: 1.5,
        rating: 4.5,
        category: "Viewpoint",
        entryFee: "₹90 Cable Car",
        entryFeeNumeric: 90,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
        description: "Panoramic highland ridge offering cable car rides over Dang forest valleys."
      },
      {
        id: "gira-waterfalls",
        name: "Gira Waterfalls",
        lat: 20.7380,
        lng: 73.6120,
        durationHours: 2.0,
        rating: 4.7,
        category: "Waterfall",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description: "75ft monsoon waterfall cascading into Ambika River amidst bamboo thickets."
      },
      {
        id: "artist-village-saputara",
        name: "Artist Village Dang",
        lat: 20.5720,
        lng: 73.7450,
        durationHours: 1.5,
        rating: 4.4,
        category: "Tribal Crafts",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description: "Artisan cooperative demonstrating bamboo craft, pottery, and Warli paintings."
      }
    ],
    hotels: [
      {
        id: "dang-tribal-homestay",
        name: "Dang Bamboo Artisans Homestay",
        lat: 20.5700,
        lng: 73.7430,
        pricePerNight: "₹1,600",
        priceNumeric: 1600,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Waghai Village",
        description: "Authentic Dang tribal family stay surrounded by bamboo groves and Warli art workshops.",
        valueScore: 99,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "toran-saputara",
        name: "Toran Hill Resort Saputara",
        lat: 20.5740,
        lng: 73.7470,
        pricePerNight: "₹2,600",
        priceNumeric: 2600,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Lake Garden Road",
        description: "TCGL hilltop sanctuary with panoramic lake views and direct access to ropeway.",
        valueScore: 90,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "aakar-lords-inn",
        name: "Aakar Lords Inn Saputara",
        lat: 20.5810,
        lng: 73.7500,
        pricePerNight: "₹4,100",
        priceNumeric: 4100,
        rating: "4.7 ★",
        ratingNumeric: 4.7,
        tier: "Luxury",
        stayType: "Registered Hotel",
        location: "Sunset Point Road",
        description: "Highland valley resort featuring heated indoor pool and forest trail excursions.",
        valueScore: 82,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "lake-view-thali",
        name: "Lake View Gujarati Thali",
        lat: 20.5740,
        lng: 73.7460,
        rating: 4.4,
        avgCostPerPerson: 200,
        location: "Lake Garden Road",
        cuisine: "Gujarati Thali"
      },
      {
        id: "dang-tribal-kitchen",
        name: "Dang Tribal Spice Kitchen",
        lat: 20.5710,
        lng: 73.7440,
        rating: 4.5,
        avgCostPerPerson: 180,
        location: "Artist Village",
        cuisine: "Local Bamboo Shoot & Nagli Roti"
      },
      {
        id: "highland-cafe-saputara",
        name: "Highland Cafe Saputara",
        lat: 20.5800,
        lng: 73.7490,
        rating: 4.3,
        avgCostPerPerson: 250,
        location: "Sunset Point Plaza",
        cuisine: "Multi-Cuisine & Tea"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
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
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Traditional carved wooden Haveli facades in Old Ahmedabad Pols",
    description: "Founded in 1411 AD by Sultan Ahmed Shah, Ahmedabad is India's premier UNESCO World Heritage city featuring carved pols, stepwells, and Sabarmati Ashram.",
    highlights: ["Sabarmati Ashram Quiet Courtyards", "Adalaj Stepwell Intricate Carvings", "Agashiye Rooftop Dining"],
    attractions: [
      {
        id: "sabarmati-ashram",
        name: "Sabarmati Ashram",
        lat: 23.0601,
        lng: 72.5808,
        durationHours: 2.0,
        rating: 4.8,
        category: "Heritage/National Monument",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        description: "Historical riverside headquarters of Mahatma Gandhi during the Indian freedom movement."
      },
      {
        id: "adalaj-stepwell",
        name: "Adalaj Ni Vav Stepwell",
        lat: 23.1667,
        lng: 72.5801,
        durationHours: 1.5,
        rating: 4.8,
        category: "Stepwell Architecture",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=600",
        description: "5-story subterranean stepwell built in 1498 with intricate Solanki floral stone carvings."
      },
      {
        id: "sidi-saiyyed-mosque",
        name: "Sidi Saiyyed Mosque & Old Pols",
        lat: 23.0260,
        lng: 72.5810,
        durationHours: 2.0,
        rating: 4.7,
        category: "UNESCO Heritage City",
        entryFee: "Free",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600",
        description: "World-renowned stone latticework 'Tree of Life' jali windows and heritage pols."
      },
      {
        id: "calico-museum",
        name: "Calico Textile Museum",
        lat: 23.0530,
        lng: 72.5920,
        durationHours: 2.0,
        rating: 4.9,
        category: "Museum",
        entryFee: "Free (Prior Booking)",
        entryFeeNumeric: 0,
        imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&q=80&w=600",
        description: "World-class collection of Indian court textiles, brocades, and double-ikat weaves."
      }
    ],
    hotels: [
      {
        id: "french-haveli",
        name: "French Haveli Heritage Stay",
        lat: 23.0210,
        lng: 72.5890,
        pricePerNight: "₹3,400",
        priceNumeric: 3400,
        rating: "4.8 ★",
        ratingNumeric: 4.8,
        tier: "Budget",
        stayType: "Homestay",
        location: "Dhal ni Pol, Old City",
        description: "Restored 150-year-old carved wooden Haveli tucked inside Dhal ni Pol in the Old City.",
        valueScore: 91,
        imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "toran-gandhi-ashram",
        name: "Toran Gandhi Ashram Hotel",
        lat: 23.0610,
        lng: 72.5820,
        pricePerNight: "₹2,800",
        priceNumeric: 2800,
        rating: "4.6 ★",
        ratingNumeric: 4.6,
        tier: "Mid-range",
        stayType: "Toran Hotel",
        location: "Sabarmati Riverfront",
        description: "Peaceful TCGL rest house overlooking the Sabarmati Riverfront directly opposite Gandhi Ashram.",
        valueScore: 89,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "house-of-mg-ahmedabad",
        name: "The House of MG",
        lat: 23.0250,
        lng: 72.5825,
        pricePerNight: "₹6,200",
        priceNumeric: 6200,
        rating: "4.9 ★",
        ratingNumeric: 4.9,
        tier: "Luxury",
        stayType: "Heritage Hotel",
        location: "Opposite Sidi Saiyyed Mosque",
        description: "Award-winning grand heritage hotel facing Sidi Saiyyed Jali with rooftop Agashiye dining.",
        valueScore: 80,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600"
      }
    ],
    restaurants: [
      {
        id: "agashiye-terrace",
        name: "Agashiye Terrace Restaurant",
        lat: 23.0251,
        lng: 72.5826,
        rating: 4.9,
        avgCostPerPerson: 850,
        location: "The House of MG",
        cuisine: "Royal Gujarati Terrace Thali"
      },
      {
        id: "vishalla-heritage",
        name: "Vishalla Village Restaurant",
        lat: 22.9900,
        lng: 72.5300,
        rating: 4.7,
        avgCostPerPerson: 650,
        location: "Vasna, Ahmedabad",
        cuisine: "Traditional Village Style Thali"
      },
      {
        id: "chandravilas-dining",
        name: "Chandravilas Dining Hall",
        lat: 23.0240,
        lng: 72.5860,
        rating: 4.5,
        avgCostPerPerson: 220,
        location: "Gandhi Road, Old City",
        cuisine: "Classic Gujarati Meal"
      }
    ],
    get nearbyAttractions() {
      return this.attractions.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        distance: "Intra-city",
        imageUrl: a.imageUrl || ""
      }));
    },
    get nearbyHotels() {
      return this.hotels;
    }
  }
];

// Conceptual HashMap lookup for city ID -> City object
export function getCityById(id: string): Destination | undefined {
  if (!id) return GUJARAT_DESTINATIONS[0];
  return GUJARAT_DESTINATIONS.find(c => c.id.toLowerCase() === id.toLowerCase());
}
