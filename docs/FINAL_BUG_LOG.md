# Final bug log

Repo: demo-group7-release, branch `final-fixes`, baseline taken from `main` at bcbe5ab.

## Fix log

| ID | Area | Reproduced? | Fix summary | Commit | Proof |
|----|------|-------------|-------------|--------|-------|
| _none yet_ | | | | | |

## Baseline (read-only, no code changed)

| Check | Result | Evidence |
|-------|--------|----------|
| npm ci frontend | PASS | 120 packages, exit 0 |
| npm ci backend | PASS | 111 packages, exit 0 |
| npm ci dsa | N/A | no dependencies, no lockfile |
| tsc --noEmit frontend | PASS | exit 0 |
| tsc dsa | N/A | no tsconfig |
| lint (`npm run lint` = tsc --noEmit) | PASS | exit 0; no ESLint configured |
| frontend build, no env | FAIL (by design) | vite.config.ts throws unless VITE_API_BASE_URL is `/api` or an https URL ending in `/api` |
| frontend build, VITE_API_BASE_URL=/api | PASS | 2435 modules, built in 14.33s |
| backend build (syntax check) | PASS | exit 0 |
| backend npm test | PASS | 118 tests, 118 pass, 0 fail |
| frontend npm test | PASS | exit 0, planner suite "All 33 assertions passed" |
| backend start (full) | NOT VERIFIED | needs PostgreSQL; none installed, Docker daemon not running |
| GET /health | PASS | 200 `{"status":"ok"}` via createApp() without DB warm-up |
| GET /ready | EXPECTED FAIL | 503, ECONNREFUSED (no DB) |
| GET /api/destinations | NOT VERIFIED | 503 without DB; data path untested |
| frontend vite preview | PASS | GET / returns 200, 2950 bytes |
| git status | PASS | clean on main, up to date with origin/main |
| files over 5 MB | PASS | only backend/reports/frontend-browser-report.json (26.8 MB), gitignored and untracked |

## Findings to triage

1. **Which tree is the submission?** `group-07-heritage-tourism-planner-main/` (the one AGENTS.md calls canonical) has no `.git` and differs from this repo, e.g. `dsa/planning/hotelPolicy.ts`, `backend/scripts/expand-catalog.js`, `compose.local.yml`, extra data files. Needs a decision before any fix.
2. `npm audit`: frontend 2 (dompurify critical, vite high), backend 4 (body-parser high, zod high, qs and ip-address moderate). Fixing means dependency upgrades, which are out of scope unless approved.
3. `/api/health` returns 404. The health route is `/health` (and `/ready`). Not a bug, but any doc or script that uses `/api/health` would be wrong.
4. `frontend/src/utils/offlineStorage.ts:112` leaves a `console.log` in the service worker registration path.
5. `backend/chat/config.js` reads `CHAT_MOCK`. `groqService.js` rejects it with 503, so it is inert, but it is a mock switch in a production path.
6. Groq is a real feature (Heritage Guide chatbot), not leftover code. Key is server-side only, `GROQ_API_KEY=` empty in `.env.example`.
7. No TODO/FIXME in source. No hardcoded API keys found. No tracked `.env` files.
8. `localhost` appears in source only inside the production CORS check in `backend/config/env.js`.
9. Tooling note: Git Bash rewrites `VITE_API_BASE_URL=/api` to `C:/Program Files/Git/api`. Use `MSYS_NO_PATHCONV=1` or PowerShell.
