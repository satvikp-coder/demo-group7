import { log } from "./logger.js";
import { Trie } from "../../dsa/trie/Trie.ts";
import { loadSearchRows } from "../models/destinationModel.js";
import { HttpError } from "../middleware/errorHandler.js";

export function normalizeName(value) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export class DestinationSearchCache {
  constructor({ loadRows = loadSearchRows, refreshIntervalMs = 60000 } = {}) {
    this.loadRows = loadRows;
    this.refreshIntervalMs = refreshIntervalMs;
    this.snapshot = null;
    this.inFlight = null;
    this.timer = null;
    this.generation = 0;
  }

  refresh() {
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      const rows = await this.loadRows();
      const trie = new Trie();
      const destinations = new Map();
      const namesById = new Map();
      for (const { indexed_attraction_names, ...destination } of rows) {
        const names = [
          destination.name, destination.gujarati_name, destination.hindi_name,
          ...(indexed_attraction_names ?? []).flat(),
        ].filter((name) => typeof name === "string" && name.trim()).map(normalizeName);
        destinations.set(destination.id, destination);
        namesById.set(destination.id, names);
        for (const name of names) trie.insert(name, destination.id);
      }
      // Swap only a completely loaded index; failures preserve the last real snapshot.
      this.snapshot = { trie, destinations, namesById, refreshedAt: new Date().toISOString() };
      this.generation++;
    })().finally(() => { this.inFlight = null; });
    return this.inFlight;
  }

  async start() {
    if (this.timer) return;
    await this.refresh();
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.refresh().catch(() => {
          log("search_refresh_failed", {}, "error");
        });
      }, this.refreshIntervalMs);
      this.timer.unref();
    }
  }

  async stop() {
    clearInterval(this.timer);
    this.timer = null;
    await this.inFlight?.catch(() => {});
  }

  search(prefix, { limit = 20, offset = 0 } = {}) {
    if (!this.snapshot) throw new HttpError(503, "Destination search is not ready");
    const query = normalizeName(prefix);
    if (!query) return [];
    const { trie, destinations, namesById } = this.snapshot;
    // The shared Trie indexes suffixes, so confirm true full-name prefixes
    // among its candidates instead of returning unintended substring matches.
    return trie.searchPrefix(query)
      .filter((id) => namesById.get(id).some((name) => name.startsWith(query)))
      .slice(offset, offset + limit)
      .map((id) => destinations.get(id));
  }

  getStatus() {
    return {
      generation: this.generation,
      destinationCount: this.snapshot?.destinations.size ?? 0,
      refreshedAt: this.snapshot?.refreshedAt ?? null,
    };
  }
}

export const destinationSearchCache = new DestinationSearchCache();
