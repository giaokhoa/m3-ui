import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = ['md-comp-assist-chip', 'md-comp-suggestion-chip', 'md-comp-filter-chip', 'md-comp-input-chip'];

const actionBase = 'component.chip.action.base';
const selectableBase = 'component.chip.selectable.base';

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function canonicalValue(token) {
  if (!token) return undefined;
  if (token.type === 'dimension' && token.value && typeof token.value === 'object') return `${token.value.value}${token.value.unit}`;
  return token.value;
}
function resolvedValue(token, seen = new Set()) {
  const value = canonicalValue(token);
  if (typeof value !== 'string') return value;
  const alias = value.match(/^\{(.+)\}$/);
  if (!alias) return value;
  if (seen.has(alias[1])) throw new Error(`Alias cycle at ${alias[1]}`);
  const target = canonical.get(alias[1]);
  if (!target) return value;
  seen.add(alias[1]);
  return resolvedValue(target, seen);
}
function typographyField(variable) {
  const fields = {
    'label-text-font': 'fontFamily',
    'label-text-line-height': 'lineHeight',
    'label-text-size': 'fontSize',
    'label-text-tracking': 'letterSpacing',
    'label-text-weight': 'fontWeight',
  };
  return fields[variable];
}
function sourceValue(raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$level(\d+)$/);
  if (match) return { kind: 'value', value: `level${match[1]}` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'canonical', path: `shape.corner.${camel(match[1])}` };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed|dragged)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(inner-offset|outer-offset|thickness)$/);
  if (match) return { kind: 'canonical', path: `state.focusIndicator.${camel(match[1])}` };
  match = raw.match(/^md-sys-typescale\.\$label-large-(font|line-height|size|tracking|weight)$/);
  if (match) {
    const fields = { font: 'fontFamily', 'line-height': 'lineHeight', size: 'fontSize', tracking: 'letterSpacing', weight: 'fontWeight' };
    return { kind: 'canonical', path: `typography.labelLarge.${fields[match[1]]}` };
  }
  return { kind: 'unsupported', value: raw };
}
function focusPath(variable) {
  if (variable === 'focus-indicator-color') return 'color.role.secondary';
  if (variable === 'focus-indicator-outline-offset') return 'state.focusIndicator.outerOffset';
  if (variable === 'focus-indicator-thickness') return 'state.focusIndicator.thickness';
}
function stateOpacityPath(variable) {
  const match = variable.match(/(?:^|-)(focus|hover|pressed|dragged)-state-layer-opacity$/);
  return match ? `state.layer.opacity.${match[1]}` : undefined;
}
function actionPath(module, variable) {
  const assist = module === 'md-comp-assist-chip';
  const flat = assist ? 'component.chip.variant.assist' : 'component.chip.variant.suggestion';
  const elevated = assist ? 'component.chip.variant.elevatedAssist' : 'component.chip.variant.elevatedSuggestion';
  const direct = {
    'container-height': `${actionBase}.height`,
    'disabled-label-text-opacity': `${actionBase}.disabledLabelOpacity`,
    'elevated-disabled-container-opacity': `${elevated}.disabledContainerOpacity`,
    'flat-disabled-outline-opacity': `${flat}.disabledOutlineOpacity`,
    'flat-outline-width': `${flat}.outlineWidth`,
    'container-shape': `${actionBase}.containerRadius`,
    'disabled-label-text-color': `${actionBase}.disabledLabelColor`,
    'dragged-container-elevation': `${actionBase}.draggedElevation`,
    'dragged-label-text-color': `${flat}.labelColor`,
    'dragged-state-layer-color': `${flat}.labelColor`,
    'elevated-container-color': `${elevated}.containerColor`,
    'elevated-container-elevation': `${elevated}.defaultElevation`,
    'elevated-container-shadow-color': 'color.role.shadow',
    'elevated-disabled-container-color': `${elevated}.disabledContainerColor`,
    'elevated-disabled-container-elevation': `${elevated}.disabledElevation`,
    'elevated-focus-container-elevation': `${elevated}.focusedElevation`,
    'elevated-hover-container-elevation': `${elevated}.hoveredElevation`,
    'elevated-pressed-container-elevation': `${elevated}.pressedElevation`,
    'flat-container-elevation': `${flat}.defaultElevation`,
    'flat-disabled-outline-color': `${flat}.disabledOutlineColor`,
    'flat-focus-outline-color': `${flat}.focusOutlineColor`,
    'flat-outline-color': `${flat}.outlineColor`,
    'focus-label-text-color': `${flat}.labelColor`,
    'focus-state-layer-color': `${flat}.labelColor`,
    'hover-label-text-color': `${flat}.labelColor`,
    'hover-state-layer-color': `${flat}.labelColor`,
    'label-text-color': `${flat}.labelColor`,
    'pressed-label-text-color': `${flat}.labelColor`,
    'pressed-state-layer-color': `${flat}.labelColor`,
  };
  if (direct[variable]) return direct[variable];
  const globalFocus = focusPath(variable);
  if (globalFocus) return globalFocus;
  const opacity = stateOpacityPath(variable);
  if (opacity) return opacity;
  if (assist) {
    if (variable === 'with-icon-disabled-icon-opacity') return `${actionBase}.disabledIconOpacity`;
    if (variable === 'with-icon-icon-size') return `${actionBase}.iconSize`;
    if (variable === 'with-icon-disabled-icon-color') return `${actionBase}.disabledIconColor`;
    if (/^with-icon-(?:dragged|focus|hover|pressed)-icon-color$/.test(variable) || variable === 'with-icon-icon-color') return `${flat}.leadingIconColor`;
  } else {
    if (variable === 'with-leading-icon-disabled-leading-icon-opacity') return `${actionBase}.disabledIconOpacity`;
    if (variable === 'with-leading-icon-leading-icon-size') return `${actionBase}.iconSize`;
    if (variable === 'with-leading-icon-disabled-leading-icon-color') return `${actionBase}.disabledIconColor`;
    if (/^with-leading-icon-(?:dragged|focus|hover|pressed)-leading-icon-color$/.test(variable) || variable === 'with-leading-icon-leading-icon-color') return `${flat}.leadingIconColor`;
  }
}
function filterPath(variable) {
  const flat = 'component.chip.variant.filter';
  const elevated = 'component.chip.variant.elevatedFilter';
  const direct = {
    'container-height': `${selectableBase}.height`,
    'disabled-label-text-opacity': `${selectableBase}.disabledContentOpacity`,
    'elevated-disabled-container-opacity': `${selectableBase}.disabledContainerOpacity`,
    'flat-disabled-selected-container-opacity': `${selectableBase}.disabledContainerOpacity`,
    'flat-disabled-unselected-outline-opacity': `${selectableBase}.disabledOutlineOpacity`,
    'flat-selected-outline-width': `${selectableBase}.selectedOutlineWidth`,
    'flat-unselected-outline-width': `${selectableBase}.unselectedOutlineWidth`,
    'with-icon-icon-size': `${selectableBase}.leadingIconSize`,
    'with-leading-icon-disabled-leading-icon-opacity': `${selectableBase}.disabledContentOpacity`,
    'with-trailing-icon-disabled-trailing-icon-opacity': `${selectableBase}.disabledContentOpacity`,
    'container-shape': `${selectableBase}.containerRadius`,
    'disabled-label-text-color': `${selectableBase}.disabledContentColor`,
    'dragged-container-elevation': `${selectableBase}.draggedElevation`,
    'elevated-container-elevation': `${elevated}.defaultElevation`,
    'elevated-container-shadow-color': 'color.role.shadow',
    'elevated-disabled-container-color': `${elevated}.disabledUnselectedContainerColor`,
    'elevated-disabled-container-elevation': `${selectableBase}.disabledElevation`,
    'elevated-focus-container-elevation': `${elevated}.focusedElevation`,
    'elevated-hover-container-elevation': `${elevated}.hoveredElevation`,
    'elevated-pressed-container-elevation': `${elevated}.pressedElevation`,
    'elevated-selected-container-color': `${elevated}.selectedContainerColor`,
    'elevated-unselected-container-color': `${elevated}.unselectedContainerColor`,
    'flat-container-elevation': `${flat}.defaultElevation`,
    'flat-disabled-selected-container-color': `${selectableBase}.disabledSelectedContainerColor`,
    'flat-disabled-unselected-outline-color': `${selectableBase}.disabledUnselectedOutlineColor`,
    'flat-selected-container-color': `${flat}.selectedContainerColor`,
    'flat-selected-focus-container-elevation': `${flat}.focusedElevation`,
    'flat-selected-hover-container-elevation': `${flat}.hoveredElevation`,
    'flat-selected-pressed-container-elevation': `${flat}.pressedElevation`,
    'flat-unselected-focus-container-elevation': `${flat}.focusedElevation`,
    'flat-unselected-focus-outline-color': `${flat}.unselectedFocusOutlineColor`,
    'flat-unselected-hover-container-elevation': `${flat}.unselectedHoveredElevation`,
    'flat-unselected-outline-color': `${selectableBase}.unselectedOutlineColor`,
    'flat-unselected-pressed-container-elevation': `${flat}.pressedElevation`,
  };
  if (direct[variable]) return direct[variable];
  const globalFocus = focusPath(variable);
  if (globalFocus) return globalFocus;
  const opacity = stateOpacityPath(variable);
  if (opacity) return opacity;
  if (/^selected-(?:dragged|focus|hover|pressed)-label-text-color$/.test(variable) || variable === 'selected-label-text-color') return `${flat}.selectedLabelColor`;
  if (/^unselected-(?:dragged|focus|hover|pressed)-label-text-color$/.test(variable) || variable === 'unselected-label-text-color') return `${flat}.unselectedLabelColor`;
  if (/^selected-(?:dragged|focus|hover)-state-layer-color$/.test(variable)) return `${flat}.selectedLabelColor`;
  if (variable === 'selected-pressed-state-layer-color') return `${flat}.selectedPressedStateLayerColor`;
  if (/^unselected-(?:dragged|focus|hover)-state-layer-color$/.test(variable)) return `${flat}.unselectedLabelColor`;
  if (variable === 'unselected-pressed-state-layer-color') return `${flat}.unselectedPressedStateLayerColor`;
  if (variable === 'with-leading-icon-disabled-leading-icon-color') return `${selectableBase}.disabledContentColor`;
  if (/^with-leading-icon-selected-(?:dragged|focus|hover|pressed)-leading-icon-color$/.test(variable) || variable === 'with-leading-icon-selected-leading-icon-color') return `${flat}.selectedLeadingIconColor`;
  if (/^with-leading-icon-unselected-(?:dragged|focus|hover|pressed)-leading-icon-color$/.test(variable) || variable === 'with-leading-icon-unselected-leading-icon-color') return `${flat}.unselectedLeadingIconColor`;
  if (variable === 'with-trailing-icon-disabled-trailing-icon-color') return `${selectableBase}.disabledContentColor`;
  if (/^with-trailing-icon-selected-(?:dragged|focus|hover|pressed)-trailing-icon-color$/.test(variable) || variable === 'with-trailing-icon-selected-trailing-icon-color') return `${flat}.selectedTrailingIconColor`;
  if (/^with-trailing-icon-unselected-(?:dragged|focus|hover|pressed)-trailing-icon-color$/.test(variable) || variable === 'with-trailing-icon-unselected-trailing-icon-color') return `${flat}.unselectedTrailingIconColor`;
}
function inputPath(variable) {
  const input = 'component.chip.variant.input';
  const direct = {
    'container-height': `${selectableBase}.height`,
    'disabled-label-text-opacity': `${selectableBase}.disabledContentOpacity`,
    'disabled-selected-container-opacity': `${selectableBase}.disabledContainerOpacity`,
    'disabled-unselected-outline-opacity': `${selectableBase}.disabledOutlineOpacity`,
    'selected-outline-width': `${selectableBase}.selectedOutlineWidth`,
    'unselected-outline-width': `${selectableBase}.unselectedOutlineWidth`,
    'with-avatar-avatar-size': `${input}.avatarSize`,
    'with-avatar-disabled-avatar-opacity': `${input}.disabledAvatarOpacity`,
    'with-leading-icon-disabled-leading-icon-opacity': `${selectableBase}.disabledContentOpacity`,
    'with-leading-icon-leading-icon-size': `${selectableBase}.leadingIconSize`,
    'with-trailing-icon-disabled-trailing-icon-opacity': `${selectableBase}.disabledContentOpacity`,
    'with-trailing-icon-trailing-icon-size': `${selectableBase}.trailingIconSize`,
    'container-elevation': `${input}.defaultElevation`,
    'container-shape': `${selectableBase}.containerRadius`,
    'disabled-label-text-color': `${selectableBase}.disabledContentColor`,
    'disabled-selected-container-color': `${selectableBase}.disabledSelectedContainerColor`,
    'disabled-unselected-outline-color': `${selectableBase}.disabledUnselectedOutlineColor`,
    'dragged-container-elevation': `${selectableBase}.draggedElevation`,
    'selected-container-color': `${input}.selectedContainerColor`,
    'unselected-outline-color': `${selectableBase}.unselectedOutlineColor`,
    'unselected-focus-outline-color': `${input}.unselectedFocusOutlineColor`,
    'with-avatar-avatar-shape': `${selectableBase}.avatarRadius`,
  };
  if (direct[variable]) return direct[variable];
  const globalFocus = focusPath(variable);
  if (globalFocus) return globalFocus;
  const opacity = stateOpacityPath(variable);
  if (opacity) return opacity;
  if (/^selected-(?:dragged|focus|hover|pressed)-label-text-color$/.test(variable) || variable === 'selected-label-text-color') return `${input}.selectedLabelColor`;
  if (/^unselected-(?:dragged|focus|hover|pressed)-label-text-color$/.test(variable) || variable === 'unselected-label-text-color') return `${input}.unselectedLabelColor`;
  if (/^selected-(?:dragged|focus|hover|pressed)-state-layer-color$/.test(variable)) return `${input}.selectedLabelColor`;
  if (/^unselected-(?:dragged|focus|hover|pressed)-state-layer-color$/.test(variable)) return `${input}.unselectedLabelColor`;
  if (variable === 'with-leading-icon-disabled-leading-icon-color') return `${selectableBase}.disabledContentColor`;
  if (variable === 'with-leading-icon-selected-dragged-leading-icon-color') return `${input}.selectedDraggedLeadingIconColor`;
  if (/^with-leading-icon-selected-(?:focus|hover|pressed)-leading-icon-color$/.test(variable) || variable === 'with-leading-icon-selected-leading-icon-color') return `${input}.selectedLeadingIconColor`;
  if (variable === 'with-leading-icon-unselected-dragged-leading-icon-color' || variable === 'with-leading-icon-unselected-leading-icon-color') return `${input}.unselectedLeadingIconColor`;
  if (variable === 'with-leading-icon-unselected-focus-leading-icon-color') return `${input}.unselectedFocusLeadingIconColor`;
  if (variable === 'with-leading-icon-unselected-hover-leading-icon-color') return `${input}.unselectedHoverLeadingIconColor`;
  if (variable === 'with-leading-icon-unselected-pressed-leading-icon-color') return `${input}.unselectedPressedLeadingIconColor`;
  if (variable === 'with-trailing-icon-disabled-trailing-icon-color') return `${selectableBase}.disabledContentColor`;
  if (variable === 'with-trailing-icon-selected-dragged-trailing-icon-color') return `${input}.selectedDraggedTrailingIconColor`;
  if (/^with-trailing-icon-selected-(?:focus|hover|pressed)-trailing-icon-color$/.test(variable) || variable === 'with-trailing-icon-selected-trailing-icon-color') return `${input}.selectedTrailingIconColor`;
  if (variable === 'with-trailing-icon-unselected-dragged-trailing-icon-color') return `${input}.unselectedDraggedTrailingIconColor`;
  if (/^with-trailing-icon-unselected-(?:focus|hover|pressed)-trailing-icon-color$/.test(variable) || variable === 'with-trailing-icon-unselected-trailing-icon-color') return `${input}.unselectedTrailingIconColor`;
}
function pathFor(module, variable) {
  const field = typographyField(variable);
  if (field) return `component.chip.typography.${field}`;
  if (module === 'md-comp-assist-chip' || module === 'md-comp-suggestion-chip') return actionPath(module, variable);
  if (module === 'md-comp-filter-chip') return filterPath(variable);
  if (module === 'md-comp-input-chip') return inputPath(variable);
}
function typographyAggregateMatches() {
  const fields = ['fontFamily', 'fontSize', 'lineHeight', 'fontWeight', 'letterSpacing'];
  return fields.every((field) => Object.is(resolvedValue(canonical.get(`component.chip.typography.${field}`)), resolvedValue(canonical.get(`typography.labelLarge.${field}`))));
}
function parseSass(text) {
  const declarations = [];
  const lines = text.split(/\r?\n/);
  let tokenName;
  let deprecated = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const token = line.match(/^\/\/\/\s+(md\.[^\s(]+)/);
    if (token) {
      tokenName = token[1];
      deprecated = false;
      continue;
    }
    if (tokenName && line.includes('@deprecated')) {
      deprecated = true;
      continue;
    }
    const variable = line.match(/^\$([a-z0-9-]+):\s*(.+);$/);
    if (tokenName && variable) {
      declarations.push({ tokenName, variable: variable[1], raw: variable[2].trim(), deprecated });
      tokenName = undefined;
      deprecated = false;
      continue;
    }
    const mixin = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixin) {
      declarations.push({ tokenName, variable: mixin[1], raw: '@mixin', deprecated });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-chip-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    if (declaration.variable === 'label-text-type') {
      const ok = typographyAggregateMatches();
      results.push({ module, ...declaration, path: 'component.chip.typography', expected: 'labelLarge', actual: ok ? 'labelLarge' : 'mismatch', status: ok ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = pathFor(module, declaration.variable);
    if (!path) {
      results.push({ module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
    const expected = sourceValue(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    results.push({ module, ...declaration, path, expected: expectedValue, actual, status: token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Chip overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
