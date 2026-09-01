import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
async function css(name) {
  return readFile(new URL(`dist/generated/${name}.css`, packageRoot), 'utf8');
}

test('generated navigation bars own selected disabled and interaction state', async () => {
  const [bar, rail, short] = await Promise.all([
    css('navigation-bar'),
    css('navigation-rail'),
    css('short-navigation-bar'),
  ]);
  assert.match(bar, /\.navigation-bar-item\[data-selected\]/);
  assert.match(bar, /\.navigation-bar-item\[data-disabled\]/);
  assert.match(bar, /data-focus-visible/);
  assert.match(rail, /\.navigation-rail-item:not\(\[data-has-label\]\)/);
  assert.match(rail, /\.navigation-rail-item\[data-selected\]/);
  assert.match(short, /data-icon-position='start'/);
  assert.match(short, /\.short-navigation-bar-item\[data-selected\]/);
});

test('generated drawer and wide rail CSS own immutable paint motion and state', async () => {
  const [drawer, wide, modal] = await Promise.all([
    css('navigation-drawer'),
    css('wide-navigation-rail'),
    css('modal-wide-navigation-rail'),
  ]);
  assert.match(drawer, /\.navigation-drawer-item\[data-selected\]/);
  assert.match(drawer, /data-hovered/);
  assert.match(drawer, /--_navigation-drawer-open-duration:/);
  assert.match(wide, /\.wide-navigation-rail-item\[data-expanded\]/);
  assert.match(wide, /\.wide-navigation-rail-item\[data-selected\]/);
  assert.match(modal, /\.modal-wide-navigation-rail-overlay\s*\{/);
  assert.match(modal, /--_modal-wide-navigation-rail-slide-duration:/);
  assert.doesNotMatch(modal, /^\.modal-wide-navigation-rail\s*\{/m);
});

test('generated Tabs CSS owns variant and RAC state styling', async () => {
  const value = await css('tabs');
  assert.match(value, /\.tabs\[data-variant='primary'\]/);
  assert.match(value, /\.tabs\[data-variant='secondary'\]/);
  assert.match(value, /\.tabs__tab\[data-selected\]/);
  assert.match(value, /\.tabs__tab\[data-disabled\]/);
  assert.doesNotMatch(value, /#[0-9a-f]{3,8}/i);
});
