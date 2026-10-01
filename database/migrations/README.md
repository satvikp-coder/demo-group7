# Database migrations

Executable ordered migrations live in [backend/migrations](../../backend/migrations/).
Run `npm --prefix backend run db:migrate` with a maintenance/owner connection.
The canonical schema is adopted or created, then numbered upgrades are applied
transactionally with an advisory lock and SHA256 ledger. Append migrations rather
than editing already applied files. Fresh and repeated application are tested.

See [the production runbook](../../docs/PRODUCTION.md) for runtime grants,
backup-before-upgrade, safe data updates and rollback without losing user data.
