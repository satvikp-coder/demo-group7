export type Language = "en" | "hi";

export interface TranslationDictionary {
  [key: string]: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // Navbar & Navigation
    "nav.brand": "Gujarat Heritage Directory",
    "nav.subtitle": "Stepwell Geometric Itinerary Engine",
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.hotels": "Ranked Stays",
    "nav.visualizer": "Route Calculator",
    "nav.budget": "Budget Planner",
    "nav.savedTrip": "Saved Trip",
    "nav.signIn": "Sign In",
    "nav.login": "Log In",
    "nav.profile": "Profile & History",
    "nav.admin": "Admin Panel",
    "nav.planItinerary": "Plan Itinerary",

    // Category Taxonomy
    "cat.all": "All Categories",
    "cat.heritage": "Heritage Sites",
    "cat.unesco": "UNESCO World Heritage Site",
    "cat.religious": "Religious Sites",
    "cat.beaches": "Beaches",
    "cat.birds": "Bird Watching Sites",
    "cat.museums": "Museums",
    "cat.weekend": "Weekend Get-aways",

    // Hero Section
    "hero.badge": "Stepwell Geometric Itinerary Engine",
    "hero.tagline":
      "Explore 10 Gujarat heritage sites—from the 11th-century carved sun temple of Modhera to the salt expanses of Kutch and Gir lion reserves. Structured routes, authentic craft guilds, and ledger-precise travel expenses.",
    "hero.startPlanning": "Start planning",
    "hero.browseSites": "Browse 10 Heritage Sites",
    "hero.statSites": "10 Monuments",
    "hero.statData": "Intra-City Engine",
    "hero.statPrecision": "Km & Fee Ledger",

    // ValueProps Section
    "valueProps.headerBadge": "System Architecture & Purpose",
    "valueProps.title": "Why this exists",
    "valueProps.prop1Title": "Geometric Route Precision",
    "valueProps.prop1Desc":
      "Calculates intra-city distances, visitation times, and daily circular legs starting and ending at your accommodation base.",
    "valueProps.prop2Title": "Authentic Heritage Stays",
    "valueProps.prop2Desc":
      "Verified Toran government hotels, restored 1920s merchant havelis, and eco-homestays ranked by location and hospitality.",
    "valueProps.prop3Title": "Verified Expenses",
    "valueProps.prop3Desc":
      "Exact ASI monument entry fees, local thali dining rates, and transit fuel estimates logged in an exportable budget ledger.",
    "explore.title": "Explore Heritage Monuments",
    "explore.searchPlaceholder": "Search destinations or districts...",
    "explore.allCategories": "All Categories",
    "explore.resetFilters": "Reset Filters",
    "explore.inspectSite": "Inspect Site",
    "explore.plan": "Plan",
    "explore.emptyTitle": "No Heritage Destinations Found",
    "explore.emptyText":
      "No monuments match your current search terms or category selection.",

    // Destination Detail View
    "destination.back": "Back to All Sites",
    "destination.overview": "Overview",
    "destination.highlights": "Key Highlights",
    "destination.attractions": "Intra-City Attractions",
    "destination.hotels": "Heritage Stays & Havelis",
    "destination.restaurants": "Local Culinary Delights",
    "destination.addToTrip": "Add to Trip",
    "destination.removeFromTrip": "Remove from Trip",
    "destination.planItinerary": "Plan Itinerary",
    "destination.setPreferred": "Set as Preferred Stay",
    "destination.preferredSelected": "Preferred Stay Selected",

    // Planner Modal
    "planner.title": "Stepwell Itinerary Generator",
    "planner.selectCity": "Select Destination",
    "planner.days": "Trip Duration",
    "planner.budget": "Total Budget (₹)",
    "planner.startingHotel": "Starting Hotel / Stay",
    "planner.startingBase": "Daily Starting Base",
    "planner.startingTime": "Starting Time",
    "planner.dailyStartTime": "Daily Start Time",
    "planner.generate": "Generate Itinerary",
    "planner.generateItinerary": "Generate Circular Plan",
    "planner.cancel": "Cancel",

    // Itinerary View
    "itinerary.title": "Generated Itinerary",
    "itinerary.backToPlanner": "Back to Planner",
    "itinerary.totalDistance": "Total Distance",
    "itinerary.totalCost": "Total Estimated Cost",
    "itinerary.dailyRoute": "Daily Circular Route",
    "itinerary.baseHotel": "Base Hotel",
    "itinerary.exportPdf": "Export PDF",
    "itinerary.openLedger": "Open Budget Ledger",

    // Shortest Path Route Calculator (Dijkstra)
    "dijkstra.title": "Shortest Path Route Calculator",
    "dijkstra.subtitle":
      "Dijkstra Graph Algorithm Engine across Gujarat Circuit Nodes",
    "dijkstra.source": "Select Source City",
    "dijkstra.target": "Select Target City",
    "dijkstra.calculate": "Calculate Optimal Route",
    "dijkstra.routeResult": "Step-by-step Route",

