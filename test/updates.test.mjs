import test from 'node:test';
import assert from 'node:assert/strict';
import { installUpdateTransport, isDuffedDownload, updateStorePlugins } from '../src/index.mjs';
import { validatePrettier } from '../distribution/sync-prettier.mjs';
import { createHash } from 'node:crypto';
const base = 'https://github.com/Duffed/tidaluna-smart-shuffle/releases/download/latest';

test('store sync rejects mixed-version code before publication', () => {
  const code = 'export const unloads = new Set();';
  const pkg = { name: '@Duffed/tidaluna-prettier', version: '1.3.0', hash: createHash('sha256').update(code).digest('hex') };
  assert.equal(validatePrettier(pkg, code), pkg);
  assert.throws(() => validatePrettier(pkg, `${code}\n// different build`), /hash mismatch/);
  assert.throws(() => validatePrettier({ ...pkg, name: 'other' }, code), /identity/);
});

test('only mutable Duffed distribution requests bypass cache and cleanup restores fetch', async () => {
  const calls = [], original = async (...args) => calls.push(args);
  const target = { fetch: original, Request };
  const stop = installUpdateTransport(target);
  await target.fetch(`${base}/store.json`);
  await target.fetch(`${base}/tidaluna-prettier.json`);
  await target.fetch(`${base}/tidaluna-prettier.mjs`);
  await target.fetch(new Request(`${base}/local.smart-shuffle.json`, { headers: { 'X-Test': 'yes' } }));
  assert.ok(calls.slice(0, 3).every(([url, options]) => url.includes('tlp_update=') && options.cache === 'no-store'));
  assert.equal(calls[3][0].headers.get('X-Test'), 'yes');
  assert.equal(calls[3][1].cache, 'no-store');
  await target.fetch('https://api.tidal.com/test');
  assert.deepEqual(calls[4], ['https://api.tidal.com/test', undefined]);
  assert.equal(isDuffedDownload('https://github.com/another/store/releases/download/latest/store.json'), false);
  assert.equal(isDuffedDownload(`${base}/../secret.json`), false);
  stop(); assert.equal(target.fetch, original);
});

test('updates use installed URLs, skip disabled plugins and reload self last', async () => {
  const order = [];
  function plugin(name, file, enabled = true) {
    const p = { name, url: `${base}/${file}`, enabled, installed: true, store: { package: { name, hash: 'old' } } };
    p.reload = async () => { order.push(name); p.store.package.hash = 'new'; };
    return p;
  }
  const self = plugin('@Duffed/tidaluna-prettier', 'tidaluna-prettier');
  const smart = plugin('@local/smart-shuffle', 'local.smart-shuffle');
  const disabled = plugin('disabled', 'tidaluna-prettier', false);
  const foreign = { ...smart, url: 'https://other.example/plugin', name: 'foreign' };
  const registry = { plugins: { self, smart, disabled, foreign }, fetchPackage: async url => ({ name: url.endsWith('/tidaluna-prettier') ? self.name : smart.name, hash: 'new' }) };
  assert.deepEqual(await updateStorePlugins(registry, () => {}), { updated: 2, skipped: 1, failed: 0 });
  assert.deepEqual(order, [smart.name, self.name]);
  assert.equal(self.url, `${base}/tidaluna-prettier`);
  assert.equal(disabled.enabled, false);
});

test('silently failed Luna reload is reported instead of claiming success', async () => {
  const p = { name: '@Duffed/tidaluna-prettier', url: `${base}/tidaluna-prettier`, installed: true, enabled: true, store: { package: { name: 'Prettier', hash: 'old' } }, reload: async () => {} };
  const registry = { plugins: { p }, fetchPackage: async () => ({ name: p.name, hash: 'new' }) };
  assert.equal((await updateStorePlugins(registry, () => {})).failed, 1);
  assert.equal((await updateStorePlugins(registry, () => {}, () => true)).updated, 0);
});
