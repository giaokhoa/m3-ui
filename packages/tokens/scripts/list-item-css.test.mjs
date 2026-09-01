import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('ListItem semantic colors alias canonical runtime roles', async () => {
  const base = (await readJson('tokens/component/list.json')).component.list.base;
  const expected = {
    focusIndicatorColor: '{color.role.secondary}',
    itemContainerColor: '{color.role.surface}',
    itemLabelTextColor: '{color.role.onSurface}',
    itemLeadingIconColor: '{color.role.onSurfaceVariant}',
    itemTrailingIconColor: '{color.role.onSurfaceVariant}',
    itemOverlineColor: '{color.role.onSurfaceVariant}',
    itemSupportingTextColor: '{color.role.onSurfaceVariant}',
    itemSelectedContainerColor: '{color.role.secondaryContainer}',
    itemSelectedLabelTextColor: '{color.role.onSecondaryContainer}',
    itemSelectedLeadingIconColor: '{color.role.onSecondaryContainer}',
    itemSelectedTrailingIconColor: '{color.role.onSecondaryContainer}',
    itemSelectedOverlineColor: '{color.role.onSecondaryContainer}',
    itemSelectedSupportingTextColor: '{color.role.onSecondaryContainer}',
    itemDisabledLabelTextColor: '{color.role.onSurface}',
    itemDisabledLeadingIconColor: '{color.role.onSurface}',
    itemDisabledTrailingIconColor: '{color.role.onSurface}',
    itemDisabledOverlineColor: '{color.role.onSurface}',
    itemDisabledSupportingTextColor: '{color.role.onSurface}',
    itemSelectedDisabledContainerColor: '{color.role.onSurface}',
    itemSelectedDisabledLabelTextColor: '{color.role.onSurface}',
    itemSelectedDisabledLeadingIconColor: '{color.role.onSurface}',
    itemSelectedDisabledTrailingIconColor: '{color.role.onSurface}',
    itemSelectedDisabledOverlineColor: '{color.role.onSurface}',
    itemSelectedDisabledSupportingTextColor: '{color.role.onSurface}',
    itemDraggedLabelTextColor: '{color.role.onSurface}',
    itemDraggedLeadingIconIconColor: '{color.role.onSurfaceVariant}',
    itemDraggedTrailingIconIconColor: '{color.role.onSurfaceVariant}',
    itemSelectedHoverLabelTextColor: '{color.role.onSecondaryContainer}',
    itemSelectedHoverLeadingIconColor: '{color.role.onSurface}',
    itemSelectedHoverTrailingIconColor: '{color.role.onSurface}',
    itemSelectedFocusLabelTextColor: '{color.role.onSecondaryContainer}',
    itemSelectedFocusLeadingIconColor: '{color.role.onSurface}',
    itemSelectedFocusTrailingIconColor: '{color.role.onSurface}',
    itemSelectedPressedLabelTextColor: '{color.role.onSecondaryContainer}',
    itemSelectedPressedLeadingIconColor: '{color.role.onSurface}',
    itemSelectedPressedTrailingIconColor: '{color.role.onSurface}',
    itemSelectedDraggedLabelTextColor: '{color.role.onSecondaryContainer}',
    itemSelectedDraggedLeadingIconColor: '{color.role.onSurface}',
    itemSelectedDraggedTrailingIconColor: '{color.role.onSurface}',
  };

  for (const [name, value] of Object.entries(expected)) {
    assert.equal(base[name].$value, value, name);
  }
});

test('generated ListItem CSS owns immutable geometry typography paint and state selectors', async () => {
  const css = await readFile(new URL('dist/generated/list-item.css', packageRoot), 'utf8');

  assert.match(css, /\.list-item \{/);
  assert.match(css, /--_list-item-padding-inline-start: 16px;/);
  assert.match(css, /--_list-item-padding-inline-end: 16px;/);
  assert.match(css, /--_list-item-padding-block-start: 10px;/);
  assert.match(css, /--_list-item-padding-block-end: 10px;/);
  assert.match(css, /--_list-item-container-color: var\(--surface\);/);
  assert.match(css, /--_list-item-shape: 0px;/);
  assert.match(css, /--_list-item-focus-indicator-color: var\(--secondary\);/);
  assert.match(css, /--_list-item-headline-font-family: var\(--font-family-plain\);/);
  assert.match(css, /--_list-item-headline-font-size: 16px;/);
  assert.match(css, /--_list-item-supporting-font-size: 14px;/);
  assert.match(css, /--_list-item-meta-font-size: 11px;/);
  assert.match(css, /--_ripple-color: var\(--on-surface\);/);
  assert.doesNotMatch(css, /--_ripple-(?:hover|focus|pressed)-opacity:/);

  for (const [lines, height] of [[1, 56], [2, 72], [3, 88]]) {
    assert.match(css, new RegExp(`\\.list-item\\[data-lines='${lines}'\\] \\{[^}]*--_list-item-min-height: ${height}px;`, 's'));
  }

  assert.match(css, /\.list-item\[data-hovered\]:not\(\[data-selected\]\) \{[^}]*--_list-item-shape: 12px;/s);
  assert.match(css, /\.list-item\[data-focus-visible\]:not\(\[data-selected\]\) \{[^}]*--_list-item-shape: 16px;/s);
  assert.match(css, /\.list-item\[data-pressed\]:not\(\[data-selected\]\) \{[^}]*--_list-item-shape: 16px;/s);
  assert.match(css, /\.list-item\[data-dragged\]:not\(\[data-selected\]\) \{[^}]*--_list-item-shape: 16px;/s);

  assert.match(css, /\.list-item\[data-selected\] \{[^}]*--_list-item-container-color: var\(--secondary-container\);[^}]*--_list-item-shape: 16px;[^}]*--_list-item-label-color: var\(--on-secondary-container\);/s);
  assert.match(css, /\.list-item\[data-selected\]\[data-hovered\] \{[^}]*--_list-item-leading-color: var\(--on-surface\);/s);
  assert.match(css, /\.list-item\[data-selected\]\[data-focus-visible\] \{[^}]*--_list-item-leading-color: var\(--on-surface\);/s);
  assert.match(css, /\.list-item\[data-selected\]\[data-pressed\] \{[^}]*--_list-item-leading-color: var\(--on-surface\);/s);
  assert.match(css, /\.list-item\[data-selected\]\[data-dragged\] \{[^}]*--_list-item-leading-color: var\(--on-surface\);/s);
  assert.match(css, /\.list-item\[data-disabled\]:not\(\[data-selected\]\) \{[^}]*--_list-item-label-opacity: 0\.38;/s);
  assert.match(css, /\.list-item\[data-selected\]\[data-disabled\] \{[^}]*--_list-item-container-color: var\(--on-surface\);[^}]*--_list-item-container-opacity: 0\.38;/s);

  const dragged = css.indexOf('.list-item[data-dragged]:not([data-selected])');
  const disabled = css.indexOf('.list-item[data-disabled]:not([data-selected])');
  assert.ok(dragged >= 0 && disabled > dragged, 'disabled paint must follow dragged paint at equal specificity');

  assert.doesNotMatch(css, /(^|\s)--surface\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});