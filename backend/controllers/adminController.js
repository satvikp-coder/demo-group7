import { log } from "../services/logger.js";
import { randomUUID } from "node:crypto";
import * as catalog from "../models/adminModel.js";
import { destinationSearchCache } from "../services/destinationSearchCache.js";

export function status(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({ status: "ok", user: { id: req.user.id, role: req.user.role } });
}

export function handlers(resource) {
  async function refreshSearch() {
    if (!["destinations", "attractions"].includes(resource)) return;
    // A coalesced refresh may have started before this write committed. Wait for it,
    // then load a new snapshot; never report a committed mutation as failed.
    try {
      await destinationSearchCache.inFlight?.catch(() => {});
      await destinationSearchCache.refresh();
    } catch {
      log("catalog_search_refresh_failed", {}, "error");
    }
  }
  return {
    create: async (req,res) => {
      const id = req.validated.params?.id ?? randomUUID();
      const row = await catalog.create(resource,id,req.validated.body);
      await refreshSearch();
      res.location(`/api/admin/${resource}/${row.id}`).status(201).json(row);
    },
    update: async (req,res) => {
      const row = await catalog.update(resource,req.validated.params.id,req.validated.body);
      await refreshSearch();
      res.json(row);
    },
    remove: async (req,res) => {
      await catalog.remove(resource,req.validated.params.id);
      await refreshSearch();
      res.status(204).end();
    },
    get: async (req,res) => res.json(await catalog.get(resource,req.validated.params.id)),
    list: async (req,res) => res.json(await catalog.list(resource,req.validated.query)),
  };
}
