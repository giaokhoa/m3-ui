import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-menu-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const modules = ['md-comp-menu', 'md-comp-menus', 'md-comp-menus-standard', 'md-comp-menus-vibrant'];

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
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed|dragged)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(inner-offset|outer-offset|thickness)$/);
  if (match) {
    const field = match[1] === 'inner-offset' ? 'innerOffset' : match[1] === 'outer-offset' ? 'outerOffset' : 'thickness';
    return { kind: 'canonical', path: `state.focusIndicator.${field}` };
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

function segmentedTypography(variable) {
  const specs = [
    ['menu-item-label-text', 'label-large', 'component.menu.segmented.webCurrent.itemLabelTextTypography', 'labelLarge', 'menus-item-label-typography'],
    ['menu-item-supporting-text', 'body-small', 'component.menu.segmented.webCurrent.itemSupportingTextTypography', 'bodySmall', 'menus-item-supporting-typography'],
    ['menu-item-trailing-supporting-text', 'label-large', 'component.menu.segmented.webCurrent.itemTrailingSupportingTextTypography', 'labelLarge', 'menus-item-trailing-supporting-typography'],
  ];
  for (const [prefix, sourceStyle, path, semantic, driftId] of specs) {
    const match = variable.match(new RegExp(`^${prefix}-(font|line-height|size|tracking|weight)$`));
    if (match) return { sourceStyle, path, semantic, driftId, suffix: match[1] };
  }
}
function segmentedPath(variable) {
  const root = 'component.menu.segmented';
  const direct = {
    gap: `${root}.segmentedGap`,
    'group-padding': `${root}.webCurrent.groupPadding`,
    'horizontal-icon-only-gap': `${root}.horizontalIconOnlySegmentedGap`,
    'active-container-shape': `${root}.webCurrent.activeContainerShape`,
    'horizontal-container-shape': `${root}.webCurrent.horizontalContainerShape`,
    'menu-item-focus-indicator-outline-offset': `${root}.webCurrent.itemFocusIndicatorOutlineOffset`,
    'menu-item-focus-indicator-thickness': `${root}.webCurrent.itemFocusIndicatorThickness`,
  };
  if (direct[variable]) return direct[variable];
  let key = variable;
  key = key.replace(/^horizontal-icon-only-menu-item-/, 'horizontal-icon-only-item-');
  key = key.replace(/^horizontal-menu-item-/, 'horizontal-item-');
  key = key.replace(/^menu-item-/, 'item-');
  return `${root}.${camel(key)}`;
}
function segmentedDriftId(variable) {
  if (variable === 'active-container-shape') return 'menus-active-container-shape';
  if (variable === 'group-padding') return 'menus-group-padding';
}
function rolePath(variant, variable) {
  const root = `component.menu.${variant}`;
  const directOverrides = variant === 'standard'
    ? {
        'disabled-icon-button-icon-color': `${root}.disabledButtonIconIconColor`,
        'icon-button-disabled-icon-color': `${root}.buttonDisabledIconIconColor`,
        'icon-button-icon-color': `${root}.buttonIconIconColor`,
        'icon-button-selected-icon-color': `${root}.buttonSelectedIconIconColor`,
        'container-shadow-color': `${root}.containerShadowColor`,
        'section-label-text-color': `${root}.itemSupportingTextColor`,
      }
    : {
        'icon-button-disabled-icon-color': `${root}.buttonDisabledIconIconColor`,
        'icon-button-icon-color': `${root}.buttonIconIconColor`,
        'icon-button-selected-disabled-icon-color': `${root}.buttonSelectedDisabledIconIconColor`,
        'icon-button-selected-icon-color': `${root}.buttonSelectedIconIconColor`,
        'section-label-text-color': `${root}.itemSupportingTextColor`,
      };
  if (directOverrides[variable]) return { path: directOverrides[variable] };

  if (variable.endsWith('state-layer-opacity')) {
    const state = variable.match(/(?:active|focused|hovered|pressed)/)?.[0];
    const foundation = state === 'focused' ? 'focus' : state === 'hovered' || state === 'active' ? 'hover' : state === 'pressed' ? 'pressed' : undefined;
    if (foundation) return { path: `state.layer.opacity.${foundation}`, semanticReference: true };
  }

  if (variable.endsWith('state-layer-color')) {
    if (variable.startsWith('icon-button-selected-')) {
      const selectedIcon = variant === 'standard' ? `${root}.buttonSelectedIconIconColor` : `${root}.buttonSelectedIconIconColor`;
      return { path: selectedIcon, semanticReference: true };
    }
    if (variable.startsWith('icon-button-')) {
      return { path: variant === 'standard' ? `${root}.itemLabelTextColor` : `${root}.buttonIconIconColor`, semanticReference: true };
    }
    if (variable.startsWith('menu-item-selected-')) return { path: `${root}.itemSelectedLabelTextColor`, semanticReference: true };
    if (variable.startsWith('menu-item-')) return { path: `${root}.itemLabelTextColor`, semanticReference: true };
  }

  let key = variable.replace(/^menu-item-/, 'item-');
  const direct = `${root}.${camel(key)}`;
  return { path: direct };
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-menu-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    if (module === 'md-comp-menu') {
      const path = `component.menu.base.${camel(declaration.variable)}`;
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

    if (module === 'md-comp-menus') {
      const typography = segmentedTypography(declaration.variable);
      if (typography) {
        const expectedRawPrefix = `md-sys-typescale.$${typography.sourceStyle}-${typography.suffix}`;
        const actual = canonicalValue(canonical.get(typography.path));
        const status = driftIds.has(typography.driftId) && declaration.raw === expectedRawPrefix && actual === typography.semantic ? 'reconciled-documented-drift' : 'mismatch';
        results.push({ module, ...declaration, path: typography.path, expected: typography.semantic, actual, driftId: typography.driftId, status });
        continue;
      }
      const path = segmentedPath(declaration.variable);
      const expected = sourceValue(declaration.raw);
      if (expected.kind === 'unsupported') {
        results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
        continue;
      }
      const token = canonical.get(path);
      const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
      const actual = resolvedValue(token);
      const driftId = segmentedDriftId(declaration.variable);
      let status = token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending';
      if (driftId) status = driftIds.has(driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
      results.push({ module, ...declaration, path, expected: expectedValue, actual, ...(driftId ? { driftId } : {}), status });
      continue;
    }

    const variant = module.endsWith('-standard') ? 'standard' : 'vibrant';
    const mapping = rolePath(variant, declaration.variable);
    const expected = sourceValue(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module, ...declaration, path: mapping.path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(mapping.path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    results.push({
      module,
      ...declaration,
      path: mapping.path,
      expected: expectedValue,
      actual,
      status: token && Object.is(actual, expectedValue) ? (mapping.semanticReference ? 'reconciled-semantic-reference' : 'reconciled-direct') : token ? 'mismatch' : 'pending',
    });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web Menu overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
