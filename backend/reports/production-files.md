# Production file inventory

No Git metadata/history exists. This inventory combines filesystem hashes, prior-report hashes and explicitly reviewed edits; it is not an upstream commit diff.

| File | Why |
|---|---|
| `.dockerignore` | Safe public configuration and exclusions for secrets, archives and build caches. |
| `.env.production.example` | Safe public configuration and exclusions for secrets, archives and build caches. |
| `.github/workflows/production.yml` | Isolated PostgreSQL/Docker CI gates and retained sanitized evidence. |
| `.gitignore` | Safe public configuration and exclusions for secrets, archives and build caches. |
| `backend/.env.example` | Safe public configuration and exclusions for secrets, archives and build caches. |
| `backend/config/database.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/config/env.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/config/poolOptions.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/controllers/adminController.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/controllers/authController.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/controllers/destinationController.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/Dockerfile` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `backend/middleware/auth.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/middleware/errorHandler.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/middleware/production.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/migrations/002-seed-ownership.sql` | Additive seed-ownership, directional-route and field-review schema upgrades. |
| `backend/migrations/003-directional-road-estimates.sql` | Additive seed-ownership, directional-route and field-review schema upgrades. |
| `backend/migrations/004-field-provenance-review.sql` | Additive seed-ownership, directional-route and field-review schema upgrades. |
| `backend/models/destinationModel.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/package-lock.json` | Production middleware/dependency patch and unified build/test/maintenance commands. |
| `backend/package.json` | Production middleware/dependency patch and unified build/test/maintenance commands. |
| `backend/README.md` | Reproducible development/production operations, test setup and data limitations. |
| `backend/reports/admin-http-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/auth-http-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/completion-platform-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/completion-research-browser-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/data-provenance.json` | Field evidence/review regenerated without promoting unverified records. |
| `backend/reports/data-provenance.md` | Field evidence/review regenerated without promoting unverified records. |
| `backend/reports/destinations-http-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/final-budget-browser.png` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/final-invalid-destination-browser.png` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/frontend-api-client-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/frontend-browser-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/frontend-build-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/PRODUCTION_READINESS.md` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-api-smoke.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-data-audit.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-data-freshness.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-files.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-files.md` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-local-upgrade.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-prior-evidence-inventory.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-provenance-review.json` | Field evidence/review regenerated without promoting unverified records. |
| `backend/reports/production-source-audit.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production-source-baseline.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/api-client-browser.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/application-start.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/audit-backend.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/audit-frontend.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/backend-id.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/backend-logs.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/backend-restart.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/backend-syntax.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/backend-unit.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/browser-development.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/browser-platform.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/browser-production.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-artifacts.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-build.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-data-verify.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-migrate.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-reseed.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-seed.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/container-suite.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/database-outage.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/database-restoration.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-build.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-id.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-inspection.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-logs.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-types.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/frontend-unit-planner.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/full-suite.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/graceful-stop.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/http-admin.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/http-auth.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/http-db.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/http-destinations.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/http-trips.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/memory-after.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/memory-before.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/postgres-id.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/postgres-ready.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/postgres-start.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/production-api-smoke.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/research-browser.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/reseed-preservation.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/restart-after-deliberate-rate-limit.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/restored-backend-start.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/restored-runtime-grants.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/source-audit.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/staging-stop.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/stop-before-recovery.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/production/tls-configuration.txt` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/research-preservation.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/researched-itinerary-budget-browser.png` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/reports/trips-http-report.json` | Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical. |
| `backend/routes/adminRoutes.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/routes/authRoutes.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/routes/destinationRoutes.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/routes/tripRoutes.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/scripts/adopt-seed.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/audit-research.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/audit-seed.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/backup.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/check-syntax.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/data-freshness.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/database.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/migrate.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/provision-operator.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/seed-research-routes.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/seed-research.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/seed.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/scripts/seedOwnership.js` | Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools. |
| `backend/server.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/services/destinationSearchCache.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/services/logger.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/services/tripPlanner.js` | Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations. |
| `backend/tests/production.test.js` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `backend/tests/trips.test.js` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `CODEX_HANDOFF.md` | Canonical current state, verification and external next steps; history preserved. |
| `compose.staging.yml` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `compose.tls.yml` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `compose.yml` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `data/research/pages/5f46644fdb588b10.html` | Redact embedded third-party token/key patterns from archived HTML; retain factual research. |
| `data/research/pages/73f7d3e7111a48e6.html` | Redact embedded third-party token/key patterns from archived HTML; retain factual research. |
| `data/research/pages/b0fdeef2c9c7a17d.html` | Redact embedded third-party token/key patterns from archived HTML; retain factual research. |
| `data/research/production-provenance-champaner.json` | Primary-source identity review and honest per-field classifications. |
| `data/research/production-provenance-gir-national-park.json` | Primary-source identity review and honest per-field classifications. |
| `data/research/production-provenance-modhera.json` | Primary-source identity review and honest per-field classifications. |
| `data/research/production-provenance-rann-of-kutch.json` | Primary-source identity review and honest per-field classifications. |
| `data/research/production-provenance-saputara.json` | Primary-source identity review and honest per-field classifications. |
| `database/migrations/README.md` | Reproducible development/production operations, test setup and data limitations. |
| `database/README.md` | Reproducible development/production operations, test setup and data limitations. |
| `deploy/Caddyfile` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `deploy/postgres-init.sh` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `docs/PRODUCTION.md` | Reproducible development/production operations, test setup and data limitations. |
| `frontend/.env.example` | Safe public configuration and exclusions for secrets, archives and build caches. |
| `frontend/Dockerfile` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `frontend/nginx.conf` | Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs. |
| `frontend/package-lock.json` | Production middleware/dependency patch and unified build/test/maintenance commands. |
| `frontend/package.json` | Production middleware/dependency patch and unified build/test/maintenance commands. |
| `frontend/README.md` | Reproducible development/production operations, test setup and data limitations. |
| `frontend/src/api/index.ts` | Functional bulk catalog validation/request reduction and honest dated-quote/routing warnings; no visual source changes. |
| `frontend/vite.config.ts` | Safe production API build configuration, source-map policy and reproducible static hosting. |
| `package.json` | Production middleware/dependency patch and unified build/test/maintenance commands. |
| `README.md` | Reproducible development/production operations, test setup and data limitations. |
| `requirements-tests.txt` | Reproducible development/production operations, test setup and data limitations. |
| `scripts/data-audit.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/production-smoke.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/report-production-files.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/run.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/source-audit.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/test-all.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/test-production.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `scripts/upgrade-local.js` | Sequential isolated full/production gates, recovery/load/source/data audits and file evidence. |
| `tests/dsa/trie.test.ts` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `tests/frontend/api_client_browser.py` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `tests/frontend/browser_api.py` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `tests/frontend/completion_auxiliary.py` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `tests/frontend/planner.test.ts` | Focused security/directional/API/browser regression coverage and measured assertion banners. |
| `tests/README.md` | Reproducible development/production operations, test setup and data limitations. |
| `vercel.json` | Safe production API build configuration, source-map policy and reproducible static hosting. |
