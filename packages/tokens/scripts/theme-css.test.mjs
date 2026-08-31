import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('baseline theme colors are canonical DTCG and generated into typed JS', async () => {
  const canonical = JSON.parse(
    await readFile(new URL('tokens/theme/baseline.json', packageRoot), 'utf8'),
  );
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?theme=${Date.now()}`
  );

  assert.equal(canonical.theme.baseline.light.primary.$value, '#6750a4');
  assert.equal(canonical.theme.baseline.light.surface.$value, '#fef7ff');
  assert.equal(canonical.theme.baseline.dark.primary.$value, '#d0bcff');
  assert.equal(canonical.theme.baseline.dark.surface.$value, '#141218');

  assert.equal(generated.ThemeBaselineLightPrimary, '#6750a4');
  assert.equal(generated.ThemeBaselineLightSurface, '#fef7ff');
  assert.equal(generated.ThemeBaselineDarkPrimary, '#d0bcff');
  assert.equal(generated.ThemeBaselineDarkSurface, '#141218');
});

test('generated theme CSS owns static baseline roles and typography foundation', async () => {
  const css = await readFile(
    new URL('dist/generated/theme.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\[data-m3-theme\] \{/);
  assert.match(css, /--font-family-plain: 'Roboto', sans-serif;/);
  assert.match(css, /--font-family-brand: 'Roboto', sans-serif;/);
  assert.match(css, /font-family: var\(--font-family-plain\);/);

  assert.match(css, /\[data-m3-theme\]\[data-theme='light'\] \{/);
  assert.match(css, /color-scheme: light;/);
  assert.match(css, /--primary: #6750a4;/);
  assert.match(css, /--on-primary: #ffffff;/);
  assert.match(css, /--surface-container-high: #ece6f0;/);

  assert.match(css, /\[data-m3-theme\]\[data-theme='dark'\] \{/);
  assert.match(css, /color-scheme: dark;/);
  assert.match(css, /--primary: #d0bcff;/);
  assert.match(css, /--on-primary: #381e72;/);
  assert.match(css, /--surface-container-high: #2b2930;/);
});
