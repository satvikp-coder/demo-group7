# Final marker audit

Every source match is classified below. Dependencies, bundles, generated reports, lockfiles and secret environment files excluded. No runtime domain-data mock found. Static illustration/input placeholders and historical documents remain.

| File:line | Classification | Reason |
|---|---|---|
| backend/controllers/authController.js:10 | FALSE POSITIVE | Random bcrypt comparison hash equalizes unknown-account work; cannot authenticate a fake account. |
| backend/controllers/authController.js:11 | FALSE POSITIVE | Random bcrypt comparison hash equalizes unknown-account work; cannot authenticate a fake account. |
| backend/controllers/authController.js:28 | FALSE POSITIVE | Random bcrypt comparison hash equalizes unknown-account work; cannot authenticate a fake account. |
| backend/controllers/README.md:3 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/models/adminModel.js:37 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| backend/models/README.md:3 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/models/tripModel.js:39 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| backend/package.json:15 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/package.json:16 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/README.md:43 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:57 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:63 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:65 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:68 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:78 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:80 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:83 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:138 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:173 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:196 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:198 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/README.md:240 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| backend/scripts/audit-seed.js:3 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/csvSource.js:86 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/csvSource.js:96 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/csvSource.js:104 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/csvSource.js:114 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed-approvals.json:2 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:5 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:7 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:128 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:152 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:154 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:155 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:161 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/seed.js:170 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/test-auth-http.js:149 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/scripts/test-db-constraints.js:33 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/scripts/test-destinations-http.js:136 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/scripts/test-destinations-http.js:145 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/scripts/test-trips-http.js:92 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/scripts/verify-seed.js:3 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/scripts/verify-seed.js:11 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| backend/tests/admin.test.js:8 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| backend/tests/seed.test.js:30 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| data/CHANGELOG.md:13 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| data/CHANGELOG.md:14 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/README.md:3 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/README.md:5 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/README.md:12 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/README.md:13 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/README.md:14 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/schema/heritage_planner_schema.sql:64 | REFERENCE DATA | Offline historical seed/schema/source; not loaded by request paths. Simulated route CSV rows remain excluded. |
| database/schema/heritage_planner_schema.sql:184 | REFERENCE DATA | Offline historical seed/schema/source; not loaded by request paths. Simulated route CSV rows remain excluded. |
| database/seeds/ahmedabad_gujarat_full_seed.sql:2 | REFERENCE DATA | Offline historical seed/schema/source; not loaded by request paths. Simulated route CSV rows remain excluded. |
| database/seeds/ahmedabad_gujarat_full_seed.sql:6 | REFERENCE DATA | Offline historical seed/schema/source; not loaded by request paths. Simulated route CSV rows remain excluded. |
| database/seeds/README.md:1 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/seeds/README.md:3 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/seeds/README.md:5 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/seeds/README.md:7 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/seeds/README.md:12 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| database/seeds/somnath_dwarka_seed.sql:1 | REFERENCE DATA | Offline historical seed/schema/source; not loaded by request paths. Simulated route CSV rows remain excluded. |
| docs/diagrams/01_system_architecture.mmd:33 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/diagrams/04_dsa_architecture.mmd:17 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/diagrams/08_greedy_flow.mmd:7 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/00_Foundation_Audit.md:18 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:73 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:108 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:156 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:157 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:158 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/01_Project_Proposal.md:164 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/02_Requirements_Specification.md:55 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/02_Requirements_Specification.md:61 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/03_System_Architecture.md:49 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/03_System_Architecture.md:77 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/03_System_Architecture.md:82 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/03_System_Architecture.md:226 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/04_DSA_Architecture.md:24 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/04_DSA_Architecture.md:83 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/04_DSA_Architecture.md:89 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/04_DSA_Architecture.md:317 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/05_Frontend_Documentation.md:20 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/05_Frontend_Documentation.md:66 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/05_Frontend_Documentation.md:90 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/05_Frontend_Documentation.md:106 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/05_Frontend_Documentation.md:128 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:328 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:331 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:336 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:341 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:348 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/06_Database_Design.md:354 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:22 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:23 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:24 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:25 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:26 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:27 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:28 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:29 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:103 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:105 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:109 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/foundation/07_Data_Collection_Plan.md:112 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/REPOSITORY_STRUCTURE.md:20 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/REPOSITORY_STRUCTURE.md:51 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/REPOSITORY_STRUCTURE.md:61 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/REPOSITORY_STRUCTURE.md:62 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/REPOSITORY_STRUCTURE.md:102 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:16 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:116 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:226 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:373 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:475 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:577 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:679 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:781 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:926 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:1036 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.json:1146 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:12 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:25 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:38 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:51 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:64 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:77 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:90 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:103 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:116 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:129 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:142 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:155 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:168 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:181 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:194 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:207 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:220 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:233 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:246 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:259 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:272 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/experiment_results.previous-client.json:285 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/Research_Experiment_Plan.previous-client.md:17 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/Research_Experiment_Plan.previous-client.md:27 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/Research_Experiment_Plan.previous-client.md:40 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/Research_Experiment_Plan.previous-client.md:57 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/research/Research_Experiment_Plan.previous-client.md:90 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| docs/TEAM_RESPONSIBILITIES.md:23 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| dsa/dijkstra/README.md:4 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| dsa/greedy/budgetAllocator.ts:56 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/greedy/budgetAllocator.ts:59 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/greedy/budgetAllocator.ts:61 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/greedy/budgetAllocator.ts:65 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/greedy/budgetAllocator.ts:69 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/greedy/budgetAllocator.ts:71 | FALSE POSITIVE | Algorithm terminology; legacy hotel replacement helper is not invoked by backend planner. |
| dsa/README.md:9 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| frontend/public/sw.js:45 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/README.md:4 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| frontend/README.md:19 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| frontend/README.md:76 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| frontend/scripts/generate-routes.ts:85 | DEVELOPMENT TOOLING | Offline simulation-capable generator not run; output excluded from approved DB and production bundle. |
| frontend/scripts/run-experiments.ts:73 | DEVELOPMENT TOOLING | Seed provenance guard, verification script, or backend experiment; no runtime fake fallback. |
| frontend/src/api/index.ts:240 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/App.tsx:36 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/App.tsx:520 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/App.tsx:750 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/AdminDashboardView.tsx:205 | DOCUMENTATION | Pre-existing Demo Mode display label; CRUD is real authorized API. Label untouched per UI constraint. |
| frontend/src/components/AlgorithmStatsPanel.tsx:32 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/AlgorithmStatsPanel.tsx:67 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/AlgorithmStatsPanel.tsx:69 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/AlgorithmStatsPanel.tsx:133 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/AlgorithmStatsPanel.tsx:136 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/AuthView.tsx:253 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/AuthView.tsx:327 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/AuthView.tsx:462 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/AuthView.tsx:498 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/AuthView.tsx:531 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/AuthView.tsx:561 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/DestinationDetailView.tsx:25 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/DestinationDetailView.tsx:82 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/DestinationDetailView.tsx:413 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/DestinationDetailView.tsx:497 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/DestinationDetailView.tsx:685 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ExploreView.tsx:10 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ExploreView.tsx:232 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/ExploreView.tsx:233 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/ExploreView.tsx:422 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/FeaturedDestinations.tsx:5 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/FeaturedDestinations.tsx:57 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/HotelsView.tsx:6 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/HotelsView.tsx:253 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:3 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:6 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:9 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:50 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:55 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:61 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ImageWithFallback.tsx:62 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ItineraryView.tsx:21 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ItineraryView.tsx:261 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/ItineraryView.tsx:757 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/PlannerModal.tsx:4 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/PlannerModal.tsx:99 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/PlannerModal.tsx:378 | LEGITIMATE PLACEHOLDER | Existing category SVG image fallback, not a fabricated record; preserved under no-UI-change rule. |
| frontend/src/components/ProfileDashboardView.tsx:421 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/ProfileDashboardView.tsx:434 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/components/PwaInstallPrompt.tsx:20 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/ResearchView.tsx:56 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/ResearchView.tsx:81 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/ResearchView.tsx:107 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/components/ResearchView.tsx:190 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:16 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:62 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:65 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:69 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:70 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:72 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/context/LanguageContext.tsx:74 | FALSE POSITIVE | Actual routing statistic, loading/language/asset/renderer fallback, or comment; no substitute domain records. |
| frontend/src/data/destinations.ts:2389 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/data/destinations.ts:2393 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/data/destinations.ts:2395 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/data/translations.ts:57 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/data/translations.ts:203 | LEGITIMATE PLACEHOLDER | Input hint or CSS placeholder selector/translation; not backend data. |
| frontend/src/utils/destinationTrie.ts:124 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/destinationTrie.ts:144 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:144 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:230 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:406 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:497 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:563 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:674 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:805 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:893 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:976 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:1023 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| frontend/src/utils/itineraryPlanner.ts:1148 | REFERENCE DATA | Legacy reference utility/catalog absent from production module graph; Trie retained for tests. |
| README.md:6 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:8 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:10 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:31 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:83 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:163 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:214 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| README.md:217 | DOCUMENTATION | Historical design/report or current setup prose; not executable. Older mock/complete-seed claims are superseded by final DB/runtime evidence. |
| tests/frontend/api_client_browser.py:20 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| tests/frontend/browser_api.py:82 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| tests/frontend/browser_api.py:87 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| tests/frontend/browser_api.py:148 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| tests/frontend/browser_api.py:164 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
| tests/frontend/browser_api.py:227 | TEST DATA | Assertions, temporary fixtures or intercepted negative responses; not production catalog. |
