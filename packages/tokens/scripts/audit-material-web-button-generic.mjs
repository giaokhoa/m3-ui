import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const driftManifest = JSON.parse(
  await readFile(new URL('../audit/material-web-button-generic-drift.json', import.meta.url), 'utf8'),
);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const driftByDeclaration = new Map(
  driftManifest.drift.map((entry) => [`${entry.module}:${entry.variable}`, entry]),
);
const seenDrift = new Set();

const paths = {
  'container-height': 'component.button.baseline.minHeight',
  'disabled-container-opacity': 'component.button.variant.filled.disabledContainerOpacity',
  'disabled-icon-opacity': 'component.button.variant.filled.disabledIconOpacity',
  'disabled-label-text-opacity': 'component.button.variant.filled.disabledLabelTextOpacity',
  'icon-label-space': 'component.button.baseline.iconSpacing',
  'icon-size': 'component.button.baseline.iconSize',
  'leading-space': 'component.button.baseline.padding.inlineStart',
  'trailing-space': 'component.button.baseline.padding.inlineEnd',
  'container-color': 'component.button.variant.filled.containerColor',
  'container-elevation': 'component.button.variant.filled.defaultElevation',
  'container-shadow-color': 'component.button.variant.filled.containerShadowColor',
  'container-shape-round': 'component.button.size.small.containerShapeRound',
  'container-shape-square': 'component.button.size.small.containerShapeSquare',
  'disabled-container-color': 'component.button.variant.filled.disabledContainerColor',
  'disabled-container-elevation': 'component.button.variant.filled.disabledElevation',
  'disabled-icon-color': 'component.button.variant.filled.disabledIconColor',
  'disabled-label-text-color': 'component.button.variant.filled.disabledLabelTextColor',
  'focus-indicator-color': 'component.button.baseline.focusIndicatorColor',
  'focus-indicator-outline-offset': 'component.button.baseline.focusIndicatorOutlineOffset',
  'focus-indicator-thickness': 'component.button.baseline.focusIndicatorThickness',
  'focused-container-elevation': 'component.button.variant.filled.focusedElevation',
  'focused-icon-color': 'component.button.variant.filled.focusedIconColor',
  'focused-label-text-color': 'component.button.variant.filled.focusedLabelTextColor',
  'focused-state-layer-color': 'component.button.variant.filled.focusedStateLayerColor',
  'focused-state-layer-opacity': 'component.button.variant.filled.focusedStateLayerOpacity',
  'hovered-container-elevation': 'component.button.variant.filled.hoveredElevation',
  'hovered-icon-color': 'component.button.variant.filled.hoveredIconColor',
  'hovered-label-text-color': 'component.button.variant.filled.hoveredLabelTextColor',
  'hovered-state-layer-color': 'component.button.variant.filled.hoveredStateLayerColor',
  'hovered-state-layer-opacity': 'component.button.variant.filled.hoveredStateLayerOpacity',
  'icon-color': 'component.button.variant.filled.iconColor',
  'label-text-color': 'component.button.variant.filled.labelTextColor',
  'label-text-selected-color': 'component.button.variant.filled.selectedLabelTextColor',
  'label-text-unselected-color': 'component.button.variant.filled.unselectedLabelTextColor',
  'pressed-container-corner-size-motion-spring-damping': 'component.button.size.small.pressedShapeMotion.spring.dampingRatio',
  'pressed-container-corner-size-motion-spring-stiffness': 'component.button.size.small.pressedShapeMotion.spring.stiffness',
  'pressed-container-elevation': 'component.button.variant.filled.pressedElevation',
  'pressed-container-shape': 'component.button.size.small.pressedShape',
  'pressed-icon-color': 'component.button.variant.filled.pressedIconColor',
  'pressed-label-text-color': 'component.button.variant.filled.pressedLabelTextColor',
  'pressed-state-layer-color': 'component.button.variant.filled.pressedStateLayerColor',
  'pressed-state-layer-opacity': 'component.button.variant.filled.pressedStateLayerOpacity',
  'selected-container-color': 'component.button.variant.filled.selectedContainerColor',
  'selected-container-shape-round': 'component.button.size.small.selectedContainerShapeRound',
  'selected-container-shape-square': 'component.button.size.small.selectedContainerShapeSquare',
  'selected-focused-icon-color': 'component.button.variant.filled.selectedFocusedIconColor',
  'selected-focused-label-text-color': 'component.button.variant.filled.selectedFocusedLabelTextColor',
  'selected-focused-state-layer-color': 'component.button.variant.filled.selectedFocusedStateLayerColor',
  'selected-hovered-icon-color': 'component.button.variant.filled.selectedHoveredIconColor',
  'selected-hovered-label-text-color': 'component.button.variant.filled.selectedHoveredLabelTextColor',
  'selected-hovered-state-layer-color': 'component.button.variant.filled.selectedHoveredStateLayerColor',
  'selected-icon-color': 'component.button.variant.filled.selectedIconColor',
  'selected-pressed-icon-color': 'component.button.variant.filled.selectedPressedIconColor',
  'selected-pressed-label-text-color': 'component.button.variant.filled.selectedPressedLabelTextColor',
  'selected-pressed-state-layer-color': 'component.button.variant.filled.selectedPressedStateLayerColor',
  'unselected-container-color': 'component.button.variant.filled.unselectedContainerColor',
  'unselected-focused-icon-color': 'component.button.variant.filled.unselectedFocusedIconColor',
  'unselected-focused-label-text-color': 'component.button.variant.filled.unselectedFocusedLabelTextColor',
  'unselected-focused-state-layer-color': 'component.button.variant.filled.unselectedFocusedStateLayerColor',
  'unselected-hovered-icon-color': 'component.button.variant.filled.unselectedHoveredIconColor',
  'unselected-hovered-label-text-color': 'component.button.variant.filled.unselectedHoveredLabelTextColor',
  'unselected-hovered-state-layer-color': 'component.button.variant.filled.unselectedHoveredStateLayerColor',
  'unselected-icon-color': 'component.button.variant.filled.unselectedIconColor',
  'unselected-pressed-icon-color': 'component.button.variant.filled.unselectedPressedIconColor',
  'unselected-pressed-label-text-color': 'component.button.variant.filled.unselectedPressedLabelTextColor',
  'unselected-pressed-state-layer-color': 'component.button.variant.filled.unselectedPressedStateLayerColor',
  'label-text': 'component.button.baseline.labelTypography',
};

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
function normalize(raw) {
  const px = raw.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$(level\d)$/);
  if (match) return { kind: 'value', value: match[1] };
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
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
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
      declarations.push({ tokenName, variable: variable[1], raw: variable[2].trim(), deprecated, kind: 'variable' });
      tokenName = undefined;
      deprecated = false;
      continue;
    }
    const mixin = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixin) {
      const body = lines.slice(index + 1, index + 5).join('\n');
      const style = body.match(/@include\s+md-sys-typescale\.([a-z]+-[a-z]+);/)?.[1];
      declarations.push({ tokenName, variable: mixin[1], deprecated, kind: 'mixin', style: style ? camel(style) : undefined });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_md-comp-button.scss`;
const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-button-generic-overlap-audit' } });
if (!response.ok) throw new Error(`Failed to fetch md-comp-button: ${response.status}`);
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
  const token = canonical.get(path);
  const drift = driftByDeclaration.get(`md-comp-button:${declaration.variable}`);
  if (drift) {
    if (drift.canonicalPath !== path) throw new Error(`Drift ${drift.id} path mismatch: ${drift.canonicalPath} != ${path}`);
    seenDrift.add(drift.id);
  }
  if (declaration.kind === 'mixin') {
    const actual = resolvedValue(token);
    results.push({ ...declaration, path, expected: declaration.style, actual, status: actual === declaration.style ? 'reconciled-typography-mixin' : 'mismatch' });
    continue;
  }
  const expected = normalize(declaration.raw);
  if (expected.kind === 'unsupported') {
    results.push({ ...declaration, path, status: 'pending-unsupported-source' });
    continue;
  }
  const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
  const matches = token && Object.is(actual, expected.value);
  results.push({
    ...declaration,
    path,
    expected: expected.value,
    actual,
    ...(drift ? { driftId: drift.id } : {}),
    status: drift && token ? 'reconciled-documented-drift' : matches ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
  });
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const unusedDrift = driftManifest.drift.filter((entry) => !seenDrift.has(entry.id));
console.log(`Material Web generic Button overlap audit: current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${current.filter((result) => result.status === 'reconciled-documented-drift').length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (unusedDrift.length) console.error(`Unused generic Button drift: ${unusedDrift.map((entry) => entry.id).join(', ')}`);
if (process.argv.includes('--require-complete') && (pending.length || unusedDrift.length)) process.exitCode = 1;
