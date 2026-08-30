import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('Ripple focus-ring colors alias canonical runtime roles', async () => {
  const ripple = JSON.parse(
    await readFile(new URL('tokens/core/ripple.json', packageRoot), 'utf8'),
  ).ripple;

  assert.equal(
    ripple.focusRing.outerStrokeColor.$value,
    '{color.role.secondary}',
  );
  assert.equal(
    ripple.focusRing.innerStrokeColor.$value,
    '{color.role.onSecondary}',
  );
});

test('generated JS resolves Ripple focus-ring aliases to ThemeProvider role expressions', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?ripple=${Date.now()}`
  );

  assert.equal(generated.RippleFocusRingOuterStrokeColor, 'var(--secondary)');
  assert.equal(generated.RippleFocusRingInnerStrokeColor, 'var(--on-secondary)');
});

test('generated Ripple CSS owns immutable state, motion, and focus-ring bindings', async () => {
  const css = await readFile(
    new URL('dist/generated/ripple.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\.ripple \{/);
  assert.match(css, /--_ripple-radius-duration: 225ms;/);
  assert.match(css, /--_ripple-hover-duration: 15ms;/);
  assert.match(css, /--_ripple-focus-in-duration: 45ms;/);
  assert.match(css, /--_ripple-fade-in-duration: 75ms;/);
  assert.match(css, /--_ripple-fade-out-duration: 150ms;/);
  assert.match(css, /--_ripple-hover-opacity: 0\.08;/);
  assert.match(css, /--_ripple-focus-opacity: 0\.1;/);
  assert.match(css, /--_ripple-pressed-opacity: 0\.1;/);
  assert.match(css, /--_ripple-focus-ring-outer-inset: 0px;/);
  assert.match(css, /--_ripple-focus-ring-outer-width: 2px;/);
  assert.match(css, /--_ripple-focus-ring-inner-inset: 1px;/);
  assert.match(css, /--_ripple-focus-ring-inner-width: 3px;/);
  assert.match(css, /--_ripple-focus-ring-outer-color: var\(--secondary\);/);
  assert.match(css, /--_ripple-focus-ring-inner-color: var\(--on-secondary\);/);
  assert.match(css, /--_ripple-focus-ring-in-duration: 137ms;/);
  assert.match(css, /--_ripple-focus-ring-out-duration: 108ms;/);

  assert.doesNotMatch(css, /(^|\s)--secondary\s*:/m);
  assert.doesNotMatch(css, /(^|\s)--on-secondary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
