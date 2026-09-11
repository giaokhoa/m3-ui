import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function canonical(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('TextField component colors alias canonical runtime roles', async () => {
  const [sharedSource, filledSource, outlinedSource] = await Promise.all([
    canonical('tokens/component/text-field/shared.json'),
    canonical('tokens/component/text-field/filled.json'),
    canonical('tokens/component/text-field/outlined.json'),
  ]);
  const shared = sharedSource.component.textField.shared.colors;
  const filled = filledSource.component.textField.filled.colors;
  const outlined = outlinedSource.component.textField.outlined.colors;
  assert.equal(shared.text.$value, '{color.role.onSurface}');
  assert.equal(shared.cursor.$value, '{color.role.primary}');
  assert.equal(shared.errorCursor.$value, '{color.role.error}');
  assert.equal(shared.label.$value, '{color.role.onSurfaceVariant}');
  assert.equal(filled.container.$value, '{color.role.surfaceContainerHighest}');
  assert.equal(filled.focusedIndicator.$value, '{color.role.primary}');
  assert.equal(outlined.outline.$value, '{color.role.outline}');
  assert.equal(outlined.disabledOutline.$value, '{color.role.onSurface}');
  for (const source of [sharedSource, filledSource, outlinedSource]) {
    assert.doesNotMatch(JSON.stringify(source), /var\(--/, 'TextField component tokens must alias color.role.* instead of copying runtime CSS expressions');
  }
});

test('generated JS resolves TextField semantic aliases to ThemeProvider runtime expressions', async () => {
  const generated = await import(`${new URL('dist/generated/tokens.js', packageRoot).href}?textfield=${Date.now()}`);
  assert.equal(generated.ComponentTextFieldSharedColorsText, 'var(--on-surface)');
  assert.equal(generated.ComponentTextFieldSharedColorsFocusedLabel, 'var(--primary)');
  assert.equal(generated.ComponentTextFieldFilledColorsContainer, 'var(--surface-container-highest)');
  assert.equal(generated.ComponentTextFieldOutlinedColorsOutline, 'var(--outline)');
});

test('generated TextField CSS owns the complete immutable base-style projection', async () => {
  const css = await readFile(new URL('dist/generated/text-field.css', packageRoot), 'utf8');
  assert.match(css, /\.text-field \{[\s\S]*--_text-field-min-width: 280px;/);
  assert.match(css, /--_text-field-text-color: var\(--on-surface\);/);
  assert.match(css, /--_text-field-focused-label-color: var\(--primary\);/);
  assert.match(css, /--_text-field-body-large-font-size: 16px;/);
  assert.match(css, /--_text-field-body-small-font-size: 12px;/);
  assert.match(css, /--_text-field-fast-effects-duration: 108ms;/);
  assert.match(css, /--_text-field-fast-spatial-duration: 137ms;/);
  assert.match(css, /\.text-field--filled \{[\s\S]*--_text-field-container-color: var\(--surface-container-highest\);/);
  assert.match(css, /\.text-field--filled \{[\s\S]*--_text-field-indicator-focused-width: 2px;/);
  assert.match(css, /\.text-field--outlined \{[\s\S]*--_text-field-outline-color: var\(--outline\);/);
  assert.match(css, /\.text-field--outlined \{[\s\S]*--_text-field-disabled-outline-opacity: 0\.12;/);
  assert.match(css, /\.text-field--outlined \{[\s\S]*--_text-field-cutout-padding-inline: 4px;/);
  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /(^|\s)--on-surface\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
