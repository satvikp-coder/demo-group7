import { build } from "../../frontend/node_modules/vite/dist/node/index.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../frontend", import.meta.url));
await build({ root, plugins: [{
  name: "verify-api-runtime-sources",
  generateBundle() {
    const modules = [...this.getModuleIds()].map(id => id.replaceAll("\\", "/"));
    const legacyModules = modules.filter(id => /\/src\/(data\/destinations|data\/routesCsv|utils\/itineraryPlanner|utils\/destinationTrie)\.ts$/.test(id));
    const report = { checkedAt: new Date().toISOString(), moduleCount: modules.length, legacyModules, verified: legacyModules.length === 0 };
    writeFileSync(new URL("../../backend/reports/frontend-build-report.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
    if (legacyModules.length) this.error("Reference catalog/planner unexpectedly entered the runtime bundle: " + legacyModules.join(", "));
  },
}] });
