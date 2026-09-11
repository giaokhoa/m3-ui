import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readCanonical(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Chip component colors alias canonical runtime roles', async () => {
  const [base, action, selectable] = await Promise.all([
    readCanonical('tokens/component/chip/base.json'),
    readCanonical('tokens/component/chip/action.json'),
    readCanonical('tokens/component/chip/selectable.json'),
  ]);
  const actionBase = base.component.chip.action.base;
  const selectableBase = base.component.chip.selectable.base;
  const variants = action.component.chip.variant;
  const selectableVariants = selectable.component.chip.variant;
  assert.equal(actionBase.disabledLabelColor.$value, '{color.role.onSurface}');
  assert.equal(actionBase.disabledIconColor.$value, '{color.role.onSurface}');
  assert.equal(selectableBase.disabledSelectedContainerColor.$value, '{color.role.onSurface}');
  assert.equal(selectableBase.unselectedOutlineColor.$value, '{color.role.outlineVariant}');
  assert.equal(variants.assist.labelColor.$value, '{color.role.onSurface}');
  assert.equal(variants.assist.leadingIconColor.$value, '{color.role.primary}');
  assert.equal(variants.elevatedAssist.containerColor.$value, '{color.role.surfaceContainerLow}');
  assert.equal(variants.suggestion.labelColor.$value, '{color.role.onSurfaceVariant}');
  assert.equal(selectableVariants.filter.selectedContainerColor.$value, '{color.role.secondaryContainer}');
  assert.equal(selectableVariants.filter.selectedLabelColor.$value, '{color.role.onSecondaryContainer}');
  assert.equal(selectableVariants.input.selectedLeadingIconColor.$value, '{color.role.primary}');
  for (const source of [base, action, selectable]) {
    assert.doesNotMatch(JSON.stringify(source), /var\(--/, 'Chip canonical component tokens must alias color.role.* instead of copying runtime CSS expressions');
  }
});

test('generated JS resolves Chip semantic color aliases to runtime role expressions', async () => {
  const generated = await import(`${new URL('dist/generated/tokens.js', packageRoot).href}?chip=${Date.now()}`);
  assert.equal(generated.ComponentChipVariantAssistLabelColor, 'var(--on-surface)');
  assert.equal(generated.ComponentChipVariantElevatedAssistContainerColor, 'var(--surface-container-low)');
  assert.equal(generated.ComponentChipVariantFilterSelectedContainerColor, 'var(--secondary-container)');
  assert.equal(generated.ComponentChipVariantInputSelectedLeadingIconColor, 'var(--primary)');
});

test('generated Chip CSS owns static color/state mapping but not runtime theme colors', async () => {
  const css = await readFile(new URL('dist/generated/chip.css', packageRoot), 'utf8');
  assert.match(css, /\.chip--assist > \.chip__visual \{/);
  assert.match(css, /--_chip-label-color: var\(--on-surface\);/);
  assert.match(css, /--_chip-leading-icon-color: var\(--primary\);/);
  assert.match(css, /\.chip--assist\[data-disabled\] > \.chip__visual \{[\s\S]*--_chip-label-color: color-mix\(in srgb, var\(--on-surface\) 38%, transparent\);/);
  assert.match(css, /\.chip--filter > \.chip__visual\[data-selected\] \{[\s\S]*--_chip-container-color: var\(--secondary-container\);/);
  assert.match(css, /\.chip--filter > \.chip__visual\[data-expressive-shapes\]:not\(\[data-selected\]\) \{[\s\S]*--_chip-leading-icon-color: var\(--on-surface-variant\);/);
  assert.match(css, /\.chip--elevated-filter\[data-disabled\] > \.chip__visual \{[\s\S]*--_chip-container-color: color-mix\(in srgb, var\(--on-surface\) 12%, transparent\);/);
  assert.match(css, /\.chip--input > \.chip__visual\[data-selected\] \{[\s\S]*--_chip-leading-icon-color: var\(--primary\);/);
  assert.doesNotMatch(css, /(^|\s)--primary\s*:/m);
  assert.doesNotMatch(css, /(^|\s)--on-surface\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
