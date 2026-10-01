# Backend services

`destinationSearchCache.js` builds an atomic database-derived Trie snapshot at
startup and refreshes every 60 seconds. Runtime search uses full-name prefix
matching; failed refreshes retain the last real snapshot.

`hotelRanking.js` imports shared Merge Sort for price, rating, value and name
ordering before pagination. Unknown ratings/value scores sort last.

`tripPlanner.js` uses database routes, directional evidence, shared Graph/Dijkstra
and greedy helpers for time/budget-aware hotel-to-attractions-to-hotel plans.
Missing fares, routes and accessibility remain explicit. `logger.js` emits
allowlisted structured operational events without bodies, credentials or tokens.
