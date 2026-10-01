// Direct curl -> HTTP -> Express -> real PostgreSQL verification.
// Creates uniquely named test users and deletes only those exact IDs afterward.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createApp } from "../server.js";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";

const server = createApp().listen(0, "127.0.0.1");
await once(server, "listening");
const baseUrl = "http://127.0.0.1:" + server.address().port;
const suffix = randomUUID();
const password = "Aa1!" + randomBytes(24).toString("hex");
const touristEmail = "tourist-" + suffix + "@example.test";
const operatorEmail = "operator-" + suffix + "@example.test";
const createdIds = [];
const exchanges = [];

function redact(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key, ["password", "token", "password_hash"].includes(key) ? "[redacted]" :
      item && typeof item === "object" ? redact(item) : item,
  ]));
}

async function request(method, path, body, token) {
  const args = ["--silent", "--show-error", "--max-time", "15", "--request", method,
    "--write-out", "\n%{http_code}", baseUrl + path];
  if (body) args.push("--header", "Content-Type: application/json", "--data-binary", "@-");
  if (token) args.push("--header", "Authorization: Bearer " + token);
  const child = spawn(process.platform === "win32" ? "curl.exe" : "curl", args, {
    windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
  });
  let output = "";
  let errorText = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { errorText += chunk; });
  child.stdin.end(body ? JSON.stringify(body) : undefined);
  const [code] = await once(child, "close");
  if (code !== 0) throw new Error("curl failed: " + errorText);
  const split = output.lastIndexOf("\n");
  const status = Number(output.slice(split + 1));
  const json = JSON.parse(output.slice(0, split));
  exchanges.push({
    request: { method, path, ...(body ? { body: redact(body) } : {}),
      ...(token ? { authorization: "Bearer [redacted]" } : {}) },
    response: { status, body: redact(json) },
  });
  return { status, body: json };
}

let hashEvidence;
let decodedClaims;
let verified = false;
try {
  for (const body of [
    { name: "Invalid Email", email: "not-an-email", password, role: "tourist" },
    { name: "Weak Password", email: touristEmail, password: "weak", role: "tourist" },
    { name: "Invalid Role", email: touristEmail, password, role: "admin" },
    { name: "Long UTF8", email: touristEmail, password: "Aa1!" + "é".repeat(35), role: "tourist" },
  ]) assert.equal((await request("POST", "/api/auth/register", body)).status, 400);

  const tourist = await request("POST", "/api/auth/register", {
    name: "Authentication Test Tourist", email: touristEmail, password, role: "tourist",
  });
  if (tourist.body.user?.id) createdIds.push(tourist.body.user.id);
  assert.equal(tourist.status, 201);
  assert.equal(tourist.body.user.role, "tourist");
  assert.equal("password_hash" in tourist.body.user, false);

  const operator = await request("POST", "/api/auth/register", {
    name: "Authentication Test Operator", email: operatorEmail, password, role: "tour_operator",
  });
  if (operator.body.user?.id) createdIds.push(operator.body.user.id);
  assert.equal(operator.status, 201);
  assert.equal(operator.body.user.role, "tour_operator");

  const stored = (await pool.query(
    "SELECT password_hash FROM users WHERE id = $1", [tourist.body.user.id],
  )).rows[0].password_hash;
  assert.match(stored, /^\$2[ab]\$12\$/);
  assert.notEqual(stored, password);
  assert.equal(await bcrypt.compare(password, stored), true);
  hashEvidence = { algorithm: "bcrypt", rounds: bcrypt.getRounds(stored),
    matchesSuppliedPassword: true, storedPlaintext: false };

  const duplicate = await request("POST", "/api/auth/register", {
    name: "Duplicate", email: touristEmail.toUpperCase(), password, role: "tourist",
  });
  assert.equal(duplicate.status, 409);

  const touristLogin = await request("POST", "/api/auth/login", { email: touristEmail, password });
  assert.equal(touristLogin.status, 200);
  const touristToken = touristLogin.body.token;
  const claims = jwt.verify(touristToken, env.JWT_SECRET, { algorithms: ["HS256"] });
  assert.equal(claims.sub, tourist.body.user.id);
  assert.equal(claims.role, "tourist");
  assert.equal(claims.exp - claims.iat, 3600);
  decodedClaims = claims;

  const wrong = await request("POST", "/api/auth/login", {
    email: touristEmail, password: "Wrong1!" + randomBytes(16).toString("hex"),
  });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.body, { error: { message: "Invalid email or password" } });
  const invented = await request("POST", "/api/auth/login", {
    email: "nonexistent-" + suffix + "@example.test", password,
  });
  assert.equal(invented.status, 401);
  assert.deepEqual(invented.body, wrong.body);
  assert.equal("token" in invented.body, false);

  const me = await request("GET", "/api/auth/me", undefined, touristToken);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, "Authentication Test Tourist");
  assert.equal(me.body.user.email, touristEmail.toLowerCase());
  assert.equal(me.body.user.role, "tourist");
  assert.equal(me.body.user.password_hash, undefined);
  assert.equal((await request("GET", "/api/admin/status")).status, 401);
  assert.equal((await request("GET", "/api/admin/status", undefined, touristToken)).status, 403);
  const parts = touristToken.split(".");
  parts[1] = Buffer.from(JSON.stringify({ ...claims, role: "tour_operator" })).toString("base64url");
  assert.equal((await request("GET", "/api/admin/status", undefined, parts.join("."))).status, 401);

  const expired = jwt.sign({ role: "tour_operator" }, env.JWT_SECRET, {
    algorithm: "HS256", subject: operator.body.user.id, expiresIn: -1,
  });
  assert.equal((await request("GET", "/api/admin/status", undefined, expired)).status, 401);

  const operatorLogin = await request("POST", "/api/auth/login", { email: operatorEmail, password });
  assert.equal(operatorLogin.status, 200);
  assert.equal((await request("GET", "/api/admin/status", undefined, operatorLogin.body.token)).status, 200);
  verified = true;
} finally {
  // Restrict deletion to the two UUIDs returned by this run's registrations.
  if (createdIds.length) await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [createdIds]);
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await pool.end();
}
const report = {
  verified, generatedAt: new Date().toISOString(), baseUrl,
  client: "curl", backend: "real PostgreSQL; no mocked credential lookup",
  redactions: "Passwords and signed bearer tokens are redacted; statuses, UUIDs, and response fields are actual.",
  testUsersRemoved: true, hashEvidence, decodedClaims, exchanges,
};
await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
await writeFile(new URL("../reports/auth-http-report.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
console.table(exchanges.map((item) => ({ method: item.request.method, path: item.request.path, status: item.response.status })));
console.log("All direct curl auth checks passed. Temporary users removed.");
console.log("Full request/response pairs: backend/reports/auth-http-report.json");
