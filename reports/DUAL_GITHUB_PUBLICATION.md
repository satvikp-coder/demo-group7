# Dual GitHub publication

Verified implementation commit: `44da10191ee5c637ca41f080bb15b36f4700ae25`.

| Remote | Repository | Published branch | Pull request |
|---|---|---|---|
| origin | [demo-group7](https://github.com/satvikp-coder/demo-group7) | feature/itinerary-map-budget | [PR 2](https://github.com/satvikp-coder/demo-group7/pull/2) |
| classroom | [course repository](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner) | feature/itinerary-map-budget | [PR 1](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner/pull/1) |

Both `git ls-remote` branch tips matched the implementation commit after normal pushes on 20 October 2026. Both started from the same main baseline `f65b96407623010f10dacb2ec9c07cbc6526f8df`. No history was overwritten, no branch was deleted, and neither pull request was merged. Main remains unchanged. This report is a documentation follow-up on the same branch; its tip can be checked with `git rev-parse HEAD` and `git ls-remote <remote> refs/heads/feature/itinerary-map-budget`.

Before publication: complete scoped diff/whitespace review, fresh staged-index source audit, private-value/path scan and all local required tests passed. Only the reviewed source/test/report whitelist and three isolated-test screenshots were staged. Private context, environments, credentials, backups, real user records and raw logs were excluded. See `map-budget-release-review.json` and `map-budget-regression.json`.

GitHub Actions were running when this publication record was written: [origin implementation run](https://github.com/satvikp-coder/demo-group7/actions/runs/39366188139), [classroom implementation run](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner/actions/runs/39366192871). The documentation follow-up triggers fresh branch checks; final observed CI state is recorded in the local handoff/final response. Local passes are not presented as proof of remote CI success.

The local application is installed at http://localhost:8080. Public hosting/deployment was not changed or verified. External routing/tiles remain best-effort; only the explicitly recorded Modhera road leg was live-verified.
