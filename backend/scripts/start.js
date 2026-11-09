// Production entry for hosts that start one command and cannot chain shell commands (for example Render):
//   node --import tsx scripts/start.js
// It prepares the database (scripts/bootstrap.js) and then starts the API in the same process, so the
// server's own signal handling and graceful shutdown apply unchanged.
import { bootstrap } from "./bootstrap.js";

try {
  await bootstrap();
} catch (error) {
  // Validation messages are safe; PostgreSQL details can contain row contents.
  console.error(error.code ? "Bootstrap failed; SQLSTATE: " + error.code : error.message);
  process.exit(1);
}

const { startServer } = await import("../server.js");
const { destinationSearchCache } = await import("../services/destinationSearchCache.js");
const { closeDatabase } = await import("../config/database.js");
const { log } = await import("../services/logger.js");

startServer().catch(async () => {
  log("server_initialization_failed", {}, "error");
  await destinationSearchCache.stop();
  await closeDatabase();
  process.exitCode = 1;
});
