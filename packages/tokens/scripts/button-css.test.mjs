import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('Button component colors alias canonical runtime roles', async () => {
  const variants = JSON.parse(
    await readFile(
      new URL('tokens/component/button/variants.json', packageRoot),
      'utf8',
    ),
  );
  const token = variants.component.button.variant;

  assert.equal(token.filled.containerColor.$value, '{color.role.primary}');
  assert.equal(token.filled.contentColor.$value, '{color.role.onPrimary}');
  assert.equal(
    token.elevated.containerColor.$value,
    '{color.role.surfaceContainerLow}',
  );
  assert.equal(
    token.filledTonal.containerColor.$value,
    '{color.role.secondaryContainer}',
  );
  assert.equal(token.outlined.outlineColor.$value, '{color.role.outlineVariant}');
  assert.equal(token.text.contentColor.$value, '{color.role.primary}');
});

test('generated JS keeps runtime role expressions after alias resolution', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?button=${Date.now()}`
  );

  assert.equal(generated.ComponentButtonVariantFilledContainerColor, 'var(--primary)');
  assert.equal(generated.ComponentButtonVariantFilledContentColor, 'var(--on-primary)');
  assert.equal(
    generated.ComponentButtonVariantElevatedContainerColor,
    'var(--surface-container-low)',
  );
});

test('generated Button CSS owns static component mapping but not runtime theme colors', async () => {
  const css = await readFile(
    new URL('dist/generated/button.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\.button \{/);
  assert.match(css, /--_button-min-width: 58px;/);
  assert.match(css, /--_button-container-radius: 9999px;/);
  assert.match(css, /--_button-font-family: var\(--font-family-plain\);/);

  assert.match(css, /\.button--filled \{/);
  assert.match(css, /--_button-container-color: var\(--primary\);/);
  assert.match(css, /--_button-content-color: var\(--on-primary\);/);
  assert.match(css, /\.button--outlined \{/);
  assert.match(css, /--_button-outline-color: var\(--outline-variant\);/);

  assert.match(css, /\.button\[data-size='medium'\] \{/);
  assert.match(css, /--_button-min-height: 56px;/);
  assert.match(css, /--_button-font-size: 16px;/);
  assert.match(css, /--_button-icon-size: 24px;/);

  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
