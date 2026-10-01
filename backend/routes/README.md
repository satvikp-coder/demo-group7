# Routes

Mounted API groups: `/api/auth`, `/api/destinations` (including bulk catalog,
search and child collections), `/api/trips` (owned listing, creation, generation,
retrieval and budget), and `/api/admin` (operator catalog CRUD/status).
Protected routes validate JWTs and current database accounts/roles; trip reads
and writes enforce ownership. `/health` is liveness; `/ready` checks PostgreSQL.
See [API documentation](../README.md) for contracts.
