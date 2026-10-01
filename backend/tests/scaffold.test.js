import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { once } from "node:events";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

process.env.DATABASE_URL = "postgresql://localhost:1/unused_test_database";
process.env.JWT_SECRET = randomBytes(48).toString("hex");
process.env.PORT = "5000";
process.env.CORS_ORIGIN = "http://localhost:5173";

const { createApp } = await import("../server.js");
const { verifyJwt, requireRoles } = await import("../middleware/auth.js");
const { validate } = await import("../middleware/validate.js");
const { errorHandler } = await import("../middleware/errorHandler.js");
const { loadEnv } = await import("../config/env.js");

async function withServer(app, action) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await action("http://127.0.0.1:" + server.address().port);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

test("app liveness works without PostgreSQL; trips require authentication", async () => {
  await withServer(createApp(), async (url) => {
    const response = await fetch(url + "/health", { headers: { Origin: process.env.CORS_ORIGIN } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), process.env.CORS_ORIGIN);
    assert.deepEqual(await response.json(), { status: "ok", service: "heritage-tourism-backend" });
    assert.equal((await fetch(url + "/api/trips")).status, 401);
    assert.equal((await fetch(url + "/api/destinations/search?prefix=Som")).status, 503);
    const invalidJson = await fetch(url + "/health", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(invalidJson.status, 400);
  });
});

test("JWT and role checks reject forged, expired, missing-expiry, and tourist tokens", async () => {
  const app = express();
  app.get("/protected", verifyJwt, requireRoles("tour_operator"), (req, res) => res.json(req.user));
  app.use(errorHandler);
  const sub = randomUUID();
  const sign = (role, options = { expiresIn: "5m" }, key = process.env.JWT_SECRET) =>
    jwt.sign({ role }, key, { subject: sub, algorithm: "HS256", ...options });
  await withServer(app, async (url) => {
    assert.equal((await fetch(url + "/protected")).status, 401);
    for (const token of [
      "invented-token",
      sign("tour_operator", { expiresIn: "5m" }, randomBytes(48).toString("hex")),
      sign("tour_operator", { expiresIn: -1 }),
      sign("tour_operator", {}),
      sign("admin"),
    ]) {
      assert.equal((await fetch(url + "/protected", { headers: { Authorization: "Bearer " + token } })).status, 401);
    }
    assert.equal((await fetch(url + "/protected", { headers: { Authorization: "Bearer " + sign("tourist") } })).status, 403);
    assert.equal((await fetch(url + "/protected", { headers: { Authorization: "Bearer " + sign("tour_operator") } })).status, 200);
  });
});

test("validation rejects invalid input and unexpected errors are sanitized", async () => {
  const app = express();
  app.use(express.json());
  app.post("/validate", validate(z.object({ id: z.string().uuid() }).strict()), (req, res) => res.json(req.validated.body));
  app.get("/failure", async () => { throw new Error("private database information"); });
  app.use(errorHandler);
  await withServer(app, async (url) => {
    assert.equal((await fetch(url + "/validate", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "bad" }),
    })).status, 400);
    const response = await fetch(url + "/failure");
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: { message: "Internal server error" } });
  });
});

test("required configuration fails closed without exposing values", () => {
  assert.throws(() => loadEnv({}), /Missing or invalid environment variables/);
  assert.throws(() => loadEnv({ ...process.env, DATABASE_URL: "invalid" }), /DATABASE_URL/);
  assert.throws(() => loadEnv({ ...process.env, JWT_SECRET: "short" }), /JWT_SECRET/);
  assert.throws(() => loadEnv({ ...process.env, CORS_ORIGIN: "*" }), /CORS_ORIGIN/);
});

test("SQL injection payload stays a bound parameter", async () => {
  const { pool } = await import("../config/database.js");
  const { findById } = await import("../models/destinationModel.js");
  const original = pool.query;
  const payload = "'; DROP TABLE destinations; --";
  let captured;
  pool.query = async (sql, params) => { captured = { sql, params }; return { rows: [] }; };
  try {
    assert.equal(await findById(payload), null);
    assert.equal(captured.sql.includes(payload), false);
    assert.match(captured.sql, /WHERE id = \$1/);
    assert.deepEqual(captured.params, [payload]);
  } finally {
    pool.query = original;
  }
});
