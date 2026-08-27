import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, ".translation-cache.json");
const DESTINATIONS_FILE = path.join(__dirname, "../src/data/destinations.ts");
const TRANSLATIONS_FILE = path.join(__dirname, "../src/data/translations.ts");

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const LIBRETRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL || "http://localhost:5000/translate";
const TRANSLATION_ENGINE =
  process.env.TRANSLATION_ENGINE || (API_KEY ? "google" : "libretranslate");

interface TranslationCache {
  [lang: string]: {
    [sourceText: string]: string;
  };
}

// Load existing cache if any
function loadCache(): TranslationCache {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch {
      return { gu: {}, hi: {} };
    }
  }
  return { gu: {}, hi: {} };
}

function saveCache(cache: TranslationCache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

let totalApiCalls = 0;
let totalCharacters = 0;
let totalStringsTranslated = 0;
const failedStrings: string[] = [];

// Helper to batch translate an array of strings to a target language
async function batchTranslate(
  texts: string[],
  targetLang: "gu" | "hi",
  cache: TranslationCache,
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  if (texts.length === 0) return resultMap;

  if (!cache[targetLang]) {
    cache[targetLang] = {};
  }

  const toFetch: string[] = [];
  const uniqueTexts = Array.from(new Set(texts.filter(Boolean)));

  for (const text of uniqueTexts) {
    if (cache[targetLang][text]) {
      resultMap.set(text, cache[targetLang][text]);
    } else {
      toFetch.push(text);
    }
  }

  if (toFetch.length === 0) {
    return resultMap;
  }

  if (TRANSLATION_ENGINE === "libretranslate") {
    console.log(`Using LibreTranslate at ${LIBRETRANSLATE_URL}...`);
    // Batch in smaller chunks of 20 for LibreTranslate local server
    const BATCH_SIZE = 20;
    for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
      const chunk = toFetch.slice(i, i + BATCH_SIZE);
      totalApiCalls++;
      const chunkCharLength = chunk.reduce((acc, str) => acc + str.length, 0);
      totalCharacters += chunkCharLength;

      try {
        const response = await fetch(LIBRETRANSLATE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: chunk,
            source: "en",
            target: targetLang,
            format: "text",
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(
            `LibreTranslate API Error ${response.status}: ${errText}`,
          );
        }

        const data = await response.json();
        let translatedList: string[] = [];

        if (Array.isArray(data)) {
          translatedList = data.map((item: any) => item.translatedText || item);
        } else if (data && Array.isArray(data.translatedText)) {
          translatedList = data.translatedText;
        } else if (data && typeof data.translatedText === "string") {
          translatedList = [data.translatedText];
        }

        for (let j = 0; j < chunk.length; j++) {
          const original = chunk[j];
          const translated = translatedList[j] || original;
          cache[targetLang][original] = translated;
          resultMap.set(original, translated);
          totalStringsTranslated++;
        }
      } catch (err: any) {
        console.error(
          `Failed LibreTranslate chunk for '${targetLang}': ${err.message}`,
        );
        console.warn(
          `Falling back to individual item translation for chunk...`,
        );
        // Try item by item if batch endpoint structure differed
        for (const original of chunk) {
          try {
            totalApiCalls++;
            const singleRes = await fetch(LIBRETRANSLATE_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: original,
                source: "en",
                target: targetLang,
                format: "text",
              }),
            });
            if (singleRes.ok) {
              const singleData = await singleRes.json();
              const translated = singleData.translatedText || original;
              cache[targetLang][original] = translated;
              resultMap.set(original, translated);
              totalStringsTranslated++;
            } else {
              failedStrings.push(
                `[${targetLang}] ${original.substring(0, 30)}...`,
              );
            }
          } catch {
            failedStrings.push(
              `[${targetLang}] ${original.substring(0, 30)}...`,
            );
          }
        }
      }
    }
  } else {
    // Google Cloud Translation API
    if (!API_KEY) {
      console.error(
        `\nERROR: Neither GOOGLE_TRANSLATE_API_KEY is set nor LibreTranslate is reachable.`,
      );
      console.error(
        `Please provide GOOGLE_TRANSLATE_API_KEY in .env OR run LibreTranslate on http://localhost:5000\n`,
      );
      process.exit(1);
    }

    // Batch in chunks of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
      const chunk = toFetch.slice(i, i + BATCH_SIZE);
      totalApiCalls++;
      const chunkCharLength = chunk.reduce((acc, str) => acc + str.length, 0);
      totalCharacters += chunkCharLength;

      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: chunk,
            source: "en",
            target: targetLang,
            format: "text",
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const translations = data.data?.translations || [];

        for (let j = 0; j < chunk.length; j++) {
          const original = chunk[j];
          const translated = translations[j]?.translatedText || original;
          cache[targetLang][original] = translated;
          resultMap.set(original, translated);
          totalStringsTranslated++;
        }
      } catch (err: any) {
        console.error(
          `Failed Google Cloud chunk for target '${targetLang}':`,
          err.message,
        );
        for (const str of chunk) {
          failedStrings.push(`[${targetLang}] ${str.substring(0, 30)}...`);
        }
      }
    }
  }

  saveCache(cache);
  return resultMap;
}

