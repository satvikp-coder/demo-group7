# Image restoration and final validation

The original causes were discarded image references, malformed category SVG assets,
and fallback state that did not recover correctly when sources changed. The shared
imageSources/ImageWithFallback repair and local manifests are preserved. Prior asset
history/licensing: backend/reports/images/IMAGE_REPAIR_REPORT.md and
frontend/public/assets/photographs/manifest.json; public attribution: image-credits.html.

Twelve original photographs were recovered and15licensed replacements added:27unique
local WebP photographs. No additional property photograph was copied for the20new
records. Searches did not establish reusable matching Maruti/Lilavati/Sagar Darshan
images; unrelated hospital hits and unlicensed official galleries were rejected.
Ranked Stays now renders an intentional fallback even for empty source fields.

Measured after production installation: 813 image-related
source lines audited; 76 catalog image associations;
34 genuine-photo associations; 42 identified fallbacks;
zero remaining broken images in the tested states. All8destination photos work.
French Haveli and Champaner Heritage Resort retain genuine property photographs.
All23hotel records were audited. There is no current API image-gallery field;
the validator also checks gallery arrays if introduced later.

All66public image files passed local parsing and HTTP image-type/decoding.
All60page/viewport states at1440/768/390passed nonzero natural dimensions,
without image request errors, console/page errors or horizontal overflow. Generated
itinerary thumbnails and category-card images also decode in the authenticated
production-build demo. Protected-route guest states in the public scan are not
represented as authenticated verification. Normal builds require no third-party image
requests. Static assets survive the verified container restart.

Evidence: backend/reports/images/catalog-validation.json, asset-validation.json,
itinerary-final-inventory.json, itinerary-final-browser.json and itinerary-final-*.png;
reports/demo-*.png. Repeat with npm run audit:images and scripts/audit-images.py.

## Remaining identified fallbacks

| Entity | Record |
|---|---|
| attractions | Amritavarshini Vav |
| attractions | Astodia Darwaza |
| attractions | Bhadra Fort |
| attractions | Calico Textile Museum |
| attractions | Kalupur Darwaza |
| attractions | Manek Burj |
| attractions | Raipur Gate |
| attractions | Teen Darwaza |
| attractions | Tomb of Ahmad Shah |
| hotels | Hotel Maruti |
| hotels | Hotel Good Night |
| hotels | Lemon Tree Premier |
| hotels | The House of MG |
| hotels | Holiday Inn Express Ahmedabad Prahlad Nagar |
| hotels | Hotel Volga |
| hotels | Hyatt Ahmedabad |
| hotels | Radisson Blu Ahmedabad |
| hotels | Ramada Ahmedabad |
| hotels | The Parterre Ahmedabad |
| restaurants | Agashiye Terrace Restaurant |
| restaurants | Hotel Sarvottam Restaurant, Halol |
| hotels | Hotel Darshan Palace |
| hotels | Toran Hotel Dwarka |
| restaurants | Shrinath Dining Hall |
| restaurants | Toran Dining Hall Dwarka |
| hotels | Anil Farms Gir Jungle Resort |
| restaurants | Hotel Gir Kathiyawadi Sasan Gir |
| hotels | Modhera Sunrise Resort |
| restaurants | Eulogia Restro Cafe, Sun Temple Modhera |
| hotels | Gateway to Rann Resort |
| restaurants | Gateway to Rann Resort dining room |
| attractions | Saputara Museum |
| hotels | Aakar Lords Inn Saputara |
| restaurants | Anando Restaurant Saputara |
| attractions | Triveni Sangam |
| hotels | Lilavati Atithigruh |
| hotels | Maheshwari Samaj Atithi Gruh |
| hotels | Sagar Darshan Atithigruh |
| hotels | Premier Somnath |
| hotels | VIP Atithigruh |
| restaurants | Honest Restaurant Somnath |
| restaurants | Toran Dining Hall Somnath |
