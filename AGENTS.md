# Permanent shared Codex instructions

These instructions apply equally to codex1, codex2, and any future Codex session.
Project files are the source of truth; do not rely on private conversation memory.

## Start of every session

1. Check that root AGENTS.md and CODEX_HANDOFF.md exist. Preserve existing instructions;
   create missing files automatically. Always read CODEX_HANDOFF.md fully first.
2. Inspect relevant current project files before editing. Run git status and git diff
   (including staged changes when present). If Git metadata is unavailable, record
   that limitation and inspect the filesystem; do not assume this is a clean checkout.
3. Understand completed work and continue from the existing state. If conversation or
   documentation conflicts with code, inspect the actual implementation and correct
   the handoff. Do not redo completed work or unnecessarily redesign/rebuild features.

## During work and cross-account coordination

- Preserve existing working features and all other sessions' pending changes. Never
  discard, reset, or overwrite working changes without explicit user instruction.
- Assume another profile may edit the same folder. Re-read a file immediately before
  changing it, especially the handoff; merge new information instead of replacing it
  with a stale copy. Coordinate overlapping work if another session is active.
- Record the current goal, completed tasks, files changed/created, technical decisions,
  commands, dependencies/setup, bugs found/fixed, remaining issues, tests and exact next steps.
- Update CODEX_HANDOFF.md after major progress and before ending, stopping, or responding
  to a stop request. Preserve useful history and architectural decisions; revise stale
  claims. Distinguish observed code, historical reports, and tests actually run now.
- Keep credentials, tokens and secret environment values out of the handoff.
- Use project-relative paths so the record works across accounts and folder locations.
- Record session/profile identity only when known; never guess. A handoff is not a lock.

## Required handoff structure

Keep the title `# CODEX HANDOFF` and these exact section headings, in order:
Project Summary; Current Goal; Current Project State; Completed; Files Changed;
Files Created; Technical Decisions; Dependencies / Setup Changes; Commands Used;
Testing Completed; Current Issues / Bugs; Important Warnings; Next Steps;
Last Session Summary; Last Updated. Each section uses a level-two heading.
Last Updated must include the latest date/time and timezone whenever the file changes.
Make the record sufficient for another account with no conversation access to continue.

## Stabilization verification continuity

- Read docs/RELEASE_VERIFICATION.md and backend/reports/LOCAL_FINAL_READINESS.md
  for current release/local readiness. FINAL_VERIFICATION.md is a historical
  completion audit. Local readiness does not claim public deployment. Never force
  over-budget selected hotels into complete plans.
- Run catalog-mutating browser/API suites sequentially. Their temporary catalog
  records can interfere with another suite's expected counts and preservation
  snapshots. Cleanup must use exact fixture IDs, never reset the database.
- Preserve the centralized API client and frontend design. When functionality
  requires a component edit, keep classes, styles, JSX structure, assets and tokens;
  tests/frontend/completion-source-audit.mjs records this session's comparisons.
- Do not promote unknown route fares, reverse-direction assumptions, museum
  reopening, or wheelchair suitability into verified facts. Retain provenance and
  the explicit missing-endpoint behavior for account edits and public sharing.
