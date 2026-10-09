# Hotel category implementation

Verified by `itinerary-categories-runner.json` and `itinerary-expanded-runner.json` on disposable PostgreSQL.

`dsa/planning/hotel-policy.json` defines INR nightly bands: Low Cost below1500; Budget1500 through4000 inclusive; Premium above4000. Unknown prices stay unclassified. These classify stored estimates, not current room availability or star quality.

The hotel API uses Haversine (Earth radius6371.0088km), validated coordinates and named existing attraction anchors. Search25km, expanding to75km when fewer than3 matches. It never substitutes another category. Distance/price/rating sorting uses real database fields. Unknown distances/prices sort last.

`HotelCategoryPicker.tsx` supplies category then actual property selection. The trip API checks destination and category against the selected UUID; migration005 persists category. Ranked Stays also supports category and distance controls. Property price provenance is displayed, including Good Night's historical February2014 tariff.

Tests cover boundaries, unknowns, known geographic distances, expansion radius, category mismatch422, real selected-hotel persistence, and unknown-price422. Expanded Ahmedabad has1Low Cost/1Budget/3Premium priced properties plus6unknown-rate properties; Somnath has2Low Cost/2Budget plus1unknown. Other cities retain existing coverage.
