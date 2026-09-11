import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));

const paths = {
  'container-height': 'component.iconButton.size.small.containerHeight',
  'default-leading-space': 'component.iconButton.size.small.defaultLeadingSpace',
  'default-trailing-space': 'component.iconButton.size.small.defaultTrailingSpace',
  'disabled-container-opacity': 'component.iconButton.variant.filled.disabledContainerOpacity',
  'disabled-icon-opacity': 'component.iconButton.variant.filled.disabledOpacity',
  'icon-size': 'component.iconButton.size.small.iconSize',
  'narrow-leading-space': 'component.iconButton.size.small.narrowLeadingSpace',
  'narrow-trailing-space': 'component.iconButton.size.small.narrowTrailingSpace',
  'wide-leading-space': 'component.iconButton.size.small.wideLeadingSpace',
  'wide-trailing-space': 'component.iconButton.size.small.wideTrailingSpace',
  'container-color': 'component.iconButton.variant.filled.containerColor',
  'container-shape-round': 'component.iconButton.size.small.containerShapeRound',
  'container-shape-square': 'component.iconButton.size.small.containerShapeSquare',
  'disabled-container-color': 'component.iconButton.variant.filled.disabledContainerColor',
  'disabled-icon-color': 'component.iconButton.variant.filled.disabledColor',
  'focus-indicator-color': 'component.iconButton.focusIndicatorColor',
  'focus-indicator-outline-offset': 'component.iconButton.focusIndicatorOutlineOffset',
  'focus-indicator-thickness': 'component.iconButton.focusIndicatorThickness',
  'focused-icon-color': 'component.iconButton.variant.filled.focusedColor',
  'focused-state-layer-color': 'component.iconButton.variant.filled.focusedStateLayerColor',
  'focused-state-layer-opacity': 'component.iconButton.variant.filled.focusedStateLayerOpacity',
  'hovered-icon-color': 'component.iconButton.variant.filled.hoveredColor',
  'hovered-state-layer-color': 'component.iconButton.variant.filled.hoveredStateLayerColor',
  'hovered-state-layer-opacity': 'component.iconButton.variant.filled.hoveredStateLayerOpacity',
  'icon-color': 'component.iconButton.variant.filled.color',
  'pressed-container-corner-size-motion-spring-damping': 'component.iconButton.size.small.pressedShapeMotion.spring.dampingRatio',
  'pressed-container-corner-size-motion-spring-stiffness': 'component.iconButton.size.small.pressedShapeMotion.spring.stiffness',
  'pressed-container-shape': 'component.iconButton.size.small.pressedContainerShape',
  'pressed-icon-color': 'component.iconButton.variant.filled.pressedColor',
  'pressed-state-layer-color': 'component.iconButton.variant.filled.pressedStateLayerColor',
  'pressed-state-layer-opacity': 'component.iconButton.variant.filled.pressedStateLayerOpacity',
  'selected-container-color': 'component.iconButton.variant.filled.selectedContainerColor',
  'selected-container-shape-round': 'component.iconButton.size.small.selectedContainerShapeRound',
  'selected-container-shape-square': 'component.iconButton.size.small.selectedContainerShapeSquare',
  'selected-focused-icon-color': 'component.iconButton.variant.filled.selectedFocusedColor',
  'selected-focused-state-layer-color': 'component.iconButton.variant.filled.selectedFocusedStateLayerColor',
  'selected-hovered-icon-color': 'component.iconButton.variant.filled.selectedHoveredColor',
  'selected-hovered-state-layer-color': 'component.iconButton.variant.filled.selectedHoveredStateLayerColor',
  'selected-icon-color': 'component.iconButton.variant.filled.selectedColor',
  'selected-pressed-icon-color': 'component.iconButton.variant.filled.selectedPressedColor',
  'selected-pressed-state-layer-color': 'component.iconButton.variant.filled.selectedPressedStateLayerColor',
  'unselected-container-color': 'component.iconButton.variant.filled.unselectedContainerColor',
  'unselected-focused-icon-color': 'component.iconButton.variant.filled.unselectedFocusedColor',
  'unselected-focused-state-layer-color': 'component.iconButton.variant.filled.unselectedFocusedStateLayerColor',
  'unselected-hovered-icon-color': 'component.iconButton.variant.filled.unselectedHoveredColor',
  'unselected-hovered-state-layer-color': 'component.iconButton.variant.filled.unselectedHoveredStateLayerColor',
  'unselected-icon-color': 'component.iconButton.variant.filled.unselectedColor',
  'unselected-pressed-icon-color': 'component.iconButton.variant.filled.unselectedPressedColor',
  'unselected-pressed-state-layer-color': 'component.iconButton.variant.filled.unselectedPressedStateLayerColor',
};

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
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
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'alias', value: `{state.focusIndicator.${camel(match[1])}}` };
  match = raw.match(/^md-sys-motion\.\$spring-fast-spatial-(damping|stiffness)$/);
  if (match) {
    const property = match[1] === 'damping' ? 'dampingRatio' : 'stiffness';
    return { kind: 'alias', value: `{motion.spring.standard.fastSpatial.${property}}` };
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
    }
  }
  return declarations;
}

const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_md-comp-icon-button.scss`;
const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-icon-button-generic-overlap-audit' } });
if (!response.ok) throw new Error(`Failed to fetch md-comp-icon-button: ${response.status}`);
const results = [];
for (const declaration of parseSass(await response.text())) {
  if (declaration.deprecated) {
    results.push({ ...declaration, status: 'excluded-deprecated' });
    continue;
  }
  const path = paths[declaration.variable];
  if (!path) {
    results.push({ ...declaration, status: 'pending-unmapped-source' });
    continue;
  }
  const expected = normalize(declaration.raw);
  if (expected.kind === 'unsupported') {
    results.push({ ...declaration, path, status: 'pending-unsupported-source' });
    continue;
  }
  const token = canonical.get(path);
  const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
  const matches = token && Object.is(actual, expected.value);
  results.push({
    ...declaration,
    path,
    expected: expected.value,
    actual,
    status: matches ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
  });
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web generic Icon Button overlap audit: current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
