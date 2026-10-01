#!/bin/sh
set -eu
# psql quotes the password variable as a literal; values never enter logs.
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 <<'SQL'
\getenv app_password POSTGRES_APP_PASSWORD
CREATE ROLE heritage_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'app_password';
SQL
