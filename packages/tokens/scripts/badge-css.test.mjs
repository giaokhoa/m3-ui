import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Badge component colors alias canonical runtime roles', async () => {
  const badge = (await readJson('tokens/component/badge.json')).component.badge;

  assert.equal(badge.small.color.$value, '{color.role.error}');
  assert.equal(badge.large.color.$value, '{color.role.error}');
  assert.equal(badge.large.labelTextColor.$value, '{color.role.onError}');
});

test('generated JS resolves Badge semantic aliases to ThemeProvider runtime expressions', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?badge=${Date.now()}`
  );

  assert.equal(generated.ComponentBadgeSmallColor, 'var(--error)');
  assert.equal(generated.ComponentBadgeLargeColor, 'var(--error)');
  assert.equal(generated.ComponentBadgeLargeLabelTextColor, 'var(--on-error)');
});

test('generated Badge CSS owns immutable paint, size, shape and typography', async () => {
  const css = await readFile(new URL('dist/generated/badge.css', packageRoot), 'utf8');

  assert.match(css, /\.badge--dot \{/);
  assert.match(css, /--_badge-container-color: var\(--error\);/);
  assert.match(css, /--_badge-content-color: transparent;/);
  assert.match(css, /--_badge-size: 6px;/);
  assert.match(css, /--_badge-radius: 9999px;/);

  assert.match(css, /\.badge--content \{/);
  assert.match(css, /--_badge-content-color: var\(--on-error\);/);
  assert.match(css, /--_badge-size: 16px;/);
  assert.match(css, /--_badge-font-family: var\(--font-family-plain\);/);
  assert.match(css, /--_badge-font-size: 11px;/);
  assert.match(css, /--_badge-line-height: 16px;/);
  assert.match(css, /--_badge-font-weight: 500;/);
  assert.match(css, /--_badge-letter-spacing: 0\.5px;/);

  assert.doesNotMatch(css, /(^|\s)--error\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
