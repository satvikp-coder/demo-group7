# Dual GitHub publication

Implementation commit: `9f7503db88bc103368f8780bcafc4f1d4ab92a79`.

| Remote | Repository | Branch | Pull request |
|---|---|---|---|
| origin | [mirror](https://github.com/satvikp-coder/demo-group7) | feature/attraction-itinerary-quality | [PR3](https://github.com/satvikp-coder/demo-group7/pull/3) |
| classroom | [course repository](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner) | feature/attraction-itinerary-quality | [PR2](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner/pull/2) |

Both normal pushes succeeded and both `git ls-remote` branch tips matched the exact implementation SHA. Existing remote main histories and earlier open map PRs were preserved. These new PRs target `feature/itinerary-map-budget`, making the new attraction/scheduling diff independently reviewable; neither PR was merged. This report is a documentation follow-up on the same branch. Verify its latest tip with `git rev-parse HEAD` and `git ls-remote <remote> refs/heads/feature/attraction-itinerary-quality`.

Review:81 implementation/source/data/test/evidence files; complete scoped diff and whitespace review passed. Fresh staged-index audit scanned800 files with0secret patterns and0unapproved frontend changes. Actual ignored local secret values and private file paths were checked against every staged blob. Private environment files, context export, backups, original-user row digests and raw logs were excluded. See attraction-release-review.json.

All local gates passed before publication; see FULL_REGRESSION_RESULTS.md. GitHub Actions were in progress at this record, not reported as passed: [mirror source run](https://github.com/satvikp-coder/demo-group7/actions/runs/39433799076), [course source run](https://github.com/CSC210-Monsoon2026/group-07-heritage-tourism-planner/actions/runs/39433817306). The documentation follow-up triggers fresh checks; final observed CI results belong in the handoff/final response, separate from local passes.

Installed local app:http://localhost:8080. Catalog8/100/56/12/1330; original nine-table row hashes preserved; readiness7/7; read-only24browser checks and image176/0broken verified. No public deployment, paid service, live AI request, database reset or historical itinerary rewrite was performed.

Earlier map/budget publication remains in Git history (implementation44da101, docs3fbcae1). Its PR2mirror/PR1course remain open and unmerged; both earlier source/doc CI runs on each repository were checked successful before this release.

Recorded: 2026-10-20T13:50:57.012314+00:00 UTC.
