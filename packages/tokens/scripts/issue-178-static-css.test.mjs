import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function generated(name) {
  return readFile(new URL(`dist/generated/${name}.css`, packageRoot), 'utf8');
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('issue 178 immutable adaptation facts live in canonical DTCG sources', async () => {
  const split = (await readJson('tokens/component/split-button.json')).component.splitButton;
  const fab = (await readJson('tokens/component/fab-static-defaults.json')).component.fab;
  const fabMenu = (await readJson('tokens/component/fab-menu-static-defaults.json')).component.fabMenu;
  const menu = (await readJson('tokens/component/menu-web-defaults.json')).component.menu.web;

  assert.deepEqual(split.minimumInteractiveSize.$value, { value: 48, unit: 'px' });
  assert.equal(split.checkedStateLayerOpacity.$value, 0.1);
  assert.deepEqual(fab.minimumInteractiveSize.$value, { value: 48, unit: 'px' });
  assert.deepEqual(fab.extended.baseline.expandedMinWidth.$value, { value: 80, unit: 'px' });
  assert.deepEqual(fab.extended.baseline.textOnlyLeadingSpace.$value, { value: 20, unit: 'px' });
  assert.deepEqual(fabMenu.web.horizontalPadding.$value, { value: 16, unit: 'px' });
  assert.deepEqual(menu.minWidth.$value, { value: 112, unit: 'px' });
  assert.deepEqual(menu.maxWidth.$value, { value: 280, unit: 'px' });
});

test('generated ButtonGroup CSS owns immutable geometry, paint and motion', async () => {
  const css = await generated('button-group');
  assert.match(css, /\.button-group\[data-size='small'\] \{/);
  assert.match(css, /--_button-group-height: 40px;/);
  assert.match(css, /--_button-group-gap: 12px;/);
  assert.match(css, /\.button-group--connected\[data-size='small'\]/);
  assert.match(css, /--_button-group-inner-corner: 8px;/);
  assert.match(css, /--_button-group-pressed-inner-corner: 4px;/);
  assert.match(css, /--_button-group-menu-container-color: var\(--surface-container\);/);
  assert.match(css, /--_button-group-motion-duration: 137ms;/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('generated SplitButton CSS owns all static size and interaction defaults', async () => {
  const css = await generated('split-button');
  assert.match(css, /--_split-button-min-interactive-size: 48px;/);
  assert.match(css, /--_split-button-checked-state-layer-opacity: 10%;/);
  assert.match(css, /\.split-button\[data-size='extraSmall'\]/);
  assert.match(css, /--_split-button-container-height: 32px;/);
  assert.match(css, /\.split-button\[data-size='extraLarge'\]/);
  assert.match(css, /--_split-button-container-height: 136px;/);
  assert.match(css, /--_split-button-trailing-icon-size: 50px;/);
});

test('generated FAB CSS owns regular, extended, branded and variant defaults', async () => {
  const css = await generated('fab');
  assert.match(css, /\.fab:not\(\.fab--extended\)\[data-size='small'\]/);
  assert.match(css, /--_fab-target-size: 48px;/);
  assert.match(css, /--_fab-container-height: 40px;/);
  assert.match(css, /--_fab-container-radius: 12px;/);
  assert.match(css, /data-variant='primaryContainer'/);
  assert.match(css, /--_fab-container-color: var\(--primary-container\);/);
  assert.match(css, /--_fab-content-color: var\(--on-primary-container\);/);
  assert.match(css, /data-variant='surface'\]\[data-elevation='lowered'/);
  assert.match(css, /--_fab-container-color: var\(--surface-container-low\);/);
  assert.match(css, /\.fab--extended\[data-size='baseline'\]/);
  assert.match(css, /--_fab-expanded-min-width: 80px;/);
  assert.match(css, /--_fab-text-only-leading-space: 20px;/);
  assert.match(css, /\.fab\.fab--branded:not\(\.fab--extended\) \{/);
  assert.match(css, /\.fab--extended\.fab--branded-extended \{/);
  assert.match(css, /--_fab-icon-size: 36px;/);
  assert.match(css, /--_fab-label-color: var\(--on-surface\);/);
  assert.match(css, /--_fab-expand-size-duration: 137ms;/);
  assert.match(css, /--_fab-expand-opacity-duration: 108ms;/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('generated Menu CSS replaces the generic TS fallback facade', async () => {
  const css = await generated('menu');
  assert.match(css, /--_menu-container-color: var\(--surface-container\);/);
  assert.match(css, /--_menu-color: var\(--on-surface\);/);
  assert.match(css, /--_menu-min-width: 112px;/);
  assert.match(css, /--_menu-max-width: 280px;/);
  assert.match(css, /--_menu-item-min-height: 48px;/);
  assert.match(css, /--_menu-motion-duration: 137ms;/);
  assert.match(css, /--_menu-segmented-padding: 4px;/);
});

test('generated FabMenu CSS owns list-item and toggle family defaults', async () => {
  const css = await generated('fab-menu');
  assert.match(css, /--_fab-menu-horizontal-padding: 16px;/);
  assert.match(css, /--_fab-menu-item-height: 56px;/);
  assert.match(css, /--_fab-menu-item-container-color: var\(--primary-container\);/);
  assert.match(css, /--_fab-menu-item-content-color: var\(--on-primary-container\);/);
  assert.match(css, /\.fab\.fab-menu-toggle\[data-toggle-size='medium'\]/);
  assert.match(css, /--_fab-target-size: 80px;/);
  assert.match(
    css,
    /\.fab\.fab-menu-toggle\[data-toggle-size\]\[data-checked\] \{[^}]*--_fab-container-width: 56px;[^}]*--_fab-container-height: 56px;[^}]*--_fab-container-radius: 28px;/s,
  );
  assert.match(css, /--_fab-icon-size: 20px;/);
  assert.match(css, /--_fab-toggle-effects-duration: 108ms;/);
});
