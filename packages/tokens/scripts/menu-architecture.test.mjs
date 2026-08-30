import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('Menu popovers preserve ThemeProvider runtime role scope across portals', async () => {
  const menu = await readFile(
    new URL('../ui/src/components/Menu/Menu.tsx', packageRoot),
    'utf8',
  );
  const contract = await readFile(
    new URL('../ui/src/components/Menu/README.md', packageRoot),
    'utf8',
  );

  assert.match(menu, /useThemePortalContainer/);
  assert.equal(
    menu.match(/UNSTABLE_portalContainer=\{themePortalContainer \?\? undefined\}/g)?.length,
    2,
    'standard and exposed Menu popovers must share the ThemeProvider portal container',
  );
  assert.match(contract, /ThemeProvider.*concrete runtime color roles/is);
  assert.match(contract, /both standard `Menu` and `ExposedMenu`.*useThemePortalContainer/is);
  assert.match(contract, /portaled Menu that escapes `\[data-m3-theme-portal\]`.*architecture regression/is);
});
