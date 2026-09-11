import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-pickers-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const modules = ['md-comp-date-input-modal', 'md-comp-date-picker-modal', 'md-comp-time-input', 'md-comp-time-picker'];

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
function sourceValue(raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$(level[0-5])$/);
  if (match) return { kind: 'value', value: match[1] };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'canonical', path: match[1] === 'outer-offset' ? 'state.focusIndicator.outerOffset' : 'state.focusIndicator.thickness' };
  return { kind: 'unsupported', value: raw };
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

function typographySemantic(module, variable) {
  const suffix = '(?:font|line-height|size|tracking|weight|type)';
  const specs = module === 'md-comp-date-input-modal'
    ? [
        ['header-headline', 'component.dateInputModal.headerHeadlineFont', 'headlineLarge'],
        ['header-supporting-text', 'component.dateInputModal.headerSupportingTextFont', 'labelLarge'],
      ]
    : module === 'md-comp-date-picker-modal'
      ? [
          ['date-label-text', 'component.datePickerModal.dateLabelTextFont', 'bodyLarge'],
          ['header-headline', 'component.datePickerModal.headerHeadlineFont', 'headlineLarge'],
          ['header-supporting-text', 'component.datePickerModal.headerSupportingTextFont', 'labelLarge'],
          ['range-selection-header-headline', 'component.datePickerModal.rangeSelectionHeaderHeadlineFont', 'titleLarge'],
          ['range-selection-month-subhead', 'component.datePickerModal.rangeSelectionMonthSubheadFont', 'titleSmall'],
          ['weekdays-label-text', 'component.datePickerModal.weekdaysLabelTextFont', 'bodyLarge'],
          ['year-selection-year-label-text', 'component.datePickerModal.selectionYearLabelTextFont', 'bodyLarge'],
        ]
      : module === 'md-comp-time-input'
        ? [
            ['headline', 'component.timeInput.headlineFont', 'labelMedium'],
            ['period-selector-label-text', 'component.timeInput.periodSelectorLabelTextFont', 'titleMedium'],
            ['time-input-field-label-text', 'component.timeInput.timeFieldLabelTextFont', 'displayMedium'],
            ['time-input-field-separator', 'component.timeInput.timeFieldSeparatorFont', 'displayLarge'],
            ['time-input-field-supporting-text', 'component.timeInput.timeFieldSupportingTextFont', 'bodySmall'],
          ]
        : [
            ['clock-dial-label-text', 'component.timePicker.clockDialLabelTextFont', 'bodyLarge'],
            ['headline', 'component.timePicker.headlineFont', 'labelMedium'],
            ['period-selector-label-text', 'component.timePicker.periodSelectorLabelTextFont', 'titleMedium'],
            ['time-selector-label-text', 'component.timePicker.timeSelectorLabelTextFont', 'displayLarge'],
            ['time-selector-separator', 'component.timePicker.timeSelectorSeparatorFont', 'displayLarge'],
          ];
  for (const [prefix, path, semantic] of specs) {
    if (new RegExp(`^${prefix}-${suffix}$`).test(variable) || variable === `${prefix}-type`) return { path, semantic };
  }
}

