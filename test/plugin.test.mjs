import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { start, pluginLabel, matchesPlugin } from '../src/index.mjs';

function setup() {
  const dom = new JSDOM('<!doctype html><html><head></head><body><main class="MuiContainer-root"><div role="tablist"><button role="tab" aria-selected="true">Plugins</button></div><section class="MuiContainer-root"><div class="MuiStack-root" id="list"></div></section></main></body></html>', { url: 'https://listen.tidal.com/not-found?LunaSettings' });
  const { window } = dom, { document } = window;
  const registry = { corePlugins: new Set(), plugins: {} };
  for (const [name, enabled] of [['@dev/rich-presence', true], ['@other/lyrics', false]]) {
    registry.plugins[name] = { name, url: name, installed: true, enabled, store: { package: { name, description: 'Music tools' } }, loading: { _: false }, loadError: {} };
    const card = document.createElement('div'); card.className = 'MuiStack-root';
    card.innerHTML = `<div class="MuiBox-root"><div class="MuiStack-root"><h6 class="MuiTypography-h6"><a>${name}</a><span>1.0.0</span></h6><button class="native">Reload</button></div><p>Description</p></div><section><input value="saved setting"></section>`;
    document.querySelector('#list').append(card);
  }
  const original = document.querySelector('main').outerHTML;
  const stop = start({ document, registry, storage: window.localStorage, MutationObserver: window.MutationObserver, location: window.location });
  return { window, document, registry, stop, original };
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

test('friendly names and safe avatar metadata', () => {
  assert.deepEqual(pluginLabel({ name: '@dev/plugin-name' }), { raw: '@dev/plugin-name', title: 'Plugin Name', developer: 'dev', avatar: undefined });
  assert.equal(pluginLabel({ name: 'lastFM', author: { name: 'Author', avatarUrl: 'javascript:alert(1)' } }).avatar, undefined);
});

test('cards collapse without unmounting settings; state persists; unload restores original DOM', async () => {
  const { document, window, stop, original } = setup();
  const setting = document.querySelector('section input');
  assert.equal(document.querySelectorAll('.tlp-collapsed').length, 2);
  const summary = document.querySelector('.tlp-summary'); summary.click();
  assert.equal(summary.getAttribute('aria-expanded'), 'true');
  assert.equal(document.querySelector('section input'), setting);
  assert.equal(JSON.parse(window.localStorage.getItem('tidaluna-prettier:expanded:v1'))['@dev/rich-presence'], true);
  await flush();
  assert.equal(document.querySelectorAll('.tlp-toolbar').length, 1);
  stop(); await flush();
  assert.equal(document.querySelector('main').outerHTML, original);
  assert.equal(document.querySelector('.tlp-styles'), null);
  window.close();
});

test('search, combined status filters, empty results, bulk expansion', () => {
  const { document, window, registry, stop } = setup();
  const search = document.querySelector('input[type="search"]');
  search.value = 'OTHER lyrics'; search.dispatchEvent(new window.Event('input'));
  assert.equal(document.querySelectorAll('.tlp-card:not(.tlp-filtered)').length, 1);
  const select = document.querySelector('select'); select.value = 'active'; select.dispatchEvent(new window.Event('change'));
  assert.equal(document.querySelector('.tlp-empty').hidden, false);
  select.value = 'inactive'; select.dispatchEvent(new window.Event('change'));
  [...document.querySelectorAll('.tlp-toolbar button')].find(b => b.textContent === 'Alle ausklappen').click();
  assert.equal(document.querySelectorAll('.tlp-card:not(.tlp-collapsed)').length, 1);
  registry.plugins['@other/lyrics'].loadError._ = 'Failed';
  assert.equal(matchesPlugin(registry.plugins['@other/lyrics'], 'other', 'error'), true);
  stop(); window.close();
});

test('tab changes remove enhancements and returning rebuilds them', async () => {
  const { document, window, stop } = setup();
  const tab = document.querySelector('[role="tab"]');
  tab.textContent = 'Plugin Store'; await flush();
  assert.equal(document.querySelector('.tlp-toolbar'), null);
  tab.textContent = 'Plugins'; await flush();
  assert.equal(document.querySelectorAll('.tlp-summary').length, 2);
  document.querySelector('.tlp-card').remove(); await flush();
  assert.match(document.querySelector('.tlp-count').textContent, /1 von 1/);
  stop(); window.close();
});
