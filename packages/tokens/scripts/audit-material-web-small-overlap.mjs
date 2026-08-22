import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-badge', kind: 'badge' },
  { module: 'md-comp-bottom-app-bar', kind: 'bottomAppBar' },
  { module: 'md-comp-divider', kind: 'divider' },
  { module: 'md-comp-drag-handle', kind: 'dragHandle' },
  { module: 'md-comp-radio-button', kind: 'radioButton' },
];

function canonicalValue(token) {
  if (!token) return undefined;
  if (token.type === 'dimension' && token.value && typeof token.value === 'object') {
    return `${token.value.value}${token.value.unit}`;
  }
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
function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function pathFor(module, variable) {
  if (module.kind === 'badge') {
    const map = {
      'large-size': 'component.badge.large.size',
      size: 'component.badge.small.size',
      color: 'component.badge.small.color',
      'large-color': 'component.badge.large.color',
      'large-label-text-color': 'component.badge.large.labelTextColor',
      'large-shape': 'component.badge.large.shape',
      shape: 'component.badge.small.shape',
    };
    return map[variable];
  }
  if (module.kind === 'bottomAppBar') return `component.bottomAppBar.${camel(variable)}`;
  if (module.kind === 'divider') return `component.divider.${camel(variable)}`;
  if (module.kind === 'dragHandle') {
    const map = {
      'container-width': 'component.dragHandle.default.containerWidth',
      height: 'component.dragHandle.default.height',
      width: 'component.dragHandle.default.width',
      color: 'component.dragHandle.default.color',
      elevation: 'component.dragHandle.default.elevation',
      shape: 'component.dragHandle.default.shape',
      'pressed-height': 'component.dragHandle.pressed.height',
      'pressed-width': 'component.dragHandle.pressed.width',
      'pressed-color': 'component.dragHandle.pressed.color',
      'pressed-elevation': 'component.dragHandle.pressed.elevation',
      'pressed-shape': 'component.dragHandle.pressed.shape',
      'focus-state-layer-color': 'component.dragHandle.focusStateLayerColor',
      'focus-state-layer-opacity': 'component.dragHandle.focusStateLayerOpacity',
      'hover-state-layer-color': 'component.dragHandle.hoverStateLayerColor',
      'hover-state-layer-opacity': 'component.dragHandle.hoverStateLayerOpacity',
    };
    return map[variable];
  }
  const radio = {
    'disabled-selected-icon-opacity': 'component.radioButton.disabledOpacity',
    'disabled-unselected-icon-opacity': 'component.radioButton.disabledOpacity',
    'icon-size': 'component.radioButton.iconSize',
    'state-layer-size': 'component.radioButton.stateLayerSize',
    'disabled-selected-icon-color': 'component.radioButton.colors.disabledSelected',
    'disabled-unselected-icon-color': 'component.radioButton.colors.disabledUnselected',
    'selected-icon-color': 'component.radioButton.colors.selected',
    'unselected-icon-color': 'component.radioButton.colors.unselected',
    'selected-focus-icon-color': 'component.radioButton.state.selected.focus.iconColor',
    'selected-focus-state-layer-color': 'component.radioButton.state.selected.focus.stateLayerColor',
    'selected-focus-state-layer-opacity': 'component.radioButton.state.selected.focus.stateLayerOpacity',
    'selected-hover-icon-color': 'component.radioButton.state.selected.hover.iconColor',
    'selected-hover-state-layer-color': 'component.radioButton.state.selected.hover.stateLayerColor',
    'selected-hover-state-layer-opacity': 'component.radioButton.state.selected.hover.stateLayerOpacity',
    'selected-pressed-icon-color': 'component.radioButton.state.selected.pressed.iconColor',
    'selected-pressed-state-layer-color': 'component.radioButton.state.selected.pressed.stateLayerColor',
    'selected-pressed-state-layer-opacity': 'component.radioButton.state.selected.pressed.stateLayerOpacity',
    'unselected-focus-icon-color': 'component.radioButton.state.unselected.focus.iconColor',
    'unselected-focus-state-layer-color': 'component.radioButton.state.unselected.focus.stateLayerColor',
    'unselected-focus-state-layer-opacity': 'component.radioButton.state.unselected.focus.stateLayerOpacity',
    'unselected-hover-icon-color': 'component.radioButton.state.unselected.hover.iconColor',
    'unselected-hover-state-layer-color': 'component.radioButton.state.unselected.hover.stateLayerColor',
    'unselected-hover-state-layer-opacity': 'component.radioButton.state.unselected.hover.stateLayerOpacity',
    'unselected-pressed-icon-color': 'component.radioButton.state.unselected.pressed.iconColor',
    'unselected-pressed-state-layer-color': 'component.radioButton.state.unselected.pressed.stateLayerColor',
    'unselected-pressed-state-layer-opacity': 'component.radioButton.state.unselected.pressed.stateLayerOpacity',
  };
  return radio[variable];
}
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  const number = raw.match(/^-?\d+(?:\.\d+)?$/);
  if (number) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$level(\d+)$/);
  if (match) return { kind: 'value', value: `level${match[1]}` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
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

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-small-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    if (module.kind === 'badge' && /^(large-label-text-(font|line-height|size|tracking|weight)|large-label-text-type)$/.test(declaration.variable)) {
      const path = 'component.badge.large.labelTypography';
      const actual = canonicalValue(canonical.get(path));
      results.push({ module: module.module, ...declaration, path, expected: 'labelSmall', actual, status: actual === 'labelSmall' ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = pathFor(module, declaration.variable);
    if (!path) {
      results.push({ module: module.module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
    results.push({ module: module.module, ...declaration, path, expected: expected.value, actual, status: token && Object.is(actual, expected.value) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web small overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
