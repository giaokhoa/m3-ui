import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const module = 'md-comp-checkbox';
const root = 'component.checkbox';

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
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'canonical', path: `shape.corner.${camel(match[1])}` };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'canonical', path: `state.focusIndicator.${camel(match[1])}` };
  return { kind: 'unsupported', value: raw };
}
function pathFor(variable) {
  const direct = {
    'container-shape': `${root}.containerRadius`,
    'container-size': `${root}.containerSize`,
    'icon-size': `${root}.iconSize`,
    'selected-disabled-container-opacity': `${root}.disabledOpacity.selectedContainer`,
    'selected-disabled-container-outline-width': `${root}.outline.selectedWidth`,
    'selected-focus-outline-width': `${root}.outline.selectedWidth`,
    'selected-hover-outline-width': `${root}.outline.selectedWidth`,
    'selected-outline-width': `${root}.outline.selectedWidth`,
    'selected-pressed-outline-width': `${root}.outline.selectedWidth`,
    'state-layer-size': `${root}.stateLayerSize`,
    'unselected-disabled-container-opacity': `${root}.disabledOpacity.unselectedOutline`,
    'unselected-disabled-outline-width': `${root}.strokeWidth`,
    'unselected-focus-outline-width': `${root}.strokeWidth`,
    'unselected-hover-outline-width': `${root}.strokeWidth`,
    'unselected-outline-width': `${root}.strokeWidth`,
    'unselected-pressed-outline-width': `${root}.strokeWidth`,
    'error-focus-state-layer-color': `${root}.error.stateLayerColor`,
    'error-hover-state-layer-color': `${root}.error.stateLayerColor`,
    'error-pressed-state-layer-color': `${root}.error.stateLayerColor`,
    'focus-indicator-color': `${root}.focusIndicatorColor`,
    'focus-indicator-outline-offset': `${root}.focusIndicatorOutlineOffset`,
    'focus-indicator-thickness': `${root}.focusIndicatorThickness`,
    'selected-container-color': `${root}.colors.selectedContainer`,
    'selected-disabled-container-color': `${root}.colors.disabledSelectedContainer`,
    'selected-disabled-icon-color': `${root}.colors.disabledSelectedIcon`,
    'selected-error-container-color': `${root}.error.selectedContainerColor`,
    'selected-error-focus-container-color': `${root}.error.selectedContainerColor`,
    'selected-error-focus-icon-color': `${root}.error.selectedIconColor`,
    'selected-error-hover-container-color': `${root}.error.selectedContainerColor`,
    'selected-error-hover-icon-color': `${root}.error.selectedIconColor`,
    'selected-error-icon-color': `${root}.error.selectedIconColor`,
    'selected-error-pressed-container-color': `${root}.error.selectedContainerColor`,
    'selected-error-pressed-icon-color': `${root}.error.selectedIconColor`,
    'selected-focus-container-color': `${root}.colors.selectedContainer`,
    'selected-focus-icon-color': `${root}.colors.selectedIcon`,
    'selected-focus-state-layer-color': `${root}.colors.selectedContainer`,
    'selected-hover-container-color': `${root}.colors.selectedContainer`,
    'selected-hover-icon-color': `${root}.colors.selectedIcon`,
    'selected-hover-state-layer-color': `${root}.colors.selectedContainer`,
    'selected-icon-color': `${root}.colors.selectedIcon`,
    'selected-pressed-container-color': `${root}.colors.selectedContainer`,
    'selected-pressed-icon-color': `${root}.colors.selectedIcon`,
    'selected-pressed-state-layer-color': `${root}.selectedPressedStateLayerColor`,
    'state-layer-shape': `${root}.stateLayerShape`,
    'unselected-disabled-outline-color': `${root}.colors.disabledUnselectedOutline`,
    'unselected-error-focus-outline-color': `${root}.error.unselectedOutlineColor`,
    'unselected-error-hover-outline-color': `${root}.error.unselectedOutlineColor`,
    'unselected-error-outline-color': `${root}.error.unselectedOutlineColor`,
    'unselected-error-pressed-outline-color': `${root}.error.unselectedOutlineColor`,
    'unselected-focus-outline-color': `${root}.unselectedInteractiveOutlineColor`,
    'unselected-focus-state-layer-color': `${root}.unselectedInteractiveOutlineColor`,
    'unselected-hover-outline-color': `${root}.unselectedInteractiveOutlineColor`,
    'unselected-hover-state-layer-color': `${root}.unselectedInteractiveOutlineColor`,
    'unselected-outline-color': `${root}.colors.unselectedOutline`,
    'unselected-pressed-outline-color': `${root}.unselectedInteractiveOutlineColor`,
    'unselected-pressed-state-layer-color': `${root}.unselectedPressedStateLayerColor`,
  };
  if (direct[variable]) return direct[variable];
  const opacity = variable.match(/(?:error-|selected-|unselected-)?(focus|hover|pressed)-state-layer-opacity$/);
  if (opacity) return `state.layer.opacity.${opacity[1]}`;
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
    }
  }
  return declarations;
}

const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-checkbox-overlap-audit' } });
if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
const results = [];
for (const declaration of parseSass(await response.text())) {
  if (declaration.deprecated) {
    results.push({ module, ...declaration, status: 'excluded-deprecated' });
    continue;
  }
  const path = pathFor(declaration.variable);
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
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Checkbox overlap audit: modules=1 current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
