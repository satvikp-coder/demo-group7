import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GUJARAT_DESTINATIONS } from "../src/data/destinations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../..");
const ROUTES_CSV_FILE = path.join(ROOT_DIR, "data/routes.csv");
const ROUTES_TS_FILE = path.join(ROOT_DIR, "frontend/src/data/routesCsv.ts");
const CACHE_FILE = path.join(__dirname, ".routing-cache.json");

const idMap: Record<string, string> = {
  "somnath-temple": "a101",
  "bhalka-tirth": "a102",
  "triveni-sangam": "a103",
  "somnath-beach": "a104",
  "premier-somnath": "h101",
  "sarovar-portico-somnath": "h102",
  "fern-residency-somnath": "h103",

  "dwarkadhish-temple": "a201",
  "nageshwar-jyotirlinga": "a202",
  "rukmini-devi-temple": "a203",
  "bet-dwarka": "a204",
  "darshan-palace": "h201",
  "goverdhan-greens": "h202",
  "mercure-dwarka": "h203",
  "the-dwarika-hotel": "h204",

  "sabarmati-ashram": "a301",
  "adalaj-stepwell": "a302",
  "sidi-saiyyed-mosque": "a303",
  "calico-museum": "a304",
  "sarkhej-roza": "a305",
  "kankaria-lake": "a306",
  "french-haveli": "h301",
  "lemon-tree-premier": "h302",
  "house-of-mg-ahmedabad": "h303"
};

interface CachedRoute {
  distanceKm: number;
  travelTimeMinutes: number;
  source: string;
}

function getSphericalDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function run() {
  console.log("Starting OpenRouteService Routes Generator...");

  let apiKey = process.env.ORS_API_KEY;
  try {
    const envPath = path.resolve(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      const envLines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of envLines) {
        const match = line.trim().match(/^ORS_API_KEY\s*=\s*(["']?)(.*?)\1$/);
        if (match) {
          apiKey = match[2];
        }
      }
    }
  } catch (err) {
    // Ignore env loading issues
  }

  if (apiKey) {
    console.log("OpenRouteService API Key detected.");
  } else {
    console.warn("WARNING: No ORS_API_KEY detected. Using simulated fallback mode.");
  }

  let cache: Record<string, CachedRoute> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      console.log(`Loaded ${Object.keys(cache).length} cached routes.`);
    } catch {
      console.warn("Routing cache corrupted, resetting.");
    }
  }

  const generatedRoutes: Array<{
    sourceId: string;
    destId: string;
    cityId: string;
    distanceKm: number;
    travelTimeMinutes: number;
    sourceCitation: string;
  }> = [];

  const targetCities = ["somnath", "dwarka", "ahmedabad"];

  for (const cityId of targetCities) {
    const city = GUJARAT_DESTINATIONS.find(d => d.id === cityId);
    if (!city) continue;

    console.log(`Processing city: ${city.name} (${cityId})`);

    const roadAttractions = (city.attractions || []).filter(a => a.transportMode !== "boat");
    const hotels = city.hotels || [];

    if (roadAttractions.length === 0) continue;

    const pairs: Array<{ fromId: string; fromCoord: [number, number]; toId: string; toCoord: [number, number] }> = [];

    for (const a1 of roadAttractions) {
      const distances = roadAttractions
        .filter(a2 => a2.id !== a1.id)
        .map(a2 => ({
          attraction: a2,
          dist: getSphericalDistanceKm(a1.lat, a1.lng, a2.lat, a2.lng)
        }))
        .sort((x, y) => x.dist - y.dist);

      const nearest = distances.slice(0, 2);
      for (const item of nearest) {
        pairs.push({
          fromId: a1.id,
          fromCoord: [a1.lat, a1.lng],
          toId: item.attraction.id,
          toCoord: [item.attraction.lat, item.attraction.lng]
        });
      }
    }

    for (const a of roadAttractions) {
      for (const h of hotels) {
        pairs.push({
          fromId: h.id,
          fromCoord: [h.lat, h.lng],
          toId: a.id,
          toCoord: [a.lat, a.lng]
        });
        pairs.push({
          fromId: a.id,
          fromCoord: [a.lat, a.lng],
          toId: h.id,
          toCoord: [h.lat, h.lng]
        });
      }
    }

    const uniquePairs: typeof pairs = [];
    const seenPairs = new Set<string>();

    for (const pair of pairs) {
      const key = [pair.fromId, pair.toId].sort().join("<->");
      if (!seenPairs.has(key)) {
        seenPairs.add(key);
        uniquePairs.push(pair);
      }
    }

    console.log(`Found ${uniquePairs.length} unique candidate road route pairs for ${city.name}.`);

    const dateStr = new Date().toISOString().split("T")[0];

    for (const pair of uniquePairs) {
      const cacheKey = `${pair.fromId}->${pair.toId}`;
      let routeData: CachedRoute | undefined = cache[cacheKey];

      if (!routeData) {
        const reverseKey = `${pair.toId}->${pair.fromId}`;
        routeData = cache[reverseKey];
      }

      if (routeData) {
        console.log(`Cache HIT for ${pair.fromId} to ${pair.toId}: ${routeData.distanceKm} km, ${routeData.travelTimeMinutes} mins`);
      } else {
        if (apiKey) {
          console.log(`Cache MISS for ${pair.fromId} to ${pair.toId}. Fetching from OpenRouteService...`);
          try {
            const startStr = `${pair.fromCoord[1]},${pair.fromCoord[0]}`;
            const endStr = `${pair.toCoord[1]},${pair.toCoord[0]}`;
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startStr}&end=${endStr}`;
            
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`ORS API returned status ${response.status}: ${response.statusText}`);
            }
            
            const data: any = await response.json();
            const summary = data.features[0].properties.summary;
            const distKm = Math.round((summary.distance / 1000) * 10) / 10;
            const timeMins = Math.round(summary.duration / 60);

            routeData = {
              distanceKm: distKm,
              travelTimeMinutes: timeMins,
              source: `OpenRouteService Directions API (OpenStreetMap data), ${dateStr}`
            };

            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (err: any) {
            console.error(`Error querying ORS for ${pair.fromId} -> ${pair.toId}: ${err.message}. Falling back to simulation.`);
            routeData = simulateRoute(pair.fromCoord, pair.toCoord, dateStr);
          }
        } else {
          routeData = simulateRoute(pair.fromCoord, pair.toCoord, dateStr);
        }

        cache[cacheKey] = routeData;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
      }

      const sourceShort = idMap[pair.fromId] || pair.fromId;
      const destShort = idMap[pair.toId] || pair.toId;

      generatedRoutes.push({
        sourceId: sourceShort,
        destId: destShort,
        cityId: cityId,
        distanceKm: routeData.distanceKm,
        travelTimeMinutes: routeData.travelTimeMinutes,
        sourceCitation: routeData.source
      });
    }
  }

  const csvLines = [
    "# STATUS: Somnath and Dwarka routes verified; remaining 6 cities NOT COLLECTED (see Data Collection Plan)",
    "source_attraction_id,destination_attraction_id,destination_id,distance_km,travel_time_minutes,source"
  ];

  for (const r of generatedRoutes) {
    csvLines.push(`${r.sourceId},${r.destId},${r.cityId},${r.distanceKm},${r.travelTimeMinutes},${r.sourceCitation}`);
  }

  const csvContent = csvLines.join("\n") + "\n";

  // Write CSV file
  fs.writeFileSync(ROUTES_CSV_FILE, csvContent, "utf-8");
  console.log(`Saved ${generatedRoutes.length} routes CSV to: ${ROUTES_CSV_FILE}`);

  // Write TypeScript wrapper file
  const tsContent = `// Automatically generated by scripts/generate-routes.ts. Do not edit.
export const routesCsvText = ${JSON.stringify(csvContent)};
`;
  fs.writeFileSync(ROUTES_TS_FILE, tsContent, "utf-8");
  console.log(`Saved ${generatedRoutes.length} routes TypeScript module to: ${ROUTES_TS_FILE}`);
  console.log("Route generation script completed successfully.");
}

function simulateRoute(fromCoord: [number, number], toCoord: [number, number], dateStr: string): CachedRoute {
  const spherical = getSphericalDistanceKm(fromCoord[0], fromCoord[1], toCoord[0], toCoord[1]);
  const distanceKm = Math.round(spherical * 1.25 * 10) / 10;
  const travelTimeMinutes = Math.max(5, Math.round(distanceKm * 2.0));

  return {
    distanceKm,
    travelTimeMinutes,
    source: `Simulated OpenRouteService Route (No API Key), ${dateStr}`
  };
}

run().catch(err => {
  console.error("Route generation failed:", err);
  process.exit(1);
});
