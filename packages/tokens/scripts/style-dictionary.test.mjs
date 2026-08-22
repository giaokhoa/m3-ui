import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Style Dictionary emits runtime color strings and standard dimensions', async () => {
  const url = new URL('../dist/generated/tokens.js', import.meta.url);
  const generated = await import(`${url.href}?test=${Date.now()}`);

  assert.equal(generated.ComponentButtonVariantFilledContainerColor, 'var(--primary)');
  assert.equal(generated.ComponentSwitchColorsCheckedTrack, 'var(--primary)');
  assert.equal(generated.ComponentButtonBaselineMinHeight, '40px');
});

test('Style Dictionary emits TypeScript declarations', async () => {
  const declarations = await readFile(
    new URL('../dist/generated/tokens.d.ts', import.meta.url),
    'utf8',
  );

  assert.match(declarations, /ComponentButtonVariantFilledContainerColor/);
  assert.match(declarations, /var\(--primary\)/);
});
