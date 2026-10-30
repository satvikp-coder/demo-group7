// In-memory request cache with in-flight de-duplication, for the public destination catalog.
// - One load per key: concurrent callers share the same promise, later callers get the stored result.
// - A failed load is never kept, so the next call retries.
// - A caller's AbortSignal only cancels that caller's wait; it never cancels the shared load for others.
// - Results are cloned on the way out so one consumer cannot mutate what another receives.
// - clear() drops everything (used after admin edits and on logout); a load that was started before
//   clear() finishes but is not stored.
export interface RequestCache {
  get<T>(key: string, load: () => Promise<T>, signal?: AbortSignal): Promise<T>;
  clear(): void;
}

const abortError = () => Object.assign(new Error("The operation was aborted."), { name: "AbortError" });

function untilAborted<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      value => { signal.removeEventListener("abort", onAbort); resolve(value); },
      error => { signal.removeEventListener("abort", onAbort); reject(error); },
    );
  });
}

export function createRequestCache(): RequestCache {
  let generation = 0;
  const entries = new Map<string, Promise<unknown>>();
  return {
    get<T>(key: string, load: () => Promise<T>, signal?: AbortSignal): Promise<T> {
      let entry = entries.get(key) as Promise<T> | undefined;
      if (!entry) {
        const started = generation;
        const created = load();
        entry = created;
        entries.set(key, created);
        created.catch(() => { if (entries.get(key) === created) entries.delete(key); });
        // A clear() while loading means the result may be stale: serve it to waiting callers, do not keep it.
        created.then(() => { if (started !== generation && entries.get(key) === created) entries.delete(key); }, () => {});
      }
      return untilAborted(entry.then(value => structuredClone(value)), signal);
    },
    clear() { generation++; entries.clear(); },
  };
}
