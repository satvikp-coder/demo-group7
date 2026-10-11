# Hotel catalog/category clarity repair

Issue: the first planner step called the entire destination hotel catalog "Hotel Options", while the price-category selector legitimately excludes properties without usable rates. At reproduction, Saputara had7 records:1 Premium estimate and6 unknown prices. This made six records appear missing.

Repair: label the total "Recorded Hotels"; show all-record/unknown-price/category counts and the actual matching selectable count. Keep the existing authoritative backend category/radius filtering and UUID selection. Show every other recorded hotel in the same planner with available image, location, distance, rating, source/date and facilities; unknown prices/categories/ratings are explicit. Properties in another price category explain which category to choose. No price is invented and no existing row is changed. EN/HI/GU labels use existing dictionaries and styles.

Files: frontend/src/components/HotelCategoryPicker.tsx; frontend/src/components/PlannerModal.tsx; frontend/src/data/hotelTranslations.ts; reports/PHASE3_APPROVED_CHANGES.json. Repeatable72-case read-only test: tests/frontend/hotel_catalog_details.py, also integrated into the isolated Phase3 production-preview suite.

Validation: frontend type-check,2 localization tests, exact-hash source scan0secrets/0unapprovedUI and34 style checks PASS. Installed browser72cases PASS at1440/768/390; all recorded details, exact selectable UUIDs and decoded images/fallbacks verified.

Installed72 read-only cases PASS;7/7 readiness and original-row preservation PASS. Full regression initially stopped at the empty-catalog browser assertion expecting the retired "0 Hotel Options" label. Updated only that literal to "0 Recorded Hotels", retaining the same visibility assertion and empty-catalog fixture. Final full rerun is in progress after tier coverage import. Current Saputara catalog is9hotels:1Low Cost/1Budget/1Premium/6unpriced. All eight destinations now have at least1percategory; see HOTEL_TIER_COVERAGE.md for sources and evidence.
