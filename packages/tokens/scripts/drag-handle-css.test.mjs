import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('DragHandle semantic colors alias canonical runtime roles', async () => {
  const base = (await readJson('tokens/component/drag-handle.json')).component.dragHandle;
  const states = (await readJson('tokens/component/small-overlap-web-states.json')).component.dragHandle;

  assert.equal(base.default.color.$value, '{color.role.outline}');
  assert.equal(base.pressed.color.$value, '{color.role.onSurface}');
  assert.equal(base.dragged.color.$value, '{color.role.onSurface}');
  assert.equal(states.focusStateLayerColor.$value, '{color.role.inverseOnSurface}');
  assert.equal(states.hoverStateLayerColor.$value, '{color.role.inverseOnSurface}');
});

test('generated DragHandle CSS owns immutable geometry paint and shapes', async () => {
  const css = await readFile(new URL('dist/generated/drag-handle.css', packageRoot), 'utf8');

  assert.match(css, /\.drag-handle \{/);
  assert.match(css, /--_drag-handle-container-width: 24px;/);
  assert.match(css, /--_drag-handle-default-color: var\(--outline\);/);
  assert.match(css, /--_drag-handle-default-height: 48px;/);
  assert.match(css, /--_drag-handle-default-shape: 9999px;/);
  assert.match(css, /--_drag-handle-default-width: 4px;/);
  assert.match(css, /--_drag-handle-pressed-color: var\(--on-surface\);/);
  assert.match(css, /--_drag-handle-pressed-height: 52px;/);
  assert.match(css, /--_drag-handle-pressed-shape: 12px;/);
  assert.match(css, /--_drag-handle-pressed-width: 12px;/);
  assert.match(css, /--_drag-handle-dragged-color: var\(--on-surface\);/);
  assert.match(css, /--_drag-handle-dragged-height: 52px;/);
  assert.match(css, /--_drag-handle-dragged-shape: 12px;/);
  assert.match(css, /--_drag-handle-dragged-width: 12px;/);
  assert.match(css, /--_drag-handle-focus-state-layer-color: var\(--inverse-on-surface\);/);
  assert.match(css, /--_drag-handle-hover-state-layer-color: var\(--inverse-on-surface\);/);
  assert.doesNotMatch(css, /--_drag-handle-min-interactive-size:/);
  assert.doesNotMatch(css, /--_ripple-(?:hover|focus)-opacity:/);
  assert.doesNotMatch(css, /(^|\s)--outline\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
