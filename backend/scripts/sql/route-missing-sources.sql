SELECT c.destination_id AS city, c.source_attraction_id AS csv_source_id,
       count(*)::int AS affected_rows
FROM csv_route_audit c
LEFT JOIN destinations d ON d.slug = c.destination_id
LEFT JOIN attractions a ON a.external_id = c.source_attraction_id AND a.destination_id = d.id
LEFT JOIN hotels h ON h.external_id = c.source_attraction_id AND h.destination_id = d.id
LEFT JOIN restaurants r ON r.external_id = c.source_attraction_id AND r.destination_id = d.id
WHERE a.id IS NULL AND h.id IS NULL AND r.id IS NULL
GROUP BY c.destination_id, c.source_attraction_id
ORDER BY c.destination_id, c.source_attraction_id;
