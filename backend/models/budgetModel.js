// Costs are snapshots of the database prices at generation, scoped to persisted stops.
export async function forTrip(client, trip) {
  const row = (await client.query(
    `SELECT COALESCE(SUM(cost) FILTER (WHERE stop_type='hotel'),0) AS hotel,
      COALESCE(SUM(cost) FILTER (WHERE stop_type='attraction'),0) AS attractions,
      COALESCE(SUM(cost) FILTER (WHERE stop_type='meal'),0) AS meals,
      COALESCE(SUM(cost) FILTER (WHERE stop_type='transit'),0) AS transit,
      COALESCE(SUM(cost),0) AS total
      FROM itinerary_stops WHERE trip_id=$1`, [trip.id],
  )).rows[0];
  const amounts = Object.fromEntries(Object.entries(row).map(([key,value]) => [key,Number(value)]));
  return {
    trip_id:trip.id, budget:trip.budget, ...amounts, remaining:trip.budget-amounts.total,
    over_budget:amounts.total>trip.budget, generated:Boolean(trip.generated_at),
    hotel_over_budget:trip.generation_summary?.hotel_over_budget ?? false,
    transport_cost_known:trip.generation_summary?.transport_cost_known ?? null,
    cost_basis:"Persisted stop price snapshots; unknown transport fares are excluded",
  };
}
export async function save(client, budget) {
  await client.query(
    `INSERT INTO budgets(trip_id,spent_hotel,spent_attractions,spent_meals,spent_transit,remaining)
     VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(trip_id) DO UPDATE SET
     spent_hotel=EXCLUDED.spent_hotel,spent_attractions=EXCLUDED.spent_attractions,
     spent_meals=EXCLUDED.spent_meals,spent_transit=EXCLUDED.spent_transit,remaining=EXCLUDED.remaining`,
    [budget.trip_id,budget.hotel,budget.attractions,budget.meals,budget.transit,budget.remaining],
  );
}