    // Budget Planner View
    "budget.title": "Trip Budget Ledger",
    "budget.totalExpense": "Total Estimated Expense",
    "budget.fees": "Monuments Entry Fees",
    "budget.stayCosts": "Stay Costs",
    "budget.foodTransit": "Food & Transit",
    "budget.adjust": "Adjust Budget",
    "budget.backToItinerary": "Back to Itinerary",

    // Hotels View
    "hotels.title": "Preserved Heritage Accommodations",
    "hotels.filterTier": "Filter by Tier",
    "hotels.filterType": "Filter by Type",

    // Profile View
    "profile.title": "User Profile & Saved Routes",
    "profile.savedItineraries": "Saved Itineraries",
    "profile.preferredStays": "Preferred Stays",
    "profile.signOut": "Sign Out",

    // Admin View
    "admin.title": "Admin Control Panel",
    "admin.metrics": "System Metrics",
    "admin.destinationManagement": "Destination Management",

    // Auth & Footer
    "auth.title": "Heritage Directory Account",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.register": "Register",
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.guest": "Continue as Guest",

    "footer.brand": "Heritage Tourism Planner",
    "footer.description":
      "An architectural and cultural route ledger for Gujarat’s stepwells, sun temples, salt deserts, and sacred coastlines. Structured for conscious travelers and heritage preservation.",
    "footer.rights": "All rights reserved. Gujarat Heritage Tourism Board.",

