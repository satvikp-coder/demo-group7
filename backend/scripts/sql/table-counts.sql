SELECT 'users' AS table_name, count(*)::int AS row_count FROM users
UNION ALL SELECT 'destinations', count(*)::int FROM destinations
UNION ALL SELECT 'attractions', count(*)::int FROM attractions
UNION ALL SELECT 'hotels', count(*)::int FROM hotels
UNION ALL SELECT 'restaurants', count(*)::int FROM restaurants
UNION ALL SELECT 'routes', count(*)::int FROM routes
UNION ALL SELECT 'destination_nearby_attractions', count(*)::int FROM destination_nearby_attractions
UNION ALL SELECT 'destination_nearby_hotels', count(*)::int FROM destination_nearby_hotels
UNION ALL SELECT 'trips', count(*)::int FROM trips
UNION ALL SELECT 'itinerary_stops', count(*)::int FROM itinerary_stops
UNION ALL SELECT 'budgets', count(*)::int FROM budgets
ORDER BY table_name;
