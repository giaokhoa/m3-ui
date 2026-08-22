import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-text-field-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const modules = ['md-comp-filled-text-field', 'md-comp-outlined-text-field'];

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
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'shape', value: match[1] };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'canonical', path: match[1] === 'outer-offset' ? 'state.focusIndicator.outerOffset' : 'state.focusIndicator.thickness' };
  match = raw.match(/^md-sys-typescale\.\$(body-large|body-small)-(font|line-height|size|tracking|weight)$/);
  if (match) {
    const style = match[1] === 'body-large' ? 'bodyLarge' : 'bodySmall';
    const field = {
      font: 'fontFamily',
      'line-height': 'lineHeight',
      size: 'fontSize',
      tracking: 'letterSpacing',
      weight: 'fontWeight',
    }[match[2]];
    return { kind: 'canonical', path: `typography.${style}.${field}` };
  }
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

function typographyPath(variable) {
  const match = variable.match(/^(input-text|label-text|supporting-text)-(font|line-height|size|tracking|weight)$/);
  if (!match) return undefined;
  const style = match[1] === 'supporting-text' ? 'bodySmall' : 'bodyLarge';
  const field = {
    font: 'fontFamily',
    'line-height': 'lineHeight',
    size: 'fontSize',
    tracking: 'letterSpacing',
    weight: 'fontWeight',
  }[match[2]];
  return `component.textField.shared.typography.${style}.${field}`;
}
function mixinStyle(variable) {
  if (variable === 'input-text-type' || variable === 'label-text-type') return 'bodyLarge';
  if (variable === 'supporting-text-type') return 'bodySmall';
}
function shapeStatus(variant, raw) {
  const expectedRaw = variant === 'filled' ? 'md-sys-shape.$corner-extra-small-top' : 'md-sys-shape.$corner-extra-small';
  if (raw !== expectedRaw) return { status: 'mismatch', expected: expectedRaw, actual: raw };
  const root = `component.textField.${variant}.containerShape`;
  const expected = variant === 'filled'
    ? { topStartRadius: '4px', topEndRadius: '4px', bottomEndRadius: '0px', bottomStartRadius: '0px' }
    : { topStartRadius: '4px', topEndRadius: '4px', bottomEndRadius: '4px', bottomStartRadius: '4px' };
  const actual = Object.fromEntries(Object.keys(expected).map((key) => [key, resolvedValue(canonical.get(`${root}.${key}`))]));
  const ok = Object.entries(expected).every(([key, value]) => actual[key] === value);
  return { status: ok ? 'reconciled-semantic-reference' : 'mismatch', expected, actual };
}

