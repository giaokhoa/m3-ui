import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-switch-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const module = 'md-comp-switch';

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
  if (match) return { kind: 'value', value: match[1].replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) };
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
    }
  }
  return declarations;
}

const direct = {
  'disabled-selected-handle-opacity': 'component.switch.disabledOpacity.checkedThumb',
  'disabled-selected-icon-opacity': 'component.switch.disabledOpacity.checkedIcon',
  'disabled-track-opacity': 'component.switch.disabledOpacity.track',
  'disabled-unselected-handle-opacity': 'component.switch.disabledOpacity.uncheckedThumb',
  'disabled-unselected-icon-opacity': 'component.switch.disabledOpacity.uncheckedIcon',
  'pressed-handle-height': 'component.switch.handle.pressedSize',
  'pressed-handle-width': 'component.switch.handle.pressedSize',
  'selected-handle-height': 'component.switch.handle.selectedSize',
  'selected-handle-width': 'component.switch.handle.selectedSize',
  'selected-icon-size': 'component.switch.handle.iconSize',
  'state-layer-size': 'component.switch.stateLayerSize',
  'track-height': 'component.switch.track.height',
  'track-outline-width': 'component.switch.track.outlineWidth',
  'track-width': 'component.switch.track.width',
  'unselected-handle-height': 'component.switch.handle.unselectedSize',
  'unselected-handle-width': 'component.switch.handle.unselectedSize',
  'unselected-icon-size': 'component.switch.handle.iconSize',
  'with-icon-handle-height': 'component.switch.handle.selectedSize',
  'with-icon-handle-width': 'component.switch.handle.selectedSize',
  'disabled-selected-handle-color': 'component.switch.colors.disabledCheckedThumb',
  'disabled-selected-icon-color': 'component.switch.colors.disabledCheckedIcon',
  'disabled-selected-track-color': 'component.switch.colors.disabledCheckedTrack',
  'disabled-unselected-handle-color': 'component.switch.colors.disabledUncheckedThumb',
  'disabled-unselected-icon-color': 'component.switch.colors.disabledUncheckedIcon',
  'disabled-unselected-track-color': 'component.switch.colors.disabledUncheckedTrack',
  'disabled-unselected-track-outline-color': 'component.switch.colors.disabledUncheckedBorder',
  'focus-indicator-color': 'component.switch.focusIndicator.color',
  'focus-indicator-offset': 'component.switch.focusIndicator.offset',
  'focus-indicator-thickness': 'component.switch.focusIndicator.thickness',
  'handle-shape': 'component.switch.handle.shape',
  'selected-focus-handle-color': 'component.switch.state.selected.focus.handleColor',
  'selected-focus-icon-color': 'component.switch.webSelectedIconColor',
  'selected-focus-state-layer-color': 'component.switch.state.selected.focus.stateLayerColor',
  'selected-focus-state-layer-opacity': 'component.switch.state.selected.focus.stateLayerOpacity',
  'selected-focus-track-color': 'component.switch.state.selected.focus.trackColor',
  'selected-handle-color': 'component.switch.colors.checkedThumb',
  'selected-hover-handle-color': 'component.switch.state.selected.hover.handleColor',
  'selected-hover-icon-color': 'component.switch.webSelectedIconColor',
  'selected-hover-state-layer-color': 'component.switch.state.selected.hover.stateLayerColor',
  'selected-hover-state-layer-opacity': 'component.switch.state.selected.hover.stateLayerOpacity',
  'selected-hover-track-color': 'component.switch.state.selected.hover.trackColor',
  'selected-icon-color': 'component.switch.webSelectedIconColor',
  'selected-pressed-handle-color': 'component.switch.state.selected.pressed.handleColor',
  'selected-pressed-icon-color': 'component.switch.webSelectedIconColor',
  'selected-pressed-state-layer-color': 'component.switch.state.selected.pressed.stateLayerColor',
  'selected-pressed-state-layer-opacity': 'component.switch.state.selected.pressed.stateLayerOpacity',
  'selected-pressed-track-color': 'component.switch.state.selected.pressed.trackColor',
  'selected-track-color': 'component.switch.colors.checkedTrack',
  'state-layer-shape': 'component.switch.stateLayerShape',
  'track-shape': 'component.switch.track.shape',
  'unselected-focus-handle-color': 'component.switch.state.unselected.focus.handleColor',
  'unselected-focus-icon-color': 'component.switch.state.unselected.focus.iconColor',
  'unselected-focus-state-layer-color': 'component.switch.state.unselected.focus.stateLayerColor',
  'unselected-focus-state-layer-opacity': 'component.switch.state.unselected.focus.stateLayerOpacity',
  'unselected-focus-track-color': 'component.switch.state.unselected.focus.trackColor',
  'unselected-focus-track-outline-color': 'component.switch.state.unselected.focus.outlineColor',
  'unselected-handle-color': 'component.switch.colors.uncheckedThumb',
  'unselected-hover-handle-color': 'component.switch.state.unselected.hover.handleColor',
  'unselected-hover-icon-color': 'component.switch.state.unselected.hover.iconColor',
  'unselected-hover-state-layer-color': 'component.switch.state.unselected.hover.stateLayerColor',
  'unselected-hover-state-layer-opacity': 'component.switch.state.unselected.hover.stateLayerOpacity',
  'unselected-hover-track-color': 'component.switch.state.unselected.hover.trackColor',
  'unselected-hover-track-outline-color': 'component.switch.state.unselected.hover.outlineColor',
  'unselected-icon-color': 'component.switch.colors.uncheckedIcon',
  'unselected-pressed-handle-color': 'component.switch.state.unselected.pressed.handleColor',
  'unselected-pressed-icon-color': 'component.switch.state.unselected.pressed.iconColor',
  'unselected-pressed-state-layer-color': 'component.switch.state.unselected.pressed.stateLayerColor',
  'unselected-pressed-state-layer-opacity': 'component.switch.state.unselected.pressed.stateLayerOpacity',
  'unselected-pressed-track-color': 'component.switch.state.unselected.pressed.trackColor',
  'unselected-pressed-track-outline-color': 'component.switch.state.unselected.pressed.outlineColor',
  'unselected-track-color': 'component.switch.colors.uncheckedTrack',
  'unselected-track-outline-color': 'component.switch.colors.uncheckedBorder',
};

const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-switch-overlap-audit' } });
if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
const results = [];
for (const declaration of parseSass(await response.text())) {
  if (declaration.deprecated) {
    results.push({ module, ...declaration, status: 'excluded-deprecated' });
    continue;
  }
  const path = direct[declaration.variable];
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
  let status = token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending';
  if (/^selected-(?:focus-|hover-|pressed-)?icon-color$/.test(declaration.variable)) {
    const driftId = 'switch-selected-icon-color';
    status = driftIds.has(driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
    results.push({ module, ...declaration, path, expected: expectedValue, actual, driftId, status });
    continue;
  }
  results.push({ module, ...declaration, path, expected: expectedValue, actual, status });
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web Switch overlap audit: modules=1 current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
