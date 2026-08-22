import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCanonicalDirectory, resolveTokenValues, validateCanonical } from './dtcg.mjs';
import { compareTokenGraph, hasAuditDrift, summarizeAudit } from './audit.mjs';
import { androidX, tokenSources } from './androidx/source.mjs';
import { parseAndroidXTokenFile } from './androidx/parser.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = await readCanonicalDirectory(resolve(scriptDir, '../tokens'));
const validation = validateCanonical(canonical);
if (validation.errors.length > 0) throw new Error(`Canonical source is invalid:\n${validation.errors.join('\n')}`);
const resolvedCanonical = resolveTokenValues(validation.tokens);

function normalizeRuntimeColor(value) {
  if (typeof value !== 'string') return value;
  const match = value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (!match) return value;
  return match[1].replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

const canonicalValues = new Map(
  [...resolvedCanonical].map(([name, value]) => [name, normalizeRuntimeColor(value)]),
);
const referenceValues = new Map();

for (const source of tokenSources) {
  const url = `https://raw.githubusercontent.com/${androidX.repository}/${androidX.revision}/${source.path}`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-token-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${source.file}: ${response.status}`);
  const parsed = parseAndroidXTokenFile(await response.text(), source.path);
  for (const [name, value] of Object.entries(parsed.tokens)) {
    const normalized = value && typeof value === 'object' && Object.hasOwn(value, 'value') ? value.value : value;
    referenceValues.set(`${source.file}:${name}`, normalized);
  }
}

const mappings = [
  ...Array.from({ length: 6 }, (_, level) => ({ canonical: `elevation.level${level}`, reference: `ElevationTokens.kt:level${level}` })),
  { canonical: 'state.layer.opacity.dragged', reference: 'StateTokens.kt:draggedStateLayerOpacity' },
  { canonical: 'state.layer.opacity.focus', reference: 'StateTokens.kt:focusStateLayerOpacity' },
  { canonical: 'state.layer.opacity.hover', reference: 'StateTokens.kt:hoverStateLayerOpacity' },
  { canonical: 'state.layer.opacity.pressed', reference: 'StateTokens.kt:pressedStateLayerOpacity' },

  { canonical: 'component.switch.track.width', reference: 'SwitchTokens.kt:trackWidth' },
  { canonical: 'component.switch.track.height', reference: 'SwitchTokens.kt:trackHeight' },
  { canonical: 'component.switch.track.outlineWidth', reference: 'SwitchTokens.kt:trackOutlineWidth' },
  { canonical: 'component.switch.handle.unselectedSize', reference: 'SwitchTokens.kt:unselectedHandleWidth' },
  { canonical: 'component.switch.handle.selectedSize', reference: 'SwitchTokens.kt:selectedHandleWidth' },
  { canonical: 'component.switch.handle.pressedSize', reference: 'SwitchTokens.kt:pressedHandleWidth' },
  { canonical: 'component.switch.handle.iconSize', reference: 'SwitchTokens.kt:selectedIconSize' },
  { canonical: 'component.switch.stateLayerSize', reference: 'SwitchTokens.kt:stateLayerSize' },

  { canonical: 'component.button.variant.filled.containerColor', reference: 'FilledButtonTokens.kt:containerColor' },
  { canonical: 'component.button.variant.filled.contentColor', reference: 'FilledButtonTokens.kt:labelTextColor' },
  { canonical: 'component.button.variant.filled.disabledContainerColor', reference: 'FilledButtonTokens.kt:disabledContainerColor' },
  { canonical: 'component.button.variant.filled.disabledContentColor', reference: 'FilledButtonTokens.kt:disabledLabelTextColor' },
  { canonical: 'component.button.baseline.disabledContainerOpacity', reference: 'FilledButtonTokens.kt:disabledContainerOpacity' },
  { canonical: 'component.button.baseline.disabledContentOpacity', reference: 'FilledButtonTokens.kt:disabledLabelTextOpacity' },
  { canonical: 'component.button.variant.filled.defaultElevation', reference: 'FilledButtonTokens.kt:containerElevation' },
  { canonical: 'component.button.variant.filled.hoveredElevation', reference: 'FilledButtonTokens.kt:hoveredContainerElevation' },
  { canonical: 'component.button.variant.filled.focusedElevation', reference: 'FilledButtonTokens.kt:focusedContainerElevation' },
  { canonical: 'component.button.variant.filled.pressedElevation', reference: 'FilledButtonTokens.kt:pressedContainerElevation' },
  { canonical: 'component.button.variant.filled.disabledElevation', reference: 'FilledButtonTokens.kt:disabledContainerElevation' },

  { canonical: 'component.card.variant.filled.containerColor', reference: 'FilledCardTokens.kt:containerColor' },
  { canonical: 'component.card.variant.filled.disabledContainerColor', reference: 'FilledCardTokens.kt:disabledContainerColor' },
  { canonical: 'component.card.variant.filled.disabledContainerOpacity', reference: 'FilledCardTokens.kt:disabledContainerOpacity' },
  { canonical: 'component.card.variant.filled.elevation.default', reference: 'FilledCardTokens.kt:containerElevation' },
  { canonical: 'component.card.variant.filled.elevation.hovered', reference: 'FilledCardTokens.kt:hoverContainerElevation' },
  { canonical: 'component.card.variant.filled.elevation.focused', reference: 'FilledCardTokens.kt:focusContainerElevation' },
  { canonical: 'component.card.variant.filled.elevation.pressed', reference: 'FilledCardTokens.kt:pressedContainerElevation' },
  { canonical: 'component.card.variant.filled.elevation.dragged', reference: 'FilledCardTokens.kt:draggedContainerElevation' },
  { canonical: 'component.card.variant.filled.elevation.disabled', reference: 'FilledCardTokens.kt:disabledContainerElevation' },

  { canonical: 'component.checkbox.containerSize', reference: 'CheckboxTokens.kt:containerSize' },
  { canonical: 'component.checkbox.stateLayerSize', reference: 'CheckboxTokens.kt:stateLayerSize' },
  { canonical: 'component.checkbox.strokeWidth', reference: 'CheckboxTokens.kt:unselectedOutlineWidth' },
  { canonical: 'component.checkbox.colors.selectedContainer', reference: 'CheckboxTokens.kt:selectedContainerColor' },
  { canonical: 'component.checkbox.colors.selectedIcon', reference: 'CheckboxTokens.kt:selectedIconColor' },
  { canonical: 'component.checkbox.colors.unselectedOutline', reference: 'CheckboxTokens.kt:unselectedOutlineColor' },
  { canonical: 'component.checkbox.colors.disabledSelectedContainer', reference: 'CheckboxTokens.kt:selectedDisabledContainerColor' },
  { canonical: 'component.checkbox.colors.disabledSelectedIcon', reference: 'CheckboxTokens.kt:selectedDisabledIconColor' },
  { canonical: 'component.checkbox.colors.disabledUnselectedOutline', reference: 'CheckboxTokens.kt:unselectedDisabledOutlineColor' },
  { canonical: 'component.checkbox.disabledOpacity.selectedContainer', reference: 'CheckboxTokens.kt:selectedDisabledContainerOpacity' },
  { canonical: 'component.checkbox.disabledOpacity.unselectedOutline', reference: 'CheckboxTokens.kt:unselectedDisabledContainerOpacity' },

  { canonical: 'component.radioButton.iconSize', reference: 'RadioButtonTokens.kt:iconSize' },
  { canonical: 'component.radioButton.stateLayerSize', reference: 'RadioButtonTokens.kt:stateLayerSize' },
  { canonical: 'component.radioButton.colors.selected', reference: 'RadioButtonTokens.kt:selectedIconColor' },
  { canonical: 'component.radioButton.colors.unselected', reference: 'RadioButtonTokens.kt:unselectedIconColor' },
  { canonical: 'component.radioButton.colors.disabledSelected', reference: 'RadioButtonTokens.kt:disabledSelectedIconColor' },
  { canonical: 'component.radioButton.colors.disabledUnselected', reference: 'RadioButtonTokens.kt:disabledUnselectedIconColor' },
  { canonical: 'component.radioButton.disabledOpacity', reference: 'RadioButtonTokens.kt:disabledSelectedIconOpacity' },

  { canonical: 'component.chip.action.base.height', reference: 'AssistChipTokens.kt:containerHeight' },
  { canonical: 'component.chip.action.base.iconSize', reference: 'AssistChipTokens.kt:iconSize' },
  { canonical: 'component.chip.action.base.disabledLabelColor', reference: 'AssistChipTokens.kt:disabledLabelTextColor' },
  { canonical: 'component.chip.action.base.disabledLabelOpacity', reference: 'AssistChipTokens.kt:disabledLabelTextOpacity' },
  { canonical: 'component.chip.action.base.disabledIconColor', reference: 'AssistChipTokens.kt:disabledIconColor' },
  { canonical: 'component.chip.action.base.disabledIconOpacity', reference: 'AssistChipTokens.kt:disabledIconOpacity' },
  { canonical: 'component.chip.action.base.draggedElevation', reference: 'AssistChipTokens.kt:draggedContainerElevation' },
  { canonical: 'component.chip.variant.assist.labelColor', reference: 'AssistChipTokens.kt:labelTextColor' },
  { canonical: 'component.chip.variant.assist.leadingIconColor', reference: 'AssistChipTokens.kt:iconColor' },
  { canonical: 'component.chip.variant.assist.outlineColor', reference: 'AssistChipTokens.kt:flatOutlineColor' },
  { canonical: 'component.chip.variant.assist.outlineWidth', reference: 'AssistChipTokens.kt:flatOutlineWidth' },
  { canonical: 'component.chip.variant.assist.disabledOutlineColor', reference: 'AssistChipTokens.kt:flatDisabledOutlineColor' },
  { canonical: 'component.chip.variant.assist.disabledOutlineOpacity', reference: 'AssistChipTokens.kt:flatDisabledOutlineOpacity' },
  { canonical: 'component.chip.variant.assist.defaultElevation', reference: 'AssistChipTokens.kt:flatContainerElevation' },
  { canonical: 'component.chip.variant.elevatedAssist.containerColor', reference: 'AssistChipTokens.kt:elevatedContainerColor' },
  { canonical: 'component.chip.variant.elevatedAssist.disabledContainerColor', reference: 'AssistChipTokens.kt:elevatedDisabledContainerColor' },
  { canonical: 'component.chip.variant.elevatedAssist.disabledContainerOpacity', reference: 'AssistChipTokens.kt:elevatedDisabledContainerOpacity' },
  { canonical: 'component.chip.variant.elevatedAssist.defaultElevation', reference: 'AssistChipTokens.kt:elevatedContainerElevation' },
  { canonical: 'component.chip.variant.elevatedAssist.hoveredElevation', reference: 'AssistChipTokens.kt:elevatedHoverContainerElevation' },
  { canonical: 'component.chip.variant.elevatedAssist.focusedElevation', reference: 'AssistChipTokens.kt:elevatedFocusContainerElevation' },
  { canonical: 'component.chip.variant.elevatedAssist.pressedElevation', reference: 'AssistChipTokens.kt:elevatedPressedContainerElevation' },
  { canonical: 'component.chip.variant.elevatedAssist.disabledElevation', reference: 'AssistChipTokens.kt:elevatedDisabledContainerElevation' },

  { canonical: 'component.textField.filled.colors.container', reference: 'FilledTextFieldTokens.kt:containerColor' },
  { canonical: 'component.textField.shared.colors.text', reference: 'FilledTextFieldTokens.kt:inputColor' },
  { canonical: 'component.textField.shared.colors.cursor', reference: 'FilledTextFieldTokens.kt:caretColor' },
  { canonical: 'component.textField.shared.colors.label', reference: 'FilledTextFieldTokens.kt:labelColor' },
  { canonical: 'component.textField.shared.colors.focusedLabel', reference: 'FilledTextFieldTokens.kt:focusLabelColor' },
  { canonical: 'component.textField.shared.colors.disabledLabel', reference: 'FilledTextFieldTokens.kt:disabledLabelColor' },
  { canonical: 'component.textField.shared.colors.errorLabel', reference: 'FilledTextFieldTokens.kt:errorLabelColor' },
  { canonical: 'component.textField.shared.colors.leadingIcon', reference: 'FilledTextFieldTokens.kt:leadingIconColor' },
  { canonical: 'component.textField.shared.colors.trailingIcon', reference: 'FilledTextFieldTokens.kt:trailingIconColor' },
  { canonical: 'component.textField.shared.iconSize', reference: 'FilledTextFieldTokens.kt:leadingIconSize' },
  { canonical: 'component.textField.shared.disabledOpacity', reference: 'FilledTextFieldTokens.kt:disabledInputOpacity' },
  { canonical: 'component.textField.filled.indicator.unfocusedThickness', reference: 'FilledTextFieldTokens.kt:activeIndicatorHeight' },
  { canonical: 'component.textField.filled.indicator.focusedThickness', reference: 'FilledTextFieldTokens.kt:focusActiveIndicatorHeight' },
  { canonical: 'component.textField.filled.colors.indicator', reference: 'FilledTextFieldTokens.kt:activeIndicatorColor' },
  { canonical: 'component.textField.filled.colors.focusedIndicator', reference: 'FilledTextFieldTokens.kt:focusActiveIndicatorColor' },
  { canonical: 'component.textField.filled.colors.disabledIndicator', reference: 'FilledTextFieldTokens.kt:disabledActiveIndicatorColor' },
  { canonical: 'component.textField.filled.colors.errorIndicator', reference: 'FilledTextFieldTokens.kt:errorActiveIndicatorColor' },
];

const results = compareTokenGraph(canonicalValues, referenceValues, mappings);
const summary = summarizeAudit(results);
console.log(`AndroidX audit @ ${androidX.revision}`);
console.log(`match=${summary.match} mismatch=${summary.mismatch} missingCanonical=${summary['missing-canonical']} missingReference=${summary['missing-reference']}`);
for (const result of results.filter((item) => item.status !== 'match')) console.error(`- ${result.status}: ${result.canonical} <- ${result.reference}; canonical=${JSON.stringify(result.canonicalValue)} reference=${JSON.stringify(result.referenceValue)}`);
if (hasAuditDrift(results)) process.exitCode = 1;