function filledPath(variable) {
  const s = 'component.textField.shared';
  const f = 'component.textField.filled';
  const map = {
    'active-indicator-height': `${f}.indicator.unfocusedThickness`,
    'disabled-active-indicator-height': `${f}.indicator.unfocusedThickness`,
    'disabled-active-indicator-opacity': `${s}.disabledOpacity`,
    'disabled-container-opacity': `${f}.webCurrent.disabledContainerOpacity`,
    'disabled-input-text-opacity': `${s}.disabledOpacity`,
    'disabled-label-text-opacity': `${s}.disabledOpacity`,
    'disabled-leading-icon-opacity': `${s}.disabledOpacity`,
    'disabled-supporting-text-opacity': `${s}.disabledOpacity`,
    'disabled-trailing-icon-opacity': `${s}.disabledOpacity`,
    'focus-active-indicator-height': `${f}.indicator.focusedThickness`,
    'hover-active-indicator-height': `${f}.indicator.unfocusedThickness`,
    'leading-icon-size': `${s}.iconSize`,
    'trailing-icon-size': `${s}.iconSize`,
    'active-indicator-color': `${f}.colors.indicator`,
    'caret-color': `${s}.colors.cursor`,
    'container-color': `${f}.colors.container`,
    'disabled-active-indicator-color': `${f}.colors.disabledIndicator`,
    'disabled-container-color': `${s}.colors.disabledText`,
    'disabled-input-text-color': `${s}.colors.disabledText`,
    'disabled-label-text-color': `${s}.colors.disabledLabel`,
    'disabled-leading-icon-color': `${s}.colors.disabledLeadingIcon`,
    'disabled-supporting-text-color': `${s}.colors.disabledSupporting`,
    'disabled-trailing-icon-color': `${s}.colors.disabledTrailingIcon`,
    'error-active-indicator-color': `${f}.colors.errorIndicator`,
    'error-focus-active-indicator-color': `${f}.colors.errorIndicator`,
    'error-focus-caret-color': `${s}.colors.errorCursor`,
    'error-focus-input-text-color': `${s}.colors.text`,
    'error-focus-label-text-color': `${s}.colors.errorLabel`,
    'error-focus-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-focus-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-focus-trailing-icon-color': `${s}.colors.errorTrailingIcon`,
    'error-hover-active-indicator-color': `${f}.webCurrent.errorHoverAccentColor`,
    'error-hover-input-text-color': `${s}.colors.text`,
    'error-hover-label-text-color': `${f}.webCurrent.errorHoverAccentColor`,
    'error-hover-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-hover-state-layer-color': `${f}.webCurrent.hoverStateLayerColor`,
    'error-hover-state-layer-opacity': `${f}.webCurrent.hoverStateLayerOpacity`,
    'error-hover-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-hover-trailing-icon-color': `${f}.webCurrent.errorHoverAccentColor`,
    'error-input-text-color': `${s}.colors.text`,
    'error-label-text-color': `${s}.colors.errorLabel`,
    'error-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-trailing-icon-color': `${s}.colors.errorTrailingIcon`,
    'focus-active-indicator-color': `${f}.colors.focusedIndicator`,
    'focus-active-indicator-thickness': `${f}.webCurrent.focusActiveIndicatorThickness`,
    'focus-input-text-color': `${s}.colors.text`,
    'focus-label-text-color': `${s}.colors.focusedLabel`,
    'focus-leading-icon-color': `${s}.colors.leadingIcon`,
    'focus-supporting-text-color': `${s}.colors.supporting`,
    'focus-trailing-icon-color': `${s}.colors.trailingIcon`,
    'hover-active-indicator-color': `${f}.webCurrent.hoverIndicatorColor`,
    'hover-input-text-color': `${s}.colors.text`,
    'hover-label-text-color': `${s}.colors.label`,
    'hover-leading-icon-color': `${s}.colors.leadingIcon`,
    'hover-state-layer-color': `${f}.webCurrent.hoverStateLayerColor`,
    'hover-state-layer-opacity': `${f}.webCurrent.hoverStateLayerOpacity`,
    'hover-supporting-text-color': `${s}.colors.supporting`,
    'hover-trailing-icon-color': `${s}.colors.trailingIcon`,
    'input-text-color': `${s}.colors.text`,
    'input-text-placeholder-color': `${s}.colors.placeholder`,
    'input-text-prefix-color': `${s}.colors.prefix`,
    'input-text-suffix-color': `${s}.colors.suffix`,
    'label-text-color': `${s}.colors.label`,
    'label-text-populated-line-height': `${s}.webPopulatedLabelTextLineHeight`,
    'label-text-populated-size': `${s}.webPopulatedLabelTextSize`,
    'leading-icon-color': `${s}.colors.leadingIcon`,
    'supporting-text-color': `${s}.colors.supporting`,
    'trailing-icon-color': `${s}.colors.trailingIcon`,
  };
  return map[variable] ?? typographyPath(variable);
}

