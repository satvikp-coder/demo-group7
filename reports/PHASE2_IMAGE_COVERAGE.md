# Phase 2 photograph coverage

Installed inventory:107 catalog entities,35 genuine-photo associations and72
intentional fallbacks. Of the original76 associations, photographs increased34 to35
and fallbacks decreased42 to41. All31 newly added entities currently use explicit
fallbacks. There are28 unique locally hosted licensed photographs, not35 unique files.

Added Bhadra Fort clock facade, Ahmedabad: Tejaherwal, CC BY-SA4.0, Wikimedia Commons
[File:Bhadra Fort 2 jpeg.jpg](https://commons.wikimedia.org/wiki/File:Bhadra_Fort_2_jpeg.jpg).
Metadata is archived in data/phase2/bhadra-photo-metadata.json; optimized WebP147730bytes.
Attribution and license links are served in image-credits.html. Original27 photos
remain unchanged. No property website photograph was copied without reuse rights.

Validation:929 source-reference lines inventoried; all67 public image files passed
HTTP image content-type and actual decoding/XML checks. All107 entity resolutions
passed (31 distinct resolved URLs).60 installed browser page/viewport states at
1440/768/390 had0 broken images,0 image HTTP/fetch failures,0 page/console errors,
and0 horizontal overflow. Public routes and all8 destination pages were inspected;
protected pages were checked as guest handoffs. Authenticated result imagery was
separately tested in isolated Phase2 and professor-demo browser runs.

Exact per-record photo/fallback/source identities: phase2-image-associations.json.
Asset evidence: phase2-image-assets.json. Browser evidence: phase2-installed-browser.json.
Screenshots remain under backend/reports/images; curated isolated screenshots are
phase2-browser-390.png and phase2-gujarati-1440.png. Zero broken images does not mean
zero missing photographs. Remaining72 fallbacks still need identity-matched reusable
media; absence of a license was not treated as permission to redistribute.

Python localhost resolution was observed taking15seconds per asset request, while
127.0.0.1 took0.01seconds. Final asset/public browser scan used the latter loopback
address on the same8080 server. No application networking change was introduced.
