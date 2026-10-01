# Stabilization research follow-up

Checked 2026-09-30; prior archived evidence and unresolved findings remain intact.
No unresolved price, access boolean, ferry timetable or opening interval was
invented to improve completion percentages. This file records additional checks;
the importable field-level evidence remains in data/research/ and data-provenance.

| Area | Primary evidence checked | Decision and functional consequence |
|---|---|---|
| Ahmedabad | [Gujarat Tourism city guidance](https://gujarattourism.com/central-zone/ahmedabad.html), [UNESCO historic city](https://whc.unesco.org/en/list/1551/) | Fill primary discovery category for the historic-city circuit. General heritage descriptions and partial facility references do not establish whole-site wheelchair suitability for six attractions. Unknown access retained. |
| Somnath | [Temple Trust FAQ](https://somnath.org/faq/), [Gujarat Tourism temple](https://gujarattourism.com/saurashtra/gir-somnath/somnath-temple.html) | Existing temple-access evidence retained; no extension to Bhalka, Triveni or the beach. Religious discovery category filled. Legacy Toran Dining Hall identity has insufficient precision to source its six missing route pairs. |
| Dwarka | [Gujarat Tourism temple](https://gujarattourism.com/saurashtra/devbhoomi-dwarka/dwarkadhish-temple.html), [Incredible India Sudarshan Setu](https://www.incredibleindia.gov.in/en/gujarat/dwarka/sudarshan-setu) | Religious discovery category filled. The official bridge description supports road access between Okha and Beyt Dwarka; a ferry is not required to fabricate a route. Current optional ferry fares/timetables and whole-site access remain unknown. Seven pairs involve the unresolved legacy dining identity. |
| Modhera | [Official Sun Temple](https://gujarattourism.com/north-zone/mehsana/sun-temple-modhera.html), [Modheshwari](https://gujarattourism.com/north-zone/mehsana/modheshwari-mata-temple.html) | Project primary category Heritage Sites filled; no UNESCO inscription implied. Temple descriptions do not resolve conflicting secondary clock hours or whole-site access. Those fields retain unknown values. |
| Champaner | [UNESCO](https://whc.unesco.org/en/list/1101/), [Tourism park description](https://gtbooking.gujarattourism.com/central-zone/panchmahal/champaner---pavagadh.html) | UNESCO discovery category filled for the archaeological-park circuit. The park page identifies Kevada but does not settle its distinct ticket price. Do not copy another mosque's ticket or convert daylight advice into fixed annual hours. Kevada remains excluded from priced itineraries. |
| Gir | [Official Forest Department booking terms](https://girlion.gujarat.gov.in/TermsConditions.aspx) | Devalia closes Wednesday; permits require advance arrival and guide/vehicle charges are separate. These reinforce the documented booking/calendar limitations. General permit rules do not prove wheelchair loading or current availability. No calendar or booking feature was introduced. |
| Rann | Prior archived government/tourism and road-direction evidence in data/research/rann-of-kutch.json and data-provenance | General descriptions do not establish whole-site wheelchair access. One co-located hotel/dining pair has zero road distance; it cannot be inserted as a positive-distance road route under the current constraint. Its unresolved relationship contributes to skipped meals. |
| Saputara | [Dang district](https://dangs.nic.in/tourist-place/saputara/), [Culture Ministry 2023 museum directory](https://www.culture.gov.in/files/inline-documents/Directory_of_Indian_Museums_080620231.pdf) | The district mentions a museum, but neither this description nor a historical directory establishes current reopening. Historical ticket/hours are not promoted to current visitor availability. Museum price/current intervals and whole-site access remain unknown; the museum is excluded from priced plans. |

The five category additions use the existing manifest/seed pipeline, with archived
paraphrased primary-source evidence in
`data/research/pages/completion-category-evidence.json`. Categories express the
project's main visitor circuit; they do not certify every modern property in a
city as UNESCO heritage. Other discovery categories can correctly return empty
collections. All 131 road routes remain the previously sourced snapshots, with
no new straight-line estimates or simulated routes.

Current exact gaps: [data-completion-checklist.json](data-completion-checklist.json).
Future verification requires specific operator/authority information for the
unresolved fields; this session did not contact anyone or send messages.