    "common.plan_trip": "Plan Custom Route",
  },
  hi: {
    // Navbar & Navigation
    "nav.brand": "गुजरात विरासत निर्देशिका",
    "nav.subtitle": "स्टेपवेल ज्यामितीय यात्रा इंजन",
    "nav.home": "मुख्य पृष्ठ",
    "nav.explore": "एक्सप्लोर करें",
    "nav.hotels": "रैंक किए गए आवास",
    "nav.visualizer": "मार्ग कैलकुलेटर",
    "nav.budget": "बजट प्लानर",
    "nav.savedTrip": "सहेजी गई यात्रा",
    "nav.signIn": "साइन इन",
    "nav.login": "लॉग इन",
    "nav.profile": "प्रोफ़ाइल और इतिहास",
    "nav.admin": "एडमिन पैनल",
    "nav.planItinerary": "यात्रा योजना बनाएं",

    // Category Taxonomy
    "cat.all": "सभी श्रेणियां",
    "cat.heritage": "विरासत स्थल",
    "cat.unesco": "यूनेस्को विश्व धरोहर स्थल",
    "cat.religious": "धार्मिक स्थल",
    "cat.beaches": "समुद्र तट",
    "cat.birds": "पक्षी अवलोकन स्थल",
    "cat.museums": "संग्रहालय",
    "cat.weekend": "वीकेंड गेटअवे",

    // Hero Section
    "hero.badge": "स्टेपवेल ज्यामितीय यात्रा इंजन",
    "hero.tagline":
      "गुजरात के 10 विरासत स्थलों की खोज करें—मोढेरा के 11वीं सदी के सूर्य मंदिर से लेकर कच्छ के रण और गिर सिंह अभयारण्य तक। व्यवस्थित मार्ग और सटीक बजट गणना।",
    "hero.startPlanning": "योजना शुरू करें",
    "hero.browseSites": "10 विरासत स्थल देखें",
    "hero.statSites": "10 स्मारक",
    "hero.statData": "शहर-आंतरिक इंजन",
    "hero.statPrecision": "किमी और शुल्क बहीखाता",

    // ValueProps Section
    "valueProps.headerBadge": "सिस्टम आर्किटेक्चर और उद्देश्य",
    "valueProps.title": "यह क्यों बनाया गया है",
    "valueProps.prop1Title": "ज्यामितीय मार्ग सटीकता",
    "valueProps.prop1Desc":
      "शहर के भीतर की दूरी, दर्शन समय और दैनिक वृत्ताकार मार्गों की गणना करता है।",
    "valueProps.prop2Title": "प्रामाणिक विरासत आवास",
    "valueProps.prop2Desc":
      "सत्यापित तोरण सरकारी होटल, पुनर्निर्मित हवेलियां और होमस्टे।",
    "valueProps.prop3Title": "सत्यापित व्यय",
    "valueProps.prop3Desc":
      "सटीक एएसआई स्मारक प्रवेश शुल्क, स्थानीय थाली दरें और परिवहन बजट बहीखाता।",

    // Explore View
    "explore.title": "विरासत स्मारकों की खोज करें",
    "explore.searchPlaceholder": "गंतव्य या जिले खोजें...",
    "explore.allCategories": "सभी श्रेणियां",
    "explore.resetFilters": "फ़िल्टर रीसेट करें",
    "explore.inspectSite": "स्थल देखें",
    "explore.plan": "योजना",
    "explore.emptyTitle": "कोई विरासत गंतव्य नहीं मिला",
    "explore.emptyText":
      "आपकी खोज या श्रेणी चयन से कोई भी स्मारक मेल नहीं खाता।",

    // Destination Detail View
    "destination.back": "सभी स्थलों पर वापस जाएं",
    "destination.overview": "अवलोकन",
    "destination.highlights": "मुख्य आकर्षण",
    "destination.attractions": "शहर के आंतरिक आकर्षण",
    "destination.hotels": "विरासत होटल और हवेलियां",
    "destination.restaurants": "स्थानीय व्यंजन",
    "destination.addToTrip": "यात्रा में जोड़ें",
    "destination.removeFromTrip": "यात्रा से हटाएं",
    "destination.planItinerary": "मार्ग योजना बनाएं",
    "destination.setPreferred": "पसंदीदा प्रवास के रूप में सेट करें",
    "destination.preferredSelected": "पसंदीदा प्रवास चुना गया",

    // Planner Modal
    "planner.title": "स्टेपवेल यात्रा योजनाकार",
    "planner.selectCity": "गंतव्य चुनें",
    "planner.days": "यात्रा के दिन",
    "planner.budget": "कुल बजट (₹)",
    "planner.startingHotel": "प्रारंभिक होटल / प्रवास",
    "planner.startingBase": "दैनिक प्रारंभिक आधार",
    "planner.startingTime": "प्रारंभ समय",
    "planner.dailyStartTime": "दैनिक प्रारंभ समय",
    "planner.generate": "मार्ग बनाएं",
    "planner.generateItinerary": "वृत्ताकार योजना बनाएं",
    "planner.cancel": "रद्द करें",

    // Itinerary View
    "itinerary.title": "जनरेट किया गया यात्रा मार्ग",
    "itinerary.backToPlanner": "योजनाकार पर वापस जाएं",
    "itinerary.totalDistance": "कुल दूरी",
    "itinerary.totalCost": "कुल अनुमानित लागत",
    "itinerary.dailyRoute": "दैनिक वृत्ताकार मार्ग",
    "itinerary.baseHotel": "बेस होटल",
    "itinerary.exportPdf": "PDF निर्यात करें",
    "itinerary.openLedger": "बजट बहीखाता खोलें",

    // Shortest Path Route Calculator (Dijkstra)
    "dijkstra.title": "न्यूनतम पथ मार्ग कैलकुलेटर",
    "dijkstra.subtitle":
      "गुजरात सर्किट नोड्स पर डाइकस्ट्रा ग्राफ एल्गोरिदम इंजन",
    "dijkstra.source": "प्रारंभिक शहर चुनें",
    "dijkstra.target": "लक्ष्य शहर चुनें",
    "dijkstra.calculate": "अनुकूलतम मार्ग की गणना करें",
    "dijkstra.routeResult": "चरण-दर-चरण मार्ग",

    // Budget Planner View
    "budget.title": "यात्रा बजट बहीखाता",
    "budget.totalExpense": "कुल अनुमानित खर्च",
    "budget.fees": "स्मारक प्रवेश शुल्क",
    "budget.stayCosts": "रहने का खर्च",
    "budget.foodTransit": "भोजन और परिवहन",
    "budget.adjust": "बजट समायोजित करें",
    "budget.backToItinerary": "यात्रा मार्ग पर वापस जाएं",

    // Hotels View
    "hotels.title": "संरक्षित विरासत आवास",
    "hotels.filterTier": "श्रेणी के अनुसार फ़िल्टर करें",
    "hotels.filterType": "प्रकार के अनुसार फ़िल्टर करें",

    // Profile View
    "profile.title": "उपयोगकर्ता प्रोफ़ाइल और सहेजे गए मार्ग",
    "profile.savedItineraries": "सहेजे गए यात्रा मार्ग",
    "profile.preferredStays": "पसंदीदा प्रवास",
    "profile.signOut": "साइन आउट",

    // Admin View
    "admin.title": "एडमिन नियंत्रण पैनल",
    "admin.metrics": "सिस्टम मेट्रिक्स",
    "admin.destinationManagement": "गंतव्य प्रबंधन",

    // Auth & Footer
    "auth.title": "हेरिटेज डायरेक्टरी खाता",
    "auth.email": "ईमेल पता",
    "auth.password": "पासवर्ड",
    "auth.register": "पंजीकरण करें",
    "auth.login": "लॉग इन",
    "auth.signup": "साइन अप",
    "auth.guest": "अतिथि के रूप में जारी रखें",

    "footer.brand": "हेरिटेज टूरिज़्म प्लानर",
    "footer.description":
      "गुजरात की वाव, सूर्य मंदिरों और तटरेखाओं के लिए सांस्कृतिक मार्ग दर्शिका।",
    "footer.rights": "सर्वाधिकार सुरक्षित। गुजरात हेरिटेज टूरिज़्म बोर्ड।",

    "common.plan_trip": "कस्टम मार्ग की योजना बनाएं",
  },
};

// Backward compatibility map for any legacy UI_TRANSLATIONS access
export interface UIStrings {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const UI_TRANSLATIONS: UIStrings = new Proxy(
  {},
  {
    get: (_, key: string) => {
      return {
        en: TRANSLATIONS.en[key] || key,
        hi: TRANSLATIONS.hi[key] || TRANSLATIONS.en[key] || key,
      };
    },
  },
);
