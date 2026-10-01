-- csv_route_audit is a temporary table loaded directly from routes.csv.
-- external_id stores CSV IDs; destinations.slug stores CSV destination_id.
SELECT d.slug AS city,
       count(*)::int AS csv_rows,
       count(*) FILTER (WHERE a.id IS NOT NULL AND b.id IS NOT NULL)::int
           AS both_attraction_ids_join,
       count(*) FILTER (WHERE a.id IS NULL)::int AS source_not_an_attraction,
       count(*) FILTER (WHERE b.id IS NULL)::int AS missing_target_attraction,
       count(*) FILTER (WHERE h.id IS NOT NULL)::int AS source_joins_hotel,
       count(*) FILTER (WHERE a.id IS NULL AND h.id IS NULL)::int AS missing_source_entity
FROM csv_route_audit c
LEFT JOIN destinations d ON d.slug = c.destination_id
LEFT JOIN attractions a ON a.external_id = c.source_attraction_id
                       AND a.destination_id = d.id
LEFT JOIN attractions b ON b.external_id = c.destination_attraction_id
                       AND b.destination_id = d.id
LEFT JOIN hotels h ON h.external_id = c.source_attraction_id
                  AND h.destination_id = d.id
GROUP BY d.slug
ORDER BY d.slug;