async function run() {
  console.log("Starting Google Cloud Translation batch script...");
  const cache = loadCache();

  // Import destinations data dynamically
  const { GUJARAT_DESTINATIONS, OFFICIAL_CATEGORIES } =
    await import("../src/data/destinations.js");
  const { UI_TRANSLATIONS } = await import("../src/data/translations.js");

  console.log(
    `Loaded ${GUJARAT_DESTINATIONS.length} destinations and ${Object.keys(UI_TRANSLATIONS).length} UI translation keys.`,
  );

  // 1. Collect all texts from destinations
  const destinationTexts = new Set<string>();

  for (const dest of GUJARAT_DESTINATIONS) {
    if (dest.name) destinationTexts.add(dest.name);
    if (dest.description) destinationTexts.add(dest.description);

    for (const attr of dest.attractions || []) {
      if (attr.name) destinationTexts.add(attr.name);
      if (attr.description) destinationTexts.add(attr.description);
    }

    for (const hotel of dest.hotels || []) {
      if (hotel.name) destinationTexts.add(hotel.name);
      if (hotel.description) destinationTexts.add(hotel.description);
    }

    for (const rest of dest.restaurants || []) {
      if (rest.name) destinationTexts.add(rest.name);
    }

    for (const nearby of dest.nearbyAttractions || []) {
      if (nearby.name) destinationTexts.add(nearby.name);
    }
  }

  // 2. Collect all UI translation texts
  const uiTexts = new Set<string>();
  for (const key of Object.keys(UI_TRANSLATIONS)) {
    if (UI_TRANSLATIONS[key].en) {
      uiTexts.add(UI_TRANSLATIONS[key].en);
    }
  }

  const allTextsArray = Array.from(new Set([...destinationTexts, ...uiTexts]));
  console.log(
    `Found ${allTextsArray.length} unique English strings to translate.`,
  );

  // Translate to Gujarati and Hindi
  console.log("Requesting translations for Gujarati (gu)...");
  const guMap = await batchTranslate(allTextsArray, "gu", cache);

  console.log("Requesting translations for Hindi (hi)...");
  const hiMap = await batchTranslate(allTextsArray, "hi", cache);

  // Apply translations to GUJARAT_DESTINATIONS
  const updatedDestinations = GUJARAT_DESTINATIONS.map((dest: any) => {
    return {
      ...dest,
      gujaratiName: guMap.get(dest.name) || dest.name,
      hindiName: hiMap.get(dest.name) || dest.name,
      gujaratiDescription: guMap.get(dest.description) || dest.description,
      hindiDescription: hiMap.get(dest.description) || dest.description,
      attractions: (dest.attractions || []).map((attr: any) => ({
        ...attr,
        gujaratiName: guMap.get(attr.name) || attr.name,
        hindiName: hiMap.get(attr.name) || attr.name,
        gujaratiDescription: attr.description
          ? guMap.get(attr.description) || attr.description
          : undefined,
        hindiDescription: attr.description
          ? hiMap.get(attr.description) || attr.description
          : undefined,
      })),
      hotels: (dest.hotels || []).map((hotel: any) => ({
        ...hotel,
        gujaratiName: guMap.get(hotel.name) || hotel.name,
        hindiName: hiMap.get(hotel.name) || hotel.name,
        gujaratiDescription: hotel.description
          ? guMap.get(hotel.description) || hotel.description
          : undefined,
        hindiDescription: hotel.description
          ? hiMap.get(hotel.description) || hotel.description
          : undefined,
      })),
      restaurants: (dest.restaurants || []).map((rest: any) => ({
        ...rest,
        gujaratiName: guMap.get(rest.name) || rest.name,
        hindiName: hiMap.get(rest.name) || rest.name,
      })),
      nearbyAttractions: (dest.nearbyAttractions || []).map((nearby: any) => ({
        ...nearby,
        gujaratiName: guMap.get(nearby.name) || nearby.name,
        hindiName: hiMap.get(nearby.name) || nearby.name,
      })),
    };
  });

  // Apply translations to UI_TRANSLATIONS
  const updatedTranslations: Record<
    string,
    { en: string; gu: string; hi: string }
  > = {};
  for (const key of Object.keys(UI_TRANSLATIONS)) {
    const enText = UI_TRANSLATIONS[key].en;
    updatedTranslations[key] = {
      en: enText,
      gu: guMap.get(enText) || UI_TRANSLATIONS[key].gu || enText,
      hi: hiMap.get(enText) || UI_TRANSLATIONS[key].hi || enText,
    };
  }

  // Write back to src/data/destinations.ts
  console.log("Writing updated data to src/data/destinations.ts...");
  const destinationsFileContent = `export interface Attraction {
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

export const OFFICIAL_CATEGORIES = ${JSON.stringify(OFFICIAL_CATEGORIES, null, 2)} as const;

export const GUJARAT_DESTINATIONS: Destination[] = ${JSON.stringify(updatedDestinations, null, 2)};

export function getCityById(id: string): Destination | undefined {
  return GUJARAT_DESTINATIONS.find((d) => d.id === id);
}
`;

  fs.writeFileSync(DESTINATIONS_FILE, destinationsFileContent, "utf-8");

  // Write back to src/data/translations.ts
  console.log("Writing updated data to src/data/translations.ts...");
  const translationsFileContent = `export interface UIStrings {
  [key: string]: {
    en: string;
    gu: string;
    hi: string;
  };
}

export const UI_TRANSLATIONS: UIStrings = ${JSON.stringify(updatedTranslations, null, 2)};
`;

  fs.writeFileSync(TRANSLATIONS_FILE, translationsFileContent, "utf-8");

  console.log("\n=================== SUMMARY ===================");
  console.log(`Total Strings Processed: ${allTextsArray.length}`);
  console.log(`Total New Strings Translated: ${totalStringsTranslated}`);
  console.log(`Total API Network Calls Made: ${totalApiCalls}`);
  console.log(
    `Total Characters Sent to API: ${totalCharacters} / 500,000 free-tier monthly limit`,
  );
  if (failedStrings.length > 0) {
    console.log(`Failed Strings (${failedStrings.length}):`);
    failedStrings.forEach((s) => console.log(`   - ${s}`));
  } else {
    console.log(`All strings translated successfully with zero errors!`);
  }
  console.log("===============================================\n");
}

run().catch((err) => {
  console.error("Fatal execution error:", err);
  process.exit(1);
});
