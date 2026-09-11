import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-nav-bar', kind: 'bar' },
  { module: 'md-comp-nav-bar-item-horizontal', kind: 'barHorizontal' },
  { module: 'md-comp-nav-bar-item-vertical', kind: 'barVertical' },
  { module: 'md-comp-nav-rail', kind: 'rail' },
  { module: 'md-comp-nav-rail-collapsed', kind: 'railCollapsed' },
  { module: 'md-comp-nav-rail-expanded', kind: 'railExpanded' },
  { module: 'md-comp-nav-rail-item', kind: 'railItem' },
  { module: 'md-comp-nav-rail-item-horizontal', kind: 'railHorizontal' },
  { module: 'md-comp-nav-rail-item-vertical', kind: 'railVertical' },
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
function pathFor(module, variable) {
  const maps = {
    bar: {
      'container-height': 'component.navigation.bar.containerHeight',
      'item-active-indicator-icon-label-space': 'component.navigation.bar.itemActiveIndicatorIconLabelSpace',
      'item-between-space': 'component.navigation.bar.itemBetweenSpace',
      'item-icon-size': 'component.navigation.bar.itemIconSize',
      'container-color': 'component.navigation.bar.containerColor',
      'container-elevation': 'component.navigation.bar.containerElevation',
      'container-shadow-color': 'component.navigation.bar.containerShadowColor',
      'container-shape': 'component.navigation.bar.navShape',
      'item-active-indicator-shape': 'component.navigation.bar.itemActiveIndicatorShape',
      'item-active-focused-state-layer-color': 'component.navigation.bar.itemActiveFocusedStateLayerColor',
      'item-active-focused-state-layer-opacity': 'component.navigation.bar.itemActiveFocusedStateLayerOpacity',
      'item-active-hovered-state-layer-color': 'component.navigation.bar.itemActiveHoveredStateLayerColor',
      'item-active-hovered-state-layer-opacity': 'component.navigation.bar.itemActiveHoveredStateLayerOpacity',
      'item-active-icon-color': 'component.navigation.bar.itemActiveIconColor',
      'item-active-indicator-color': 'component.navigation.bar.itemActiveIndicatorColor',
      'item-active-label-text-color': 'component.navigation.bar.itemActiveLabelTextColor',
      'item-active-pressed-state-layer-color': 'component.navigation.bar.itemActivePressedStateLayerColor',
      'item-active-pressed-state-layer-opacity': 'component.navigation.bar.itemActivePressedStateLayerOpacity',
      'item-inactive-focused-state-layer-color': 'component.navigation.bar.itemInactiveFocusedStateLayerColor',
      'item-inactive-hovered-state-layer-color': 'component.navigation.bar.itemInactiveHoveredStateLayerColor',
      'item-inactive-icon-color': 'component.navigation.bar.itemInactiveIconColor',
      'item-inactive-label-text-color': 'component.navigation.bar.itemInactiveLabelTextColor',
      'item-inactive-pressed-state-layer-color': 'component.navigation.bar.itemInactivePressedStateLayerColor',
    },
    barHorizontal: {
      'active-indicator-height': 'component.navigation.bar.horizontalItem.activeIndicatorHeight',
      'active-indicator-icon-label-space': 'component.navigation.bar.itemActiveIndicatorIconLabelSpace',
      'active-indicator-leading-space': 'component.navigation.bar.horizontalItem.activeIndicatorLeadingSpace',
      'active-indicator-trailing-space': 'component.navigation.bar.horizontalItem.activeIndicatorTrailingSpace',
      'label-text-font': 'component.navigation.bar.labelTextTypography',
    },
    barVertical: {
      'active-indicator-height': 'component.navigation.bar.verticalItem.activeIndicatorHeight',
      'active-indicator-icon-label-space': 'component.navigation.bar.itemActiveIndicatorIconLabelSpace',
      'active-indicator-width': 'component.navigation.bar.verticalItem.activeIndicatorWidth',
      'container-between-space': 'component.navigation.bar.verticalItem.containerBetweenSpace',
      'label-text-font': 'component.navigation.bar.labelTextTypography',
    },
    rail: {
      'item-active-focused-state-layer-color': 'component.navigation.rail.color.itemActiveFocusedStateLayer',
      'item-active-focused-state-layer-opacity': 'component.navigation.rail.state.itemActiveFocusedStateLayerOpacity',
      'item-active-hovered-state-layer-color': 'component.navigation.rail.color.itemActiveHoveredStateLayer',
      'item-active-hovered-state-layer-opacity': 'component.navigation.rail.state.itemActiveHoveredStateLayerOpacity',
      'item-active-icon-color': 'component.navigation.rail.color.itemActiveIcon',
      'item-active-indicator-color': 'component.navigation.rail.color.itemActiveIndicator',
      'item-active-label-text-color': 'component.navigation.rail.color.itemActiveLabelText',
      'item-active-pressed-state-layer-color': 'component.navigation.rail.color.itemActivePressedStateLayer',
      'item-active-pressed-state-layer-opacity': 'component.navigation.rail.state.itemActivePressedStateLayerOpacity',
      'item-inactive-focused-state-layer-color': 'component.navigation.rail.color.itemInactiveFocusedStateLayer',
      'item-inactive-hovered-state-layer-color': 'component.navigation.rail.color.itemInactiveHoveredStateLayer',
      'item-inactive-icon-color': 'component.navigation.rail.color.itemInactiveIcon',
      'item-inactive-label-text-color': 'component.navigation.rail.color.itemInactiveLabelText',
      'item-inactive-pressed-state-layer-color': 'component.navigation.rail.color.itemInactivePressedStateLayer',
    },
    railCollapsed: {
      'container-width': 'component.navigation.rail.collapsed.containerWidth',
      'item-vertical-space': 'component.navigation.rail.collapsed.itemVerticalSpace',
      'narrow-container-width': 'component.navigation.rail.collapsed.narrowContainerWidth',
      'top-space': 'component.navigation.rail.collapsed.topSpace',
      'container-color': 'component.navigation.rail.collapsed.containerColor',
      'container-elevation': 'component.navigation.rail.collapsed.containerElevation',
      'container-shape': 'component.navigation.rail.collapsed.containerShape',
    },
    railExpanded: {
      'container-width-maximum': 'component.navigation.rail.expanded.containerWidthMaximum',
      'container-width-minimum': 'component.navigation.rail.expanded.containerWidthMinimum',
      'top-space': 'component.navigation.rail.expanded.topSpace',
      'container-color': 'component.navigation.rail.expanded.containerColor',
      'container-elevation': 'component.navigation.rail.expanded.containerElevation',
      'container-shape': 'component.navigation.rail.expanded.containerShape',
      'modal-container-color': 'component.navigation.rail.expanded.modalContainerColor',
      'modal-container-elevation': 'component.navigation.rail.expanded.modalContainerElevation',
      'modal-container-shape': 'component.navigation.rail.expanded.modalContainerShape',
    },
    railItem: {
      'active-indicator-icon-label-space': 'component.navigation.rail.baselineItem.activeIndicatorIconLabelSpace',
      'active-indicator-leading-space': 'component.navigation.rail.baselineItem.activeIndicatorLeadingSpace',
      'active-indicator-trailing-space': 'component.navigation.rail.baselineItem.activeIndicatorTrailingSpace',
      'container-height': 'component.navigation.rail.baselineItem.containerHeight',
      'container-vertical-space': 'component.navigation.rail.baselineItem.containerVerticalSpace',
      'header-space-minimum': 'component.navigation.rail.baselineItem.headerSpaceMinimum',
      'icon-size': 'component.navigation.rail.baselineItem.iconSize',
      'short-container-height': 'component.navigation.rail.baselineItem.shortContainerHeight',
      'active-indicator-shape': 'component.navigation.rail.baselineItem.activeIndicatorShape',
      'container-shape': 'component.navigation.rail.baselineItem.containerShape',
    },
    railHorizontal: {
      'active-indicator-height': 'component.navigation.rail.horizontalItem.activeIndicatorHeight',
      'full-width-leading-space': 'component.navigation.rail.horizontalItem.fullWidthLeadingSpace',
      'full-width-trailing-space': 'component.navigation.rail.horizontalItem.fullWidthTrailingSpace',
      'icon-label-space': 'component.navigation.rail.horizontalItem.iconLabelSpace',
      'label-text-font': 'component.navigation.rail.horizontalItem.labelTextTypography',
    },
    railVertical: {
      'active-indicator-height': 'component.navigation.rail.verticalItem.activeIndicatorHeight',
      'active-indicator-width': 'component.navigation.rail.verticalItem.activeIndicatorWidth',
      'icon-label-space': 'component.navigation.rail.verticalItem.iconLabelSpace',
      'leading-space': 'component.navigation.rail.verticalItem.leadingSpace',
      'trailing-space': 'component.navigation.rail.verticalItem.trailingSpace',
      'label-text-font': 'component.navigation.rail.verticalItem.labelTextTypography',
    },
  };
  return maps[module.kind]?.[variable];
}
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
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
  match = raw.match(/^md-sys-typescale\.([a-z0-9-]+)$/);
  if (match) {
    const name = match[1].replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
    return { kind: 'value', value: name };
  }
  return { kind: 'unsupported', value: raw };
}
function parseSass(text) {
  const declarations = [];
  const lines = text.split(/\r?\n/);
  let tokenName;
  let deprecated = false;
  let mixin;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const token = line.match(/^\/\/\/\s+(md\.[^\s(]+)/);
    if (token) {
      tokenName = token[1];
      deprecated = false;
      mixin = undefined;
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
    const mixinStart = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixinStart) {
      mixin = mixinStart[1];
      continue;
    }
    const include = line.match(/^@include\s+md-sys-typescale\.([a-z0-9-]+);$/);
    if (tokenName && mixin && include) {
      declarations.push({ tokenName, variable: mixin, raw: `md-sys-typescale.${include[1]}`, deprecated });
      tokenName = undefined;
      deprecated = false;
      mixin = undefined;
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-navigation-expressive-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
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
console.log(`Material Web expressive Navigation overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
