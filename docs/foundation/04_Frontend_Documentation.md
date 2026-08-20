# Frontend Documentation — Heritage Tourism Planner for Gujarat

Status: **Built and verified.** This document describes the actual state of the `heritage-tourism-planner` frontend as audited (type-checked with `tsc --noEmit` and built with `vite build`, both clean) — not a plan, the real thing.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Icons | lucide-react |
| Animation | motion |
| PDF export | jspdf + html2canvas (used in Itinerary View) |
| Package manager | npm |

Data is currently **fully mocked** — no backend calls exist yet. Every view reads from `src/data/destinations.ts` and derived local state.

---

## 2. Visual Identity — "Stepwell"

Grounded in Gujarat heritage motifs (stepwell terraces, Ajrakh block-print, the Rann's salt-white) rather than a generic AI-travel-app look.

### Design tokens (`src/data/colors.ts`)

| Token | Hex | Use |
|---|---|---|
| Ink Indigo | `#1E2A46` | Primary structural color — nav, headers, dark sections |
| Salt White | `#F6F4EF` | Primary background |
| Madder Red | `#A63D40` | Primary CTA/action color, used sparingly |
| Stepwell Gold | `#C99A3B` | Ratings, prices, highlights, active/focus states |
| Stone Grey | `#6B665B` | Borders, dividers, muted text — **darkened from the original `#8A8578` spec for WCAG AA contrast** |
| Deep Charcoal | `#24211D` | Body text on light backgrounds |

`DESIGN_TOKENS` and `SVG_COLORS` are both exported from this one file and imported everywhere raw SVG needs literal hex values (Tailwind classes can't reach into `fill`/`stroke` attributes) — this exists specifically to prevent color drift in `DijkstraVisualizer.tsx`, `ExploreView.tsx`, and `ItineraryView.tsx`, which is where it drifted once before being fixed.

### Typography

| Role | Face |
|---|---|
| Display (headings) | Fraunces |
| Body/UI | Plus Jakarta Sans (falls back to Inter, then sans-serif) |
| Data/utility (prices, distances, times) | IBM Plex Mono |

### Layout & motion signatures

- **Terrace grid** — destination/hotel/itinerary-day cards render in a staggered vertical offset (`md:translate-y-6` on alternating cards), echoing stepwell terraces. Collapses to a single column below `md`.
- **Stepped-chevron motif** — used for section dividers, loading states, and empty-state watermarks (custom SVG, not decorative overuse).
- **Motion is restrained** — no scale-bounce hover effects (removed after an earlier audit found `hover:scale-105`/`scale-125` violating this); hover states use border-color/elevation shifts only. Grayscale-to-color image hover is the one distinctive motion flourish, kept intentionally.
- **`prefers-reduced-motion` is respected globally** — both in CSS and in JS state (notably in `DijkstraVisualizer`, which jumps straight to the final computed path with an explicit on-screen note when reduced motion is detected).

---

## 3. Scope (as actually built)

**Intra-city only.** The user selects exactly **one city** at a time from a fixed set of 8 — Somnath, Dwarka, Rann of Kutch, Gir, Modhera, Champaner, Saputara, Ahmedabad. The app builds a **circular** day route inside that city: hotel → attractions → back to the same hotel, with real arrival/departure times and automatic lunch/dinner meal-break insertion. There is **no inter-city routing** — this was a deliberate scope correction from an earlier multi-city version; do not reintroduce cross-city trip planning without updating this doc and the data model together.

---

## 4. Data Model (`src/data/destinations.ts`)

Each of the 8 cities contains real, sourced data (not placeholder text):

```
Destination (City) {
  id, name, district, category (official Gujarat Tourism taxonomy),
  attractions: Attraction[4],
  hotels: HotelOption[3],
  restaurants: Restaurant[3]
}

Attraction {
  name, lat, lng, durationHours, rating, category, entryFee
}

HotelOption {
  name, lat, lng, pricePerNight, rating,
  stayType: 'Toran Hotel' | 'Heritage Hotel' | 'Registered Hotel' | 'Homestay'
}

Restaurant {
  name, lat, lng, rating, avgCostPerPerson
}
```

`DESTINATION_HOTELS_MAP` in `HotelsView.tsx` is a derived lookup (`GUJARAT_DESTINATIONS.reduce(...)`), not a second hardcoded dataset — one source of truth for hotel data.

---

## 5. Views / Components

| Component | Purpose | Notes |
|---|---|---|
| `Navbar.tsx` | Top nav, mobile drawer | |
| `Hero.tsx`, `ValueProps.tsx`, `FeaturedDestinations.tsx`, `Footer.tsx` | Landing page sections | |
| `AuthView.tsx` | Login / Register | Role selector: Tourist vs. Tour Operator |
| `ExploreView.tsx` | City search/browse | Client-side prefix filter simulates the future Trie-backed search; official category filter chips |
| `DestinationDetailView.tsx` | City overview | Shows that city's attractions + hotels; "Add to trip plan" entry point |
| `DestinationModal.tsx` | Attraction/hotel quick-view modal | |
| `PlannerModal.tsx` | 3-step trip wizard | Step 1: confirm city (not multi-select). Step 2: days, budget, **starting hotel**, **start time**. Step 3: review & generate |
| `ItineraryView.tsx` | Day-by-day circular itinerary | Real arrival/departure times per stop; automatic meal-break insertion on lunch/dinner window crossing; circular route map (hotel start = hotel end); PDF export (jspdf/html2canvas); expandable "Show algorithm" toggle into `DijkstraVisualizer` |
| `DijkstraVisualizer.tsx` | Intra-city shortest-path animation | Nodes = one city's attractions + hotel; framed explicitly as a fallback for when two attractions aren't directly road-connected, not the primary route builder; playback controls (Play/Pause/Step/Reset); `aria-live="polite"` step announcements |
| `BudgetPlannerView.tsx` | Budget breakdown | Categories: Travel, Hotels, Entry fees, **Meals** |
| `HotelsView.tsx` | Ranked hotel list | Scoped to the trip's single city (header reads "Hotels in {city}") — **a cross-city switcher was flagged as a leftover from the pre-scope-change version and needs removal; verify before treating this view as finished** |
| `ProfileDashboardView.tsx` | Saved trips, account settings | Branches to Admin Dashboard for Tour Operator accounts |
| `AdminDashboardView.tsx` | Tour Operator CMS | Tabs: Destinations, Hotels, Attractions, Restaurants. Slide-in side panel for add/edit, inline delete confirmation |

---

## 6. Accessibility state (verified, not assumed)

- Global `focus-visible` outline in Stepwell Gold on all interactive elements.
- Icon-only buttons (Edit/Delete in Admin, playback controls in the Dijkstra visualizer) carry `aria-label`.
- `aria-live="polite"` regions: Dijkstra step announcements, meal-break insertion notice.
- Hotel images have descriptive `alt` text generated per-item in a loop (`${hotel.name} ${hotel.stayType} exterior`), not left blank.
- Buttons pairing an icon with visible text (most of the app) don't need additional `aria-label` — the visible text is already the accessible name.
- `prefers-reduced-motion` handled in both CSS and component state.

---

## 7. Known outstanding items

1. **`HotelsView.tsx` cross-city switcher** — still present as of the last audit (a "Jump to City" dropdown + full chip row of all 8 cities sitting under a city-scoped header). Needs removal so the page can't silently browse away from the trip's actual city. Confirm this is resolved before considering the frontend fully done.
2. **All data is mocked** — nothing is wired to a backend yet. This is expected at this stage; it's the explicit target of the API-wiring pass once the backend exists.
3. **Bundle size** — jspdf + html2canvas roughly double the production bundle (~433KB → ~1MB). Not urgent, but a good candidate for a dynamic `import()` so the PDF export code only loads when a user clicks Export.

---

## 8. Explicitly NOT part of this frontend

- Inter-city routing or multi-city trip planning of any kind.
- Real-time booking or payment flows.
- Live GPS navigation.
- Any backend/API integration (still pending).

---

*This document reflects the frontend as verified by direct inspection, `tsc --noEmit`, and `vite build` — not the original planning prompts. If the two ever disagree, this file describes what's actually in the repository.*
