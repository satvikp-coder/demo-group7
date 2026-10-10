# Phase 2 data coverage baseline

Read-only SQL snapshot. Numeric fields are stored values, not independent current-price verification. Feasibility is pending isolated generation.

| Destination | Attractions | Hotels | Low Cost / Budget / Premium / Unknown | Restaurants | Known fees / hours / duration | Photos (children) | Routes | Connected attractions / hotels |
|---|---:|---:|---|---:|---|---:|---:|---|
| Ahmedabad | 14 | 11 | 1 / 1 / 3 / 6 | 3 | 6 / 6 / 6 | 8 | 80 | 6 / 5 |
| Champaner | 2 | 1 | 0 / 0 / 1 / 0 | 1 | 1 / 0 / 2 | 3 | 6 | 2 / 1 |
| Dwarka | 4 | 2 | 0 / 2 / 0 / 0 | 2 | 4 / 4 / 4 | 4 | 20 | 4 / 2 |
| Gir National Park | 2 | 1 | 0 / 0 / 1 / 0 | 1 | 2 / 2 / 2 | 2 | 6 | 2 / 1 |
| Modhera | 2 | 1 | 0 / 1 / 0 / 0 | 1 | 2 / 1 / 2 | 2 | 6 | 2 / 1 |
| Rann of Kutch | 2 | 1 | 0 / 0 / 1 / 0 | 1 | 2 / 0 / 2 | 2 | 5 | 2 / 1 |
| Saputara | 3 | 1 | 0 / 0 / 1 / 0 | 1 | 2 / 0 / 3 | 2 | 10 | 3 / 1 |
| Somnath | 4 | 5 | 2 / 2 / 0 / 1 | 2 | 4 / 4 / 4 | 3 | 30 | 4 / 4 |

# Phase 2 installed data coverage

Read-only SQL snapshot. Numeric fields are stored values, not independent current-price verification. All eight destinations passed isolated one-day and multi-day generation; see phase2-cross-destination-tests.json. Numeric prices remain estimates, not live rates.

| Destination | Attractions | Hotels | Low Cost / Budget / Premium / Unknown | Restaurants | Known fees / hours / duration | Photos (children) | Routes | Connected attractions / hotels |
|---|---:|---:|---|---:|---|---:|---:|---|
| Ahmedabad | 14 | 11 | 1 / 0 / 3 / 7 | 3 | 6 / 6 / 6 | 9 | 80 | 6 / 5 |
| Champaner | 9 | 2 | 0 / 1 / 1 / 0 | 1 | 1 / 1 / 2 | 3 | 58 | 9 / 2 |
| Dwarka | 4 | 7 | 0 / 2 / 0 / 5 | 2 | 4 / 4 / 4 | 4 | 50 | 4 / 7 |
| Gir National Park | 2 | 5 | 0 / 0 / 1 / 4 | 1 | 2 / 2 / 2 | 2 | 18 | 2 / 5 |
| Modhera | 4 | 4 | 0 / 1 / 0 / 3 | 1 | 2 / 1 / 2 | 2 | 30 | 4 / 4 |
| Rann of Kutch | 2 | 2 | 0 / 0 / 1 / 1 | 1 | 2 / 0 / 2 | 2 | 7 | 2 / 2 |
| Saputara | 5 | 7 | 0 / 0 / 1 / 6 | 1 | 2 / 0 / 3 | 2 | 49 | 5 / 7 |
| Somnath | 4 | 5 | 2 / 2 / 0 / 1 | 2 | 4 / 4 / 4 | 3 | 30 | 4 / 4 |

## Completeness and qualification

44/44 attraction and43/43 hotel coordinate pairs pass Gujarat bounds validation.
23 attractions have numeric fees,18 have both clock hours,25 have durations;
19 attraction and11 hotel ratings are stored. These counts do not independently
certify current prices, ratings, opening status or accessibility. Source provenance
and verification dates remain attached to individual records.

16 hotels have usable indicative numeric rates;27 have unknown/historical rates
for new budgeting. The stored2014 tariff is preserved, but unavailable as a current rate.
No current market-rate or live availability certification is claimed. Only one
new property has an official published undated tariff; all other19 new prices and
all20 new guest ratings remain unknown. No new restaurants were fabricated.
