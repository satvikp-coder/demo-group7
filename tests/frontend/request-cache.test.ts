import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequestCache} from '../../frontend/src/utils/requestCache';

const deferred = <T>() => { let resolve!: (v: T) => void, reject!: (e: unknown) => void; const promise = new Promise<T>((a, b) => { resolve = a; reject = b; }); return {promise, resolve, reject}; };

test('concurrent callers share one load, and later callers reuse the stored result', async () => {
  const cache = createRequestCache(); let loads = 0; const gate = deferred<{n: number}>();
  const load = () => { loads++; return gate.promise; };
  const calls = [cache.get('catalog', load), cache.get('catalog', load), cache.get('catalog', load), cache.get('catalog', load)];
  gate.resolve({n: 1});
  assert.deepEqual(await Promise.all(calls), [{n: 1}, {n: 1}, {n: 1}, {n: 1}]);
  await cache.get('catalog', load);
  assert.equal(loads, 1);
});

test('different keys load separately', async () => {
  const cache = createRequestCache(); const seen: string[] = [];
  for (const key of ['destination:a', 'destination:b', 'destination:a']) await cache.get(key, async () => { seen.push(key); return key; });
  assert.deepEqual(seen, ['destination:a', 'destination:b']);
});

test('a failed load is not kept, so the next call retries', async () => {
  const cache = createRequestCache(); let loads = 0;
  const load = async () => { loads++; if (loads === 1) throw new Error('boom'); return 'ok'; };
  await assert.rejects(cache.get('k', load), /boom/);
  assert.equal(await cache.get('k', load), 'ok');
  assert.equal(loads, 2);
});

test('clear() drops stored results so the next call loads again', async () => {
  const cache = createRequestCache(); let loads = 0;
  const load = async () => ++loads;
  assert.equal(await cache.get('k', load), 1);
  cache.clear();
  assert.equal(await cache.get('k', load), 2);
});

test('a load that was in flight during clear() is not stored', async () => {
  const cache = createRequestCache(); let loads = 0; const gate = deferred<string>();
  const slow = () => { loads++; return gate.promise; };
  const pending = cache.get('k', slow);
  cache.clear();
  gate.resolve('stale');
  assert.equal(await pending, 'stale'); // the waiting caller still gets its answer
  assert.equal(await cache.get('k', async () => { loads++; return 'fresh'; }), 'fresh');
  assert.equal(loads, 2);
});

test('aborting one caller rejects only that caller; the shared load and other callers are unaffected', async () => {
  const cache = createRequestCache(); let loads = 0; const gate = deferred<string>();
  const load = () => { loads++; return gate.promise; };
  const controller = new AbortController();
  const aborted = cache.get('k', load, controller.signal);
  const other = cache.get('k', load);
  controller.abort();
  await assert.rejects(aborted, (e: Error) => e.name === 'AbortError');
  gate.resolve('value');
  assert.equal(await other, 'value');
  assert.equal(loads, 1);
  await assert.rejects(cache.get('k', load, AbortSignal.abort()), (e: Error) => e.name === 'AbortError');
});

test('results are cloned so a consumer cannot corrupt what others receive', async () => {
  const cache = createRequestCache();
  const first = await cache.get('k', async () => ({list: [1, 2, 3]}));
  first.list.push(99);
  assert.deepEqual(await cache.get('k', async () => ({list: []})), {list: [1, 2, 3]});
});
