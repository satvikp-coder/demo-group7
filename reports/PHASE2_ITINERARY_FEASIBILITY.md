# Phase 2 itinerary feasibility

Explicit lodging_nights, arrival_date and departure_date are optional additions. New forms default to days minus one; nights remain adjustable. Legacy requests/rows with null new fields retain the old days-as-nights interpretation. Room subtotal uses paise-precision nightly rate times nights times rooms. Unknown rates are rejected for overnight stays; zero nights means no room purchased, not a free room. Taxes remain unknown.

Migration008 adds nullable fields and constraints without rewriting saved trips. Real API checks cover zero nights, multi-day stays, multiple rooms, date agreement, invalid ranges and refresh persistence. Screenshot review found and repaired a stale displayed night count.

Devalia's official bus booking page supplies Wednesday closure, seasonal30-minute departure slots, and Indian weekday/weekend150/190 estimates. The existing scheduler now applies these when a trip date exists. Festival/nationality tariffs, permit availability and exceptional closures remain advisory. Other unknown operating data remains unverified.

The existing bounded multistart optimizer is preserved. It ranks evaluated feasible candidates, not a proven global optimum. Unknown attraction fees/durations remain excluded. More discovered records therefore do not imply more schedulable candidates. No random ranking changes were introduced.

| Destination | One-day visits: distance/cost/rating | Multi-day visits | Evaluated candidates by scenario |
|---|---|---:|---|
| ahmedabad | 4 / 4 / 4 | 6 | 6 / 6 / 6 / 6 |
| champaner | 1 / 1 / 1 | 1 | 1 / 1 / 1 / 1 |
| dwarka | 4 / 4 / 4 | 4 | 4 / 4 / 4 / 4 |
| gir-national-park | 1 / 1 / 1 | 2 | 2 / 2 / 2 / 2 |
| modhera | 2 / 2 / 2 | 2 | 2 / 2 / 2 / 2 |
| rann-of-kutch | 2 / 2 / 2 | 2 | 2 / 2 / 2 / 2 |
| saputara | 2 / 2 / 2 | 2 | 2 / 2 / 2 / 2 |
| somnath | 4 / 4 / 4 | 4 | 4 / 4 / 4 / 4 |

All32 isolated API scenarios generated real attraction IDs, preserved selected lodging, respected known-cost budgets and avoided duplicate visits. A generated plan can still have incomplete meals/unknown costs; this does not certify bookings or opening availability.

## Executed professor demonstration

Production-build browser run completed2026-10-10T08:48:36Z with no page or console
errors. Ahmedabad/French Haveli, one day, zero purchased nights, one traveler:

| Weights distance/cost/rating | Route km | Known subtotal INR | Evaluated score |
|---|---:|---:|---:|
|80/10/10|30.43|225|0.942800|
|10/80/10|44.09|200|0.949488|
|10/10/80|44.09|200|0.901888|

Six candidates were evaluated each time. Cost and rating selected the same
candidate legitimately; score values use different weights and are not comparable
as absolute quality across requests. Lower known cost excludes transport fares.
Somnath/Lilavati on390px also passed:19.26km, INR600 known subtotal, zero nights.
Modhera production-browser generation and saved refresh passed at all three widths.

Repeat through the real interface: sign in, select Ahmedabad, compare Low Cost
with Premium, choose French Haveli, set one day/zero nights/INR30000 and1 traveler,
then generate under each weight vector above. Review the evaluated candidates and
budget, refresh the saved result, then repeat with Somnath/Lilavati and Modhera.
Use two days/one night and two rooms to demonstrate lodging multiplication.
Ahmedabad Budget currently has an honest empty state after excluding the2014 tariff.
An impossible budget must remain an incomplete/unaffordable plan, never substituted
accommodation. No actual booking or availability claim is part of this demonstration.

Limitations: candidate counts remain1-6 because most added discovery attractions
lack defensible fees/durations. The unchanged bounded search therefore cannot
produce comprehensive combinations for the larger discovery catalog. Unknown
opening data, seasonal exceptions, permits and vehicle-based safari tariffs need
operator confirmation; generic per-traveler attraction cost assumptions are not a
verified quote for a safari vehicle/group. Full Gujarati coverage beyond the
existing dictionary and native-device accessibility certification remain incomplete.
