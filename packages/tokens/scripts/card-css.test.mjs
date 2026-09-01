import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Card component colors alias canonical runtime roles', async () => {
  const base = (await readJson('tokens/component/card.json')).component.card;
  const web = (await readJson('tokens/component/card-web-states.json')).component.card;

  assert.equal(base.base.disabledContentColor.$value, '{color.role.onSurface}');
  assert.equal(base.variant.filled.containerColor.$value, '{color.role.surfaceContainerHighest}');
  assert.equal(base.variant.filled.contentColor.$value, '{color.role.onSurface}');
  assert.equal(base.variant.filled.disabledContainerColor.$value, '{color.role.surfaceVariant}');
  assert.equal(base.variant.elevated.containerColor.$value, '{color.role.surfaceContainerLow}');
  assert.equal(base.variant.outlined.outline.color.$value, '{color.role.outlineVariant}');
  assert.equal(base.variant.outlined.outline.disabledColor.$value, '{color.role.outline}');
  assert.equal(
    base.variant.outlined.outline.disabledCompositeOver.$value,
    '{color.role.surfaceContainerLow}',
  );

  assert.equal(web.base.iconColor.$value, '{color.role.primary}');
  assert.equal(web.base.containerShadowColor.$value, '{color.role.shadow}');
  assert.equal(web.base.focusIndicatorColor.$value, '{color.role.secondary}');
  assert.equal(web.base.state.hover.color.$value, '{color.role.onSurface}');
  assert.equal(
    web.variant.outlined.outline.focusColor.$value,
    '{color.role.onSurface}',
  );
});

test('generated JS keeps Card runtime elevation values and resolves color aliases', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?card=${Date.now()}`
  );

  assert.equal(
    generated.ComponentCardVariantFilledContainerColor,
    'var(--surface-container-highest)',
  );
  assert.equal(generated.ComponentCardVariantOutlinedOutlineColor, 'var(--outline-variant)');
  assert.equal(generated.ComponentCardVariantFilledElevationHovered, 'level1');
  assert.equal(generated.ComponentCardVariantOutlinedElevationDragged, 'level3');
});

test('generated Card CSS owns immutable paint, geometry and disabled blends', async () => {
  const css = await readFile(new URL('dist/generated/card.css', packageRoot), 'utf8');

  assert.match(css, /\.card \{/);
  assert.match(css, /--_card-container-radius: 12px;/);
  assert.match(css, /--_card-min-interactive-size: 48px;/);
  assert.match(
    css,
    /--_card-disabled-content-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/,
  );

  assert.match(css, /\.card--filled \{/);
  assert.match(css, /--_card-container-color: var\(--surface-container-highest\);/);
  assert.match(
    css,
    /--_card-disabled-container-color: color-mix\(in srgb, var\(--surface-variant\) 38%, var\(--surface-container-highest\)\);/,
  );

  assert.match(css, /\.card--elevated \{/);
  assert.match(css, /--_card-container-color: var\(--surface-container-low\);/);
  assert.match(
    css,
    /--_card-disabled-container-color: color-mix\(in srgb, var\(--surface\) 38%, var\(--surface\)\);/,
  );

  assert.match(css, /\.card--outlined \{/);
  assert.match(css, /--_card-outline-width: 1px;/);
  assert.match(css, /--_card-outline-color: var\(--outline-variant\);/);
  assert.match(
    css,
    /--_card-disabled-outline-color: color-mix\(in srgb, var\(--outline\) 12%, var\(--surface-container-low\)\);/,
  );

  assert.doesNotMatch(css, /(^|\s)--surface\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
