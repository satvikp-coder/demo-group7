import { GUJARAT_DESTINATIONS } from "../data/destinations";

export type RouteType =
  | "home"
  | "explore"
  | "destination"
  | "hotels"
  | "budget"
  | "itinerary"
  | "profile"
  | "admin"
  | "auth"
  | "research"
  | "not-found";

export interface RouteState {
  type: RouteType;
  path: string;
  destinationId?: string;
  authMode?: "login" | "register";
  section?: string;
}

type RouteListener = (route: RouteState) => void;
const listeners: Set<RouteListener> = new Set();

/**
 * Parses the current window pathname and hash into a typed RouteState.
 */
export function parseRoute(
  pathname: string = typeof window !== "undefined" ? window.location.pathname : "/",
  hash: string = typeof window !== "undefined" ? window.location.hash : ""
): RouteState {
  // Normalize pathname: remove trailing slash except root
  let cleanPath = pathname.trim();
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;

  // 1. Root / Home
  if (cleanPath === "" || cleanPath === "/") {
    if (cleanHash === "explore") {
      return { type: "explore", path: cleanPath, section: "explore" };
    }
    return { type: "home", path: cleanPath, section: cleanHash || undefined };
  }

  // 2. Explore
  if (cleanPath === "/explore") {
    return { type: "explore", path: cleanPath, section: "explore" };
  }

  // 3. Destination Detail (/destination/:id or /city/:id)
  if (cleanPath.startsWith("/destination/") || cleanPath.startsWith("/city/")) {
    const parts = cleanPath.split("/").filter(Boolean);
    const destId = parts[1];
    if (destId) {
      const isValid = GUJARAT_DESTINATIONS.some((d) => d.id.toLowerCase() === destId.toLowerCase());
      if (isValid) {
        return {
          type: "destination",
          path: cleanPath,
          destinationId: destId.toLowerCase(),
        };
      }
    }
    // If destination ID not found in database, return clear not-found
    return { type: "not-found", path: cleanPath };
  }

  // 4. Hotels / Ranked Stays
  if (cleanPath === "/hotels") {
    return { type: "hotels", path: cleanPath };
  }

  // 5. Budget Planner
  if (cleanPath === "/budget") {
    return { type: "budget", path: cleanPath };
  }

  // 6. Itinerary View
  if (cleanPath === "/itinerary") {
    return { type: "itinerary", path: cleanPath };
  }

  // 7. Profile / Dashboard
  if (cleanPath === "/profile" || cleanPath === "/dashboard") {
    return { type: "profile", path: cleanPath };
  }

  // 8. Admin Dashboard
  if (cleanPath === "/admin") {
    return { type: "admin", path: cleanPath };
  }

  // 9. Auth View
  if (cleanPath === "/login") {
    return { type: "auth", path: cleanPath, authMode: "login" };
  }
  if (cleanPath === "/register") {
    return { type: "auth", path: cleanPath, authMode: "register" };
  }

  // 10. Dev Research Matrix
  if (cleanPath === "/research") {
    if (import.meta.env.DEV) {
      return { type: "research", path: cleanPath };
    }
    return { type: "not-found", path: cleanPath };
  }

  // 11. Invalid / Unrecognized route
  return { type: "not-found", path: cleanPath };
}

/**
 * Returns the current route state.
 */
export function getCurrentRoute(): RouteState {
  if (typeof window === "undefined") {
    return { type: "home", path: "/" };
  }
  return parseRoute(window.location.pathname, window.location.hash);
}

/**
 * Navigates to a path using the HTML5 History API and notifies subscribers.
 */
export function navigate(
  to: string,
  options?: { replace?: boolean; state?: any; preserveScroll?: boolean }
): void {
  if (typeof window === "undefined") return;

  const currentHref = window.location.pathname + window.location.search + window.location.hash;
  if (currentHref === to) {
    // If already at destination, notify listeners in case of hash scroll
    const route = getCurrentRoute();
    listeners.forEach((l) => l(route));
    return;
  }

  if (options?.replace) {
    window.history.replaceState(options?.state || {}, "", to);
  } else {
    window.history.pushState(options?.state || {}, "", to);
  }

  const newRoute = getCurrentRoute();
  listeners.forEach((listener) => listener(newRoute));

  if (!options?.preserveScroll && !to.includes("#")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Subscribes to route changes (both pushState/replaceState via navigate and popstate events).
 */
export function subscribeToRoute(callback: RouteListener): () => void {
  listeners.add(callback);

  const handlePopState = () => {
    const route = getCurrentRoute();
    callback(route);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("popstate", handlePopState);
  };
}

/**
 * Robust helper to scroll to an element by ID, retrying across animation frames if needed.
 */
export function scrollToElementWithRetry(elementId: string, maxRetries = 10): void {
  let attempts = 0;

  const tryScroll = () => {
    attempts++;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (attempts < maxRetries) {
      setTimeout(tryScroll, 60);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Give React initial frame to mount
  setTimeout(tryScroll, 30);
}