function stateSemantic(module, variable) {
  const opacity = variable.match(/(?:^|-)(focus|hover|pressed)-state-layer-opacity$/);
  if (opacity) return { path: `state.layer.opacity.${opacity[1]}` };

  if (!variable.endsWith('state-layer-color')) return undefined;
  if (module === 'md-comp-date-picker-modal') {
    if (/^date-selected-/.test(variable)) return { path: 'component.datePickerModal.dateSelectedLabelTextColor' };
    if (/^date-today-/.test(variable)) return { path: 'component.datePickerModal.dateTodayLabelTextColor' };
    if (/^date-unselected-/.test(variable)) return { path: 'color.role.onSurfaceVariant' };
    if (/^range-selection-date-in-range-/.test(variable)) return { path: 'color.role.onPrimaryContainer' };
    if (/^year-selection-year-selected-/.test(variable)) return { path: 'component.datePickerModal.selectionYearSelectedLabelTextColor' };
    if (/^year-selection-year-unselected-/.test(variable)) return { path: 'component.datePickerModal.selectionYearUnselectedLabelTextColor' };
  }
  if (module === 'md-comp-time-input') {
    if (/^period-selector-selected-/.test(variable)) return { path: 'component.timeInput.periodSelectorSelectedLabelTextColor' };
    if (/^period-selector-unselected-/.test(variable)) return { path: 'component.timeInput.periodSelectorUnselectedLabelTextColor' };
    if (/^time-input-field-hover-/.test(variable)) return { path: 'component.timeInput.timeFieldHoverLabelTextColor' };
  }
  if (module === 'md-comp-time-picker') {
    if (/^period-selector-selected-/.test(variable)) return { path: 'component.timePicker.periodSelectorSelectedLabelTextColor' };
    if (/^period-selector-unselected-/.test(variable)) return { path: 'component.timePicker.periodSelectorUnselectedLabelTextColor' };
    if (/^time-selector-selected-/.test(variable)) return { path: 'component.timePicker.timeSelectorSelectedLabelTextColor' };
    if (/^time-selector-unselected-/.test(variable)) return { path: 'component.timePicker.timeSelectorUnselectedLabelTextColor' };
  }
}

function directPath(module, variable) {
  if (module === 'md-comp-date-input-modal') {
    if (variable === 'container-color') return 'component.dateInputModal.webContainerColor';
    return `component.dateInputModal.${camel(variable)}`;
  }
  if (module === 'md-comp-date-picker-modal') {
    if (variable === 'container-height') return 'component.datePickerModal.webContainerHeight';
    if (variable === 'range-selection-date-in-range-label-text-color') return 'component.datePickerModal.selectionDateInRangeLabelTextColor';
    if (variable.startsWith('year-selection-year-')) {
      return `component.datePickerModal.selectionYear${cap(camel(variable.slice('year-selection-year-'.length)))}`;
    }
    return `component.datePickerModal.${camel(variable)}`;
  }
  if (module === 'md-comp-time-input') {
    if (variable === 'focus-indicator-outline-offset') return 'state.focusIndicator.outerOffset';
    if (variable === 'focus-indicator-thickness') return 'state.focusIndicator.thickness';
    if (variable.startsWith('time-input-field-')) {
      return `component.timeInput.timeField${cap(camel(variable.slice('time-input-field-'.length)))}`;
    }
    return `component.timeInput.${camel(variable)}`;
  }
  if (variable.startsWith('time-selector-24h-vertical-')) {
    return `component.timePicker.timeSelector24HVertical${cap(camel(variable.slice('time-selector-24h-vertical-'.length)))}`;
  }
  return `component.timePicker.${camel(variable)}`;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-picker-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    const typography = typographySemantic(module, declaration.variable);
    if (typography) {
      const actual = canonicalValue(canonical.get(typography.path));
      results.push({ module, ...declaration, path: typography.path, expected: typography.semantic, actual, status: actual === typography.semantic ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }

    const semanticState = stateSemantic(module, declaration.variable);
    if (semanticState) {
      const expected = sourceValue(declaration.raw);
      const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
      const actual = resolvedValue(canonical.get(semanticState.path));
      results.push({ module, ...declaration, path: semanticState.path, expected: expectedValue, actual, status: expected.kind !== 'unsupported' && Object.is(actual, expectedValue) ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }

    const path = directPath(module, declaration.variable);
    const expected = sourceValue(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    let status = token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending';
    let driftId;
    if (module === 'md-comp-date-input-modal' && declaration.variable === 'container-color') driftId = 'date-input-modal-container-color';
    if (module === 'md-comp-date-picker-modal' && declaration.variable === 'container-height') driftId = 'date-picker-modal-container-height';
    if (driftId) status = driftIds.has(driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
    results.push({ module, ...declaration, path, expected: expectedValue, actual, ...(driftId ? { driftId } : {}), status });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web Picker overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
