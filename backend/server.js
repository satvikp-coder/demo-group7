import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./config/database.js";
import { log } from "./services/logger.js";
import { requestLogging, limiter } from "./middleware/production.js";
import { pathToFileURL } from "node:url";
import { env } from "./config/env.js";
import { closeDatabase } from "./config/database.js";
import { HttpError, errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import { destinationSearchCache } from "./services/destinationSearchCache.js";

export function createApp({checkDatabase = () => pool.query("SELECT generation_summary FROM trips LIMIT 0; SELECT reverse_distance_km FROM routes LIMIT 0; SELECT provenance_review FROM attractions LIMIT 0; SELECT id FROM users LIMIT 0; SELECT id FROM budgets LIMIT 0")} = {}) {
  const app = express();
  app.disable("x-powered-by");
  if (env.TRUST_PROXY) app.set("trust proxy", env.TRUST_PROXY.split(","));
  app.use(requestLogging);
  app.use(helmet());
  const origins = env.CORS_ORIGIN.split(",");
  app.use(cors({ origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, origin || false);
    return callback(new HttpError(403, "Origin not allowed"));
  }, methods:["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders:["Content-Type","Authorization"], exposedHeaders:["X-Request-ID"] }));
  app.use("/api", (req,res,next) => { res.set("Cache-Control", "no-store"); next(); }, limiter("api", 1200));
  app.use("/api/auth/login", limiter("login", env.AUTH_RATE_LIMIT, 15*60000));
  app.use("/api/auth/register", limiter("registration", env.AUTH_RATE_LIMIT, 15*60000));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "heritage-tourism-backend" });
  });

  app.get("/ready", async (req,res) => {
    res.set("Cache-Control", "no-store");
    if (app.locals.draining) return res.status(503).json({status:"unavailable"});
    try { await checkDatabase(); res.json({status:"ready"}); }
    catch { log("readiness_failed", {requestId:req.requestId}, "error"); res.status(503).json({status:"unavailable"}); }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/destinations", destinationRoutes);
  app.use("/api/trips", tripRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export async function startServer(port = env.PORT) {
  // No request can trigger a fresh index build; warm it before accepting traffic.
  await destinationSearchCache.start();
  const app = createApp();
  const server = app.listen(port, () => {
    log("server_start", {port:server.address().port});
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.on("error", async () => {
    log("server_start_error", {}, "error");
    await destinationSearchCache.stop();
    await closeDatabase();
    process.exitCode = 1;
  });

  let draining = false;
  const shutdown = signal => {
    if (draining) return;
    draining = true; app.locals.draining = true;
    log("server_shutdown", {signal});
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      try {
        await destinationSearchCache.stop();
        await closeDatabase();
        log("server_shutdown_complete");
      } catch { log("server_shutdown_error", {}, "error"); process.exitCode=1; }
      finally { clearTimeout(timeout); }
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch(async () => {
    log("server_initialization_failed", {}, "error");
    await destinationSearchCache.stop();
    await closeDatabase();
    process.exitCode = 1;
  });
}
