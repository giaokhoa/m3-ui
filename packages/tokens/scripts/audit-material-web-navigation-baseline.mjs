import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-navigation-bar', kind: 'bar' },
  { module: 'md-comp-navigation-rail', kind: 'rail' },
  { module: 'md-comp-navigation-drawer', kind: 'drawer' },
  { module: 'md-comp-primary-navigation-tab', kind: 'primaryTab' },
  { module: 'md-comp-secondary-navigation-tab', kind: 'secondaryTab' },
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
function semanticTypography(module, variable) {
  const rules = {
    bar: [
      [/^(label-text-(font|line-height|size|tracking|weight)|label-text-type)$/, 'component.navigation.bar.baseline.labelTextTypography', 'labelMedium'],
    ],
    rail: [
      [/^(label-text-(font|line-height|size|tracking|weight)|label-text-type)$/, 'component.navigation.rail.baseline.labelTextTypography', 'labelMedium'],
    ],
    drawer: [
      [/^(headline-(font|line-height|size|tracking|weight)|headline-type)$/, 'component.navigation.drawer.headlineTypography', 'titleSmall'],
      [/^(label-text-(font|line-height|size|tracking|weight)|label-text-type)$/, 'component.navigation.drawer.labelTextTypography', 'labelLarge'],
      [/^(large-badge-label-(font|line-height|size|tracking|weight)|large-badge-label-type)$/, 'component.navigation.drawer.largeBadgeLabelTypography', 'labelLarge'],
    ],
    primaryTab: [
      [/^(with-label-text-label-text-(font|line-height|size|tracking|weight)|with-label-text-label-text-type)$/, 'component.navigation.tab.primary.labelTextTypography', 'titleSmall'],
    ],
    secondaryTab: [
      [/^(label-text-(font|line-height|size|tracking|weight)|label-text-type)$/, 'component.navigation.tab.secondary.labelTextTypography', 'titleSmall'],
    ],
  };
  for (const [pattern, path, expected] of rules[module.kind] ?? []) {
    if (pattern.test(variable)) return { path, expected };
  }
  return undefined;
}
function pathFor(module, variable) {
  const maps = {
    bar: {
      'active-indicator-height': 'activeIndicatorHeight',
      'active-indicator-width': 'activeIndicatorWidth',
      'container-height': 'containerHeight',
      'icon-size': 'iconSize',
      'active-indicator-color': 'activeIndicatorColor',
      'active-indicator-shape': 'activeIndicatorShape',
      'active-focus-icon-color': 'activeFocusIconColor',
      'active-focus-label-text-color': 'activeFocusLabelTextColor',
      'active-focus-state-layer-color': 'activeFocusStateLayerColor',
      'active-hover-icon-color': 'activeHoverIconColor',
      'active-hover-label-text-color': 'activeHoverLabelTextColor',
      'active-hover-state-layer-color': 'activeHoverStateLayerColor',
      'active-icon-color': 'activeIconColor',
      'active-label-text-color': 'activeLabelTextColor',
      'active-label-text-weight': 'activeLabelTextWeight',
      'active-pressed-icon-color': 'activePressedIconColor',
      'active-pressed-label-text-color': 'activePressedLabelTextColor',
      'active-pressed-state-layer-color': 'activePressedStateLayerColor',
      'container-color': 'containerColor',
      'container-elevation': 'containerElevation',
      'container-shape': 'containerShape',
      'focus-indicator-color': 'focusIndicatorColor',
      'focus-indicator-outline-offset': 'focusIndicatorOutlineOffset',
      'focus-indicator-thickness': 'focusIndicatorThickness',
      'focus-state-layer-opacity': 'focusStateLayerOpacity',
      'hover-state-layer-opacity': 'hoverStateLayerOpacity',
      'inactive-focus-icon-color': 'inactiveFocusIconColor',
      'inactive-focus-label-text-color': 'inactiveFocusLabelTextColor',
      'inactive-focus-state-layer-color': 'inactiveFocusStateLayerColor',
      'inactive-hover-icon-color': 'inactiveHoverIconColor',
      'inactive-hover-label-text-color': 'inactiveHoverLabelTextColor',
      'inactive-hover-state-layer-color': 'inactiveHoverStateLayerColor',
      'inactive-icon-color': 'inactiveIconColor',
      'inactive-label-text-color': 'inactiveLabelTextColor',
      'inactive-pressed-icon-color': 'inactivePressedIconColor',
      'inactive-pressed-label-text-color': 'inactivePressedLabelTextColor',
      'inactive-pressed-state-layer-color': 'inactivePressedStateLayerColor',
      'pressed-state-layer-opacity': 'pressedStateLayerOpacity',
    },
    rail: {
      'active-indicator-height': 'activeIndicatorHeight',
      'active-indicator-width': 'activeIndicatorWidth',
      'container-width': 'containerWidth',
      'icon-size': 'iconSize',
      'no-label-active-indicator-height': 'noLabelActiveIndicatorHeight',
      'active-indicator-color': 'activeIndicatorColor',
      'active-indicator-shape': 'activeIndicatorShape',
      'active-focus-icon-color': 'activeFocusIconColor',
      'active-focus-label-text-color': 'activeFocusLabelTextColor',
      'active-focus-state-layer-color': 'activeFocusStateLayerColor',
      'active-hover-icon-color': 'activeHoverIconColor',
      'active-hover-label-text-color': 'activeHoverLabelTextColor',
      'active-hover-state-layer-color': 'activeHoverStateLayerColor',
      'active-icon-color': 'activeIconColor',
      'active-label-text-color': 'activeLabelTextColor',
      'active-label-text-weight': 'activeLabelTextWeight',
      'active-pressed-icon-color': 'activePressedIconColor',
      'active-pressed-label-text-color': 'activePressedLabelTextColor',
      'active-pressed-state-layer-color': 'activePressedStateLayerColor',
      'container-color': 'containerColor',
      'container-elevation': 'containerElevation',
      'container-shape': 'containerShape',
      'focus-state-layer-opacity': 'focusStateLayerOpacity',
      'hover-state-layer-opacity': 'hoverStateLayerOpacity',
      'inactive-focus-icon-color': 'inactiveFocusIconColor',
      'inactive-focus-label-text-color': 'inactiveFocusLabelTextColor',
      'inactive-focus-state-layer-color': 'inactiveFocusStateLayerColor',
      'inactive-hover-icon-color': 'inactiveHoverIconColor',
      'inactive-hover-label-text-color': 'inactiveHoverLabelTextColor',
      'inactive-hover-state-layer-color': 'inactiveHoverStateLayerColor',
      'inactive-icon-color': 'inactiveIconColor',
      'inactive-label-text-color': 'inactiveLabelTextColor',
      'inactive-pressed-icon-color': 'inactivePressedIconColor',
      'inactive-pressed-label-text-color': 'inactivePressedLabelTextColor',
      'inactive-pressed-state-layer-color': 'inactivePressedStateLayerColor',
      'no-label-active-indicator-shape': 'noLabelActiveIndicatorShape',
      'pressed-state-layer-opacity': 'pressedStateLayerOpacity',
    },
    drawer: {
      'active-indicator-height': 'activeIndicatorHeight',
      'active-indicator-width': 'activeIndicatorWidth',
      'container-height': 'containerHeightPercent',
      'container-width': 'containerWidth',
      'icon-size': 'iconSize',
      'active-indicator-color': 'activeIndicatorColor',
      'active-indicator-shape': 'activeIndicatorShape',
      'active-focus-icon-color': 'activeFocusIconColor',
      'active-focus-label-text-color': 'activeFocusLabelTextColor',
      'active-focus-state-layer-color': 'activeFocusStateLayerColor',
      'active-hover-icon-color': 'activeHoverIconColor',
      'active-hover-label-text-color': 'activeHoverLabelTextColor',
      'active-hover-state-layer-color': 'activeHoverStateLayerColor',
      'active-icon-color': 'activeIconColor',
      'active-label-text-color': 'activeLabelTextColor',
      'active-label-text-weight': 'activeLabelTextWeight',
      'active-pressed-icon-color': 'activePressedIconColor',
      'active-pressed-label-text-color': 'activePressedLabelTextColor',
      'active-pressed-state-layer-color': 'activePressedStateLayerColor',
      'bottom-container-shape': 'bottomContainerShape',
      'container-shape': 'containerShape',
      'focus-indicator-color': 'focusIndicatorColor',
      'focus-indicator-outline-offset': 'focusIndicatorOutlineOffset',
      'focus-indicator-thickness': 'focusIndicatorThickness',
      'focus-state-layer-opacity': 'focusStateLayerOpacity',
      'headline-color': 'headlineColor',
      'hover-state-layer-opacity': 'hoverStateLayerOpacity',
      'inactive-focus-icon-color': 'inactiveFocusIconColor',
      'inactive-focus-label-text-color': 'inactiveFocusLabelTextColor',
      'inactive-focus-state-layer-color': 'inactiveFocusStateLayerColor',
      'inactive-hover-icon-color': 'inactiveHoverIconColor',
      'inactive-hover-label-text-color': 'inactiveHoverLabelTextColor',
      'inactive-hover-state-layer-color': 'inactiveHoverStateLayerColor',
      'inactive-icon-color': 'inactiveIconColor',
      'inactive-label-text-color': 'inactiveLabelTextColor',
      'inactive-pressed-icon-color': 'inactivePressedIconColor',
      'inactive-pressed-label-text-color': 'inactivePressedLabelTextColor',
      'inactive-pressed-state-layer-color': 'inactivePressedStateLayerColor',
      'large-badge-label-color': 'largeBadgeLabelColor',
      'modal-container-color': 'modalContainerColor',
      'modal-container-elevation': 'modalContainerElevation',
      'pressed-state-layer-opacity': 'pressedStateLayerOpacity',
      'standard-container-color': 'standardContainerColor',
      'standard-container-elevation': 'standardContainerElevation',
    },
    primaryTab: {
      'active-indicator-height': 'activeIndicatorHeight',
      'active-indicator-shape': 'webActiveIndicatorShape',
      'container-height': 'containerHeight',
      'with-icon-and-label-text-container-height': 'iconAndLabelTextContainerHeight',
      'with-icon-icon-size': 'iconSize',
      'active-indicator-color': 'activeIndicatorColor',
      'active-focus-state-layer-color': 'activeFocusStateLayerColor',
      'active-focus-state-layer-opacity': 'activeFocusStateLayerOpacity',
      'active-hover-state-layer-color': 'activeHoverStateLayerColor',
      'active-hover-state-layer-opacity': 'activeHoverStateLayerOpacity',
      'active-pressed-state-layer-color': 'activePressedStateLayerColor',
      'active-pressed-state-layer-opacity': 'activePressedStateLayerOpacity',
      'container-color': 'containerColor',
      'container-elevation': 'containerElevation',
      'container-shape': 'containerShape',
      'focus-indicator-color': 'focusIndicatorColor',
      'focus-indicator-outline-offset': 'focusIndicatorOutlineOffset',
      'focus-indicator-thickness': 'focusIndicatorThickness',
      'inactive-focus-state-layer-color': 'inactiveFocusStateLayerColor',
      'inactive-focus-state-layer-opacity': 'inactiveFocusStateLayerOpacity',
      'inactive-hover-state-layer-color': 'inactiveHoverStateLayerColor',
      'inactive-hover-state-layer-opacity': 'inactiveHoverStateLayerOpacity',
      'inactive-pressed-state-layer-color': 'inactivePressedStateLayerColor',
      'inactive-pressed-state-layer-opacity': 'inactivePressedStateLayerOpacity',
      'with-icon-active-focus-icon-color': 'activeFocusIconColor',
      'with-icon-active-hover-icon-color': 'activeHoverIconColor',
      'with-icon-active-icon-color': 'activeIconColor',
      'with-icon-active-pressed-icon-color': 'activePressedIconColor',
      'with-icon-inactive-focus-icon-color': 'inactiveFocusIconColor',
      'with-icon-inactive-hover-icon-color': 'inactiveHoverIconColor',
      'with-icon-inactive-icon-color': 'inactiveIconColor',
      'with-icon-inactive-pressed-icon-color': 'inactivePressedIconColor',
      'with-label-text-active-focus-label-text-color': 'activeFocusLabelTextColor',
      'with-label-text-active-hover-label-text-color': 'activeHoverLabelTextColor',
      'with-label-text-active-label-text-color': 'activeLabelTextColor',
      'with-label-text-active-pressed-label-text-color': 'activePressedLabelTextColor',
      'with-label-text-inactive-focus-label-text-color': 'inactiveFocusLabelTextColor',
      'with-label-text-inactive-hover-label-text-color': 'inactiveHoverLabelTextColor',
      'with-label-text-inactive-label-text-color': 'inactiveLabelTextColor',
      'with-label-text-inactive-pressed-label-text-color': 'inactivePressedLabelTextColor',
    },
    secondaryTab: {
      'active-indicator-height': 'activeIndicatorHeight',
      'container-height': 'containerHeight',
      'with-icon-icon-size': 'iconSize',
      'active-indicator-color': 'activeIndicatorColor',
      'active-label-text-color': 'activeLabelTextColor',
      'container-color': 'containerColor',
      'container-elevation': 'containerElevation',
      'container-shadow-color': 'containerShadowColor',
      'container-shape': 'containerShape',
      'focus-indicator-color': 'focusIndicatorColor',
      'focus-indicator-outline-offset': 'focusIndicatorOutlineOffset',
      'focus-indicator-thickness': 'focusIndicatorThickness',
      'focus-label-text-color': 'focusLabelTextColor',
      'focus-state-layer-color': 'focusStateLayerColor',
      'focus-state-layer-opacity': 'focusStateLayerOpacity',
      'hover-label-text-color': 'hoverLabelTextColor',
      'hover-state-layer-color': 'hoverStateLayerColor',
      'hover-state-layer-opacity': 'hoverStateLayerOpacity',
      'inactive-label-text-color': 'inactiveLabelTextColor',
      'pressed-label-text-color': 'pressedLabelTextColor',
      'pressed-state-layer-color': 'pressedStateLayerColor',
      'pressed-state-layer-opacity': 'pressedStateLayerOpacity',
      'with-icon-active-icon-color': 'activeIconColor',
      'with-icon-focus-icon-color': 'focusIconColor',
      'with-icon-hover-icon-color': 'hoverIconColor',
      'with-icon-inactive-icon-color': 'inactiveIconColor',
      'with-icon-pressed-icon-color': 'pressedIconColor',
    },
  };
  const name = maps[module.kind]?.[variable];
  if (!name) return undefined;
  const root = {
    bar: 'component.navigation.bar.baseline',
    rail: 'component.navigation.rail.baseline',
    drawer: 'component.navigation.drawer',
    primaryTab: 'component.navigation.tab.primary',
    secondaryTab: 'component.navigation.tab.secondary',
  }[module.kind];
  return `${root}.${name}`;
}
function normalize(raw) {
  if (raw === '3px 3px 0px 0px') return { kind: 'value', value: raw };
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  const percent = raw.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percent) return { kind: 'value', value: Number(percent[1]) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$level(\d+)$/);
  if (match) return { kind: 'value', value: `level${match[1]}` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) {
    const name = match[1].replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
    return { kind: 'value', value: name };
  }
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(inner-offset|thickness)$/);
  if (match) {
    const property = match[1] === 'inner-offset' ? 'innerOffset' : 'thickness';
    return { kind: 'alias', value: `{state.focusIndicator.${property}}` };
  }
  match = raw.match(/^md-sys-typescale\.\$label-(medium|large)-weight-prominent$/);
  if (match) return { kind: 'alias', value: '{typeface.weight.bold}' };
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-navigation-baseline-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const semantic = semanticTypography(module, declaration.variable);
    if (semantic) {
      const actual = canonicalValue(canonical.get(semantic.path));
      results.push({
        module: module.module,
        ...declaration,
        path: semantic.path,
        expected: semantic.expected,
        actual,
        status: Object.is(actual, semantic.expected) ? 'reconciled-semantic-reference' : actual === undefined ? 'pending' : 'mismatch',
      });
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
    results.push({
      module: module.module,
      ...declaration,
      path,
      expected: expected.value,
      actual,
      status: token && Object.is(actual, expected.value) ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
    });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web baseline Navigation overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=1`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