function outlinedPath(variable) {
  const s = 'component.textField.shared';
  const o = 'component.textField.outlined';
  const map = {
    'disabled-input-text-opacity': `${s}.disabledOpacity`,
    'disabled-label-text-opacity': `${s}.disabledOpacity`,
    'disabled-leading-icon-opacity': `${s}.disabledOpacity`,
    'disabled-outline-opacity': `${o}.outline.disabledOpacity`,
    'disabled-outline-width': `${o}.outline.unfocusedThickness`,
    'disabled-supporting-text-opacity': `${s}.disabledOpacity`,
    'disabled-trailing-icon-opacity': `${s}.disabledOpacity`,
    'focus-outline-width': `${o}.webCurrent.focusOutlineWidth`,
    'hover-outline-width': `${o}.outline.unfocusedThickness`,
    'leading-icon-size': `${s}.iconSize`,
    'outline-width': `${o}.outline.unfocusedThickness`,
    'trailing-icon-size': `${s}.iconSize`,
    'caret-color': `${s}.colors.cursor`,
    'disabled-input-text-color': `${s}.colors.disabledText`,
    'disabled-label-text-color': `${s}.colors.disabledLabel`,
    'disabled-leading-icon-color': `${s}.colors.disabledLeadingIcon`,
    'disabled-outline-color': `${o}.colors.disabledOutline`,
    'disabled-supporting-text-color': `${s}.colors.disabledSupporting`,
    'disabled-trailing-icon-color': `${s}.colors.disabledTrailingIcon`,
    'error-focus-caret-color': `${s}.colors.errorCursor`,
    'error-focus-input-text-color': `${s}.colors.text`,
    'error-focus-label-text-color': `${s}.colors.errorLabel`,
    'error-focus-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-focus-outline-color': `${o}.colors.errorOutline`,
    'error-focus-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-focus-trailing-icon-color': `${s}.colors.errorTrailingIcon`,
    'error-hover-input-text-color': `${s}.colors.text`,
    'error-hover-label-text-color': `${o}.webCurrent.errorHoverAccentColor`,
    'error-hover-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-hover-outline-color': `${o}.webCurrent.errorHoverAccentColor`,
    'error-hover-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-hover-trailing-icon-color': `${o}.webCurrent.errorHoverAccentColor`,
    'error-input-text-color': `${s}.colors.text`,
    'error-label-text-color': `${s}.colors.errorLabel`,
    'error-leading-icon-color': `${s}.colors.errorLeadingIcon`,
    'error-outline-color': `${o}.colors.errorOutline`,
    'error-supporting-text-color': `${s}.colors.errorSupporting`,
    'error-trailing-icon-color': `${s}.colors.errorTrailingIcon`,
    'focus-input-text-color': `${s}.colors.text`,
    'focus-label-text-color': `${s}.colors.focusedLabel`,
    'focus-leading-icon-color': `${s}.colors.leadingIcon`,
    'focus-outline-color': `${o}.colors.focusedOutline`,
    'focus-supporting-text-color': `${s}.colors.supporting`,
    'focus-trailing-icon-color': `${s}.colors.trailingIcon`,
    'hover-input-text-color': `${s}.colors.text`,
    'hover-label-text-color': `${o}.webCurrent.hoverAccentColor`,
    'hover-leading-icon-color': `${s}.colors.leadingIcon`,
    'hover-outline-color': `${o}.webCurrent.hoverAccentColor`,
    'hover-supporting-text-color': `${s}.colors.supporting`,
    'hover-trailing-icon-color': `${s}.colors.trailingIcon`,
    'input-text-color': `${s}.colors.text`,
    'input-text-placeholder-color': `${s}.colors.placeholder`,
    'input-text-prefix-color': `${s}.colors.prefix`,
    'input-text-suffix-color': `${s}.colors.suffix`,
    'label-text-color': `${s}.colors.label`,
    'label-text-populated-line-height': `${s}.webPopulatedLabelTextLineHeight`,
    'label-text-populated-size': `${s}.webPopulatedLabelTextSize`,
    'leading-icon-color': `${s}.colors.leadingIcon`,
    'outline-color': `${o}.colors.outline`,
    'supporting-text-color': `${s}.colors.supporting`,
    'trailing-icon-color': `${s}.colors.trailingIcon`,
  };
  return map[variable] ?? typographyPath(variable);
}

const results = [];
for (const module of modules) {
  const variant = module.includes('filled-') ? 'filled' : 'outlined';
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-text-field-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    if (declaration.variable === 'container-shape') {
      const shape = shapeStatus(variant, declaration.raw);
      results.push({ module, ...declaration, path: `component.textField.${variant}.containerShape`, ...shape });
      continue;
    }
    const style = mixinStyle(declaration.variable);
    if (style) {
      const path = `component.textField.shared.typography.${style}.fontFamily`;
      const exists = canonical.has(path);
      results.push({ module, ...declaration, path, expected: style, actual: exists ? style : undefined, status: exists ? 'reconciled-semantic-reference' : 'pending' });
      continue;
    }
    const path = variant === 'filled' ? filledPath(declaration.variable) : outlinedPath(declaration.variable);
    if (!path) {
      results.push({ module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
    const expected = sourceValue(declaration.raw);
    if (expected.kind === 'unsupported' || expected.kind === 'shape') {
      results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    let status = token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending';
    let driftId;
    if (variant === 'outlined' && declaration.variable === 'focus-outline-width') {
      driftId = 'outlined-text-field-focus-outline-width';
      status = driftIds.has(driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
    }
    results.push({ module, ...declaration, path, expected: expectedValue, actual, ...(driftId ? { driftId } : {}), status });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web Text Field overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
