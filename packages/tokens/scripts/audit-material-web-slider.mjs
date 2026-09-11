import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-slider-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const modules = [
  'md-comp-slider',
  'md-comp-slider-xsmall',
  'md-comp-slider-small',
  'md-comp-slider-medium',
  'md-comp-slider-large',
  'md-comp-slider-xlarge',
];

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
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
  match = raw.match(/^md-sys-typescale\.\$([a-z0-9-]+)-(font|line-height|size|tracking|weight)$/);
  if (match) {
    const field = {
      font: 'fontFamily',
      'line-height': 'lineHeight',
      size: 'fontSize',
      tracking: 'letterSpacing',
      weight: 'fontWeight',
    }[match[2]];
    return { kind: 'canonical', path: `typography.${camel(match[1])}.${field}` };
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

const webRoot = 'component.slider.webCurrent';
const rootSpecial = {
  'active-stop-indicator-container-opacity': { path: `${webRoot}.activeStopIndicatorContainerOpacity` },
  'active-stop-indicator-container-color': { path: `${webRoot}.activeStopIndicatorContainerColor` },
  'inactive-stop-indicator-container-opacity': { path: `${webRoot}.inactiveStopIndicatorContainerOpacity` },
  'inactive-stop-indicator-container-color': { path: `${webRoot}.inactiveStopIndicatorContainerColor` },
  'disabled-active-stop-indicator-container-color': { path: `${webRoot}.disabledActiveStopIndicatorContainerColor`, driftId: 'slider-disabled-stop-indicator-model' },
  'disabled-inactive-stop-indicator-container-color': { path: `${webRoot}.disabledInactiveStopIndicatorContainerColor`, driftId: 'slider-disabled-stop-indicator-model' },
  'active-track-inner-corner-corner-size': { path: `${webRoot}.activeTrackInnerCornerCornerSize`, rawValue: true, driftId: 'slider-active-track-corner-model' },
  'active-track-outer-corner-corner-size': { path: `${webRoot}.activeTrackOuterCornerCornerSize`, driftId: 'slider-active-track-corner-model' },
  'stop-indicator-color': { path: `${webRoot}.stopIndicatorColor`, driftId: 'slider-stop-indicator-color' },
  'stop-indicator-color-selected': { path: `${webRoot}.stopIndicatorColorSelected`, driftId: 'slider-stop-indicator-selected-color' },
  'stop-indicator-trailing-space': { path: `${webRoot}.stopIndicatorTrailingSpace`, driftId: 'slider-stop-indicator-trailing-space' },
  'value-indicator-label-label-text-color': { path: 'component.slider.valueIndicatorLabelTextColor' },
  'value-indicator-label-label-text-tracking': { path: `${webRoot}.valueIndicatorLabelTextTracking`, driftId: 'slider-value-indicator-label-metrics' },
  'value-indicator-label-label-text-weight': { path: `${webRoot}.valueIndicatorLabelTextWeight`, driftId: 'slider-value-indicator-label-metrics' },
};

function valueIndicatorTypography(variable) {
  const match = variable.match(/^value-indicator-label-label-text-(font|line-height|size)$/);
  if (!match) return undefined;
  return { suffix: match[1], path: 'component.slider.valueIndicatorLabelTextFont', semantic: 'labelLarge' };
}

const sizeNames = {
  'md-comp-slider-xsmall': 'xSmall',
  'md-comp-slider-small': 'small',
  'md-comp-slider-medium': 'medium',
  'md-comp-slider-large': 'large',
  'md-comp-slider-xlarge': 'xLarge',
};

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-slider-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    if (module !== 'md-comp-slider') {
      const path = `component.slider.size.${sizeNames[module]}.${camel(declaration.variable)}`;
      const expected = sourceValue(declaration.raw);
      if (expected.kind === 'unsupported') {
        results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
        continue;
      }
      const token = canonical.get(path);
      const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
      const actual = resolvedValue(token);
      results.push({ module, ...declaration, path, expected: expectedValue, actual, status: token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
      continue;
    }

    const typography = valueIndicatorTypography(declaration.variable);
    if (typography) {
      const expectedRaw = `md-sys-typescale.$label-large-${typography.suffix}`;
      const actual = canonicalValue(canonical.get(typography.path));
      results.push({
        module,
        ...declaration,
        path: typography.path,
        expected: typography.semantic,
        actual,
        status: declaration.raw === expectedRaw && actual === typography.semantic ? 'reconciled-semantic-reference' : 'mismatch',
      });
      continue;
    }

    const special = rootSpecial[declaration.variable];
    const path = special?.path ?? `component.slider.${camel(declaration.variable)}`;
    if (special?.rawValue) {
      const actual = canonicalValue(canonical.get(path));
      const status = special.driftId && driftIds.has(special.driftId) && actual === declaration.raw ? 'reconciled-documented-drift' : actual === declaration.raw ? 'reconciled-direct' : canonical.has(path) ? 'mismatch' : 'pending';
      results.push({ module, ...declaration, path, expected: declaration.raw, actual, ...(special.driftId ? { driftId: special.driftId } : {}), status });
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
    let status = token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending';
    if (special?.driftId) {
      status = driftIds.has(special.driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
    }
    results.push({ module, ...declaration, path, expected: expectedValue, actual, ...(special?.driftId ? { driftId: special.driftId } : {}), status });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web Slider overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
