import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = ['md-comp-loading-indicator', 'md-comp-outlined-segmented-button'];

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
function sourceValue(raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  return { kind: 'unsupported', value: raw };
}
function pathForLoading(variable) {
  const map = {
    'active-indicator-size': 'component.loadingIndicator.activeSize',
    'container-height': 'component.loadingIndicator.containerHeight',
    'container-width': 'component.loadingIndicator.containerWidth',
    'active-indicator-color': 'component.loadingIndicator.activeIndicatorColor',
    'contained-active-indicator-color': 'component.loadingIndicator.containedActiveColor',
    'contained-container-color': 'component.loadingIndicator.containedContainerColor',
  };
  return map[variable];
}
function pathForSegmented(variable) {
  const root = 'component.outlinedSegmentedButton';
  const direct = {
    'container-height': `${root}.containerHeight`,
    'disabled-icon-opacity': `${root}.disabledIconOpacity`,
    'disabled-label-text-opacity': `${root}.disabledLabelTextOpacity`,
    'disabled-outline-opacity': `${root}.disabledOutlineOpacity`,
    'outline-width': `${root}.outlineWidth`,
    'with-icon-icon-size': `${root}.iconSize`,
    'disabled-icon-color': `${root}.disabledIconColor`,
    'disabled-label-text-color': `${root}.disabledLabelTextColor`,
    'disabled-outline-color': `${root}.disabledOutlineColor`,
    'focus-indicator-color': `${root}.focusIndicatorColor`,
    'focus-indicator-outline-offset': `${root}.focusIndicatorOutlineOffset`,
    'focus-indicator-thickness': `${root}.focusIndicatorThickness`,
    'focus-state-layer-opacity': 'state.layer.opacity.focus',
    'hover-state-layer-opacity': 'state.layer.opacity.hover',
    'pressed-state-layer-opacity': 'state.layer.opacity.focus',
    'outline-color': `${root}.outlineColor`,
    'selected-container-color': `${root}.selectedContainerColor`,
    'selected-focus-icon-color': `${root}.selectedFocusIconColor`,
    'selected-focus-label-text-color': `${root}.selectedFocusLabelTextColor`,
    'selected-focus-state-layer-color': `${root}.selectedFocusLabelTextColor`,
    'selected-hover-icon-color': `${root}.selectedHoverIconColor`,
    'selected-hover-label-text-color': `${root}.selectedHoverLabelTextColor`,
    'selected-hover-state-layer-color': `${root}.selectedHoverLabelTextColor`,
    'selected-label-text-color': `${root}.selectedLabelTextColor`,
    'selected-pressed-icon-color': `${root}.selectedPressedIconColor`,
    'selected-pressed-label-text-color': `${root}.selectedPressedLabelTextColor`,
    'selected-pressed-state-layer-color': `${root}.selectedPressedLabelTextColor`,
    'selected-with-icon-icon-color': `${root}.selectedIconColor`,
    'unselected-focus-icon-color': `${root}.unselectedFocusIconColor`,
    'unselected-focus-label-text-color': `${root}.unselectedFocusLabelTextColor`,
    'unselected-focus-state-layer-color': `${root}.unselectedFocusLabelTextColor`,
    'unselected-hover-icon-color': `${root}.unselectedHoverIconColor`,
    'unselected-hover-label-text-color': `${root}.unselectedHoverLabelTextColor`,
    'unselected-hover-state-layer-color': `${root}.unselectedHoverLabelTextColor`,
    'unselected-label-text-color': `${root}.unselectedLabelTextColor`,
    'unselected-pressed-icon-color': `${root}.unselectedPressedIconColor`,
    'unselected-pressed-label-text-color': `${root}.unselectedPressedLabelTextColor`,
    'unselected-pressed-state-layer-color': `${root}.unselectedPressedLabelTextColor`,
    'unselected-with-icon-icon-color': `${root}.unselectedIconColor`,
  };
  return direct[variable];
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-small-controls-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    if (module === 'md-comp-loading-indicator' && declaration.variable === 'container-shape') {
      const actual = canonicalValue(canonical.get('component.loadingIndicator.containerShape'));
      results.push({ module, ...declaration, path: 'component.loadingIndicator.containerShape', expected: 'full', actual, status: actual === 'full' ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    if (module === 'md-comp-outlined-segmented-button' && declaration.variable === 'shape') {
      const actual = canonicalValue(canonical.get('component.outlinedSegmentedButton.shape'));
      results.push({ module, ...declaration, path: 'component.outlinedSegmentedButton.shape', expected: 'full', actual, status: actual === 'full' ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    if (module === 'md-comp-outlined-segmented-button' && /^label-text-(?:font|line-height|size|tracking|weight|type)$/.test(declaration.variable)) {
      const actual = canonicalValue(canonical.get('component.outlinedSegmentedButton.labelTextFont'));
      results.push({ module, ...declaration, path: 'component.outlinedSegmentedButton.labelTextFont', expected: 'labelLarge', actual, status: actual === 'labelLarge' ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = module === 'md-comp-loading-indicator' ? pathForLoading(declaration.variable) : pathForSegmented(declaration.variable);
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
console.log(`Material Web small controls overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
