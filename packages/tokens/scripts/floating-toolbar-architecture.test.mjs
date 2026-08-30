import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('FloatingToolbar chooses runtime elevation levels while shared Elevation owns paint', async () => {
  const toolbar = await readFile(
    new URL('../ui/src/components/FloatingToolbar/FloatingToolbar.tsx', packageRoot),
    'utf8',
  );
  const defaults = await readFile(
    new URL('../ui/src/components/FloatingToolbar/FloatingToolbar.defaults.ts', packageRoot),
    'utf8',
  );
  const css = await readFile(
    new URL('../ui/src/components/FloatingToolbar/floating-toolbar.css', packageRoot),
    'utf8',
  );
  const dependencies = await readFile(
    new URL('../ui/scripts/generated-style-dependencies.mjs', packageRoot),
    'utf8',
  );
  const contract = await readFile(
    new URL('../ui/src/components/FloatingToolbar/README.md', packageRoot),
    'utf8',
  );

  assert.match(toolbar, /resolveFloatingToolbarElevation/);
  assert.match(toolbar, /<Elevation/);
  assert.match(toolbar, /className="floating-toolbar__elevation"/);
  assert.match(toolbar, /className="floating-toolbar__surface-shell"/);
  assert.doesNotMatch(defaults, /getElevationBoxShadow|--_floating-toolbar-box-shadow/);
  assert.match(defaults, /export function resolveFloatingToolbarElevation/);
  assert.match(css, /\.floating-toolbar__surface-shell[\s\S]*position: relative/);
  assert.match(css, /\.floating-toolbar__surface[\s\S]*overflow: hidden/);
  assert.doesNotMatch(css, /\.floating-toolbar__surface\s*\{[^}]*box-shadow/s);
  assert.match(dependencies, /src\/components\/FloatingToolbar\/floating-toolbar\.css[\s\S]*dist\/generated\/elevation\.css[\s\S]*internal\/elevation\/elevation\.css/);
  assert.match(contract, /runtime behavior owns the semantic elevation level/i);
  assert.match(contract, /Do not replace.*Web-current.*level3/is);
  assert.match(contract, /paint layer must remain outside `\.floating-toolbar__surface`/i);
  assert.match(contract, /must not serialize elevation geometry/i);
});
