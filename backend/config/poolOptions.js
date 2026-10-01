import { readFileSync } from 'node:fs';

export function poolOptions(source = process.env, maxDefault = 10) {
  const url = new URL(source.DATABASE_URL);
  // Avoid pg connection-string SSL parameters overriding certificate validation.
  for (const key of ['sslmode','sslcert','sslkey','sslrootcert']) {
    if (url.searchParams.has(key)) throw new Error('Use DATABASE_SSL and DATABASE_SSL_CA_FILE instead of URL SSL parameters');
  }
  const integer = (name, fallback, max) => {
    const n = Number(source[name] ?? fallback);
    if (!Number.isInteger(n) || n < 1 || n > max) throw new Error('Invalid ' + name);
    return n;
  };
  const mode = source.DATABASE_SSL ?? 'disable';
  if (!['disable','verify-full'].includes(mode)) throw new Error('Invalid DATABASE_SSL');
  return {
    connectionString: url.href,
    ssl: mode === 'verify-full' ? { rejectUnauthorized: true, ...(source.DATABASE_SSL_CA_FILE ? {ca: readFileSync(source.DATABASE_SSL_CA_FILE, 'utf8')} : {}) } : false,
    max: integer('DB_POOL_MAX', maxDefault, 100),
    idleTimeoutMillis: integer('DB_IDLE_TIMEOUT_MS', 30000, 300000),
    connectionTimeoutMillis: integer('DB_CONNECTION_TIMEOUT_MS', 5000, 60000),
    statement_timeout: integer('DB_STATEMENT_TIMEOUT_MS', 15000, 120000),
    idle_in_transaction_session_timeout: integer('DB_TRANSACTION_IDLE_TIMEOUT_MS', 30000, 120000),
    application_name: 'heritage-planner',
  };
}
