// A distinct browser-tab title per page, so tabs, history and bookmarks say where you are.
import type { RouteState } from "./router";

export const APP_NAME = "Heritage Tourism Planner";
export const HOME_TITLE = `${APP_NAME} — Gujarat Heritage Sites`;

const LABELS: Record<string, string> = {
  explore: "Explore Destinations",
  destination: "Destination Details",
  hotels: "Ranked Stays",
  budget: "Budget Planner",
  itinerary: "Your Itinerary",
  profile: "My Profile and Saved Trips",
  admin: "Operator Admin",
  research: "Algorithm Research",
  "not-found": "Page Not Found",
};

export function titleForRoute(route: Pick<RouteState, "type" | "authMode">): string {
  if (route.type === "home") return HOME_TITLE;
  if (route.type === "auth") return `${route.authMode === "register" ? "Create Account" : "Sign In"} · ${APP_NAME}`;
  const label = LABELS[route.type];
  return label ? `${label} · ${APP_NAME}` : HOME_TITLE;
}
