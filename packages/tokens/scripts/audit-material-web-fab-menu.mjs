import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const drift = JSON.parse(await readFile(resolve(scriptDir, '../audit/material-web-fab-menu-drift.json'), 'utf8'));
const driftIds = new Set(drift.records.map((record) => record.id));
const modules = [
  'md-comp-fab-menu',
  'md-comp-fab-menu-primary-close-button',
  'md-comp-fab-menu-primary-container',
  'md-comp-fab-menu-secondary-close-button',
  'md-comp-fab-menu-secondary-container',
  'md-comp-fab-menu-tertiary-close-button',
  'md-comp-fab-menu-tertiary-container',
];

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
  if (match) return { kind: 'value', value: match[1].replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
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

const rootPaths = {
  'close-button-between-space': 'component.fabMenu.closeButton.betweenSpace',
  'close-button-container-height': 'component.fabMenu.closeButton.containerHeight',
  'close-button-container-width': 'component.fabMenu.closeButton.containerWidth',
  'close-button-icon-size': 'component.fabMenu.closeButton.iconSize',
  'menu-item-between-space': 'component.fabMenu.listItem.betweenSpace',
  'menu-item-container-height': 'component.fabMenu.listItem.containerHeight',
  'menu-item-icon-label-space': 'component.fabMenu.listItem.iconLabelSpace',
  'menu-item-icon-size': 'component.fabMenu.listItem.iconSize',
  'menu-item-leading-space': 'component.fabMenu.listItem.leadingSpace',
  'menu-item-trailing-space': 'component.fabMenu.listItem.trailingSpace',
  'close-button-container-elevation': 'component.fabMenu.closeButton.containerElevation',
  'close-button-container-shape': 'component.fabMenu.closeButton.containerShape',
  'menu-item-container-elevation': 'component.fabMenu.listItem.webContainerElevation',
  'menu-item-container-shape': 'component.fabMenu.listItem.containerShape',
  'menu-item-label-text': 'component.fabMenu.listItem.labelTypography',
};

function closeRole(module) {
  const match = module.match(/^md-comp-fab-menu-(primary|secondary|tertiary)-close-button$/);
  return match?.[1];
}

function containerRole(module) {
  const match = module.match(/^md-comp-fab-menu-(primary|secondary|tertiary)-container$/);
  return match ? `${match[1]}Container` : undefined;
}

function closePath(role, variable) {
  const root = `component.fabMenu.closeButton.role.${role}`;
  if (variable === 'container-color') return `${root}.containerColor`;
  if (variable === 'container-shadow-color') return `${root}.containerShadowColor`;
  if (variable === 'focused-container-elevation') return `${root}.focusedElevation`;
  if (variable === 'hovered-container-elevation') return `${root}.hoveredElevation`;
  if (variable === 'pressed-container-elevation') return `${root}.pressedElevation`;
  if (variable === 'icon-color' || /^(?:focused|hovered|pressed)-(?:icon-color|state-layer-color)$/.test(variable)) return `${root}.contentColor`;
  if (variable === 'focused-state-layer-opacity') return 'state.layer.opacity.focus';
  if (variable === 'hovered-state-layer-opacity') return 'state.layer.opacity.hover';
  if (variable === 'pressed-state-layer-opacity') return 'state.layer.opacity.pressed';
}

function containerPath(role, variable) {
  const root = `component.fabMenu.listItem.role.${role}`;
  if (variable === 'list-item-container-color') return `${root}.containerColor`;
  if (variable === 'list-item-container-shadow-color') return `${root}.containerShadowColor`;
  if (variable === 'list-item-focused-container-elevation') return `${root}.focusedElevation`;
  if (variable === 'list-item-hovered-container-elevation') return `${root}.hoveredElevation`;
  if (variable === 'list-item-pressed-container-elevation') return `${root}.pressedElevation`;
  if (variable === 'list-item-icon-color' || variable === 'list-item-label-text-color' || /^list-item-(?:focused|hovered|pressed)-(?:icon-color|label-text-color|state-layer-color)$/.test(variable)) return `${root}.contentColor`;
  if (variable === 'list-item-focused-state-layer-opacity') return 'state.layer.opacity.focus';
  if (variable === 'list-item-hovered-state-layer-opacity') return 'state.layer.opacity.hover';
  if (variable === 'list-item-pressed-state-layer-opacity') return 'state.layer.opacity.pressed';
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-fab-menu-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    let path;
    if (module === 'md-comp-fab-menu') path = rootPaths[declaration.variable];
    else if (closeRole(module)) path = closePath(closeRole(module), declaration.variable);
    else if (containerRole(module)) path = containerPath(containerRole(module), declaration.variable);

    if (!path) {
      results.push({ module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }

    if (module === 'md-comp-fab-menu' && declaration.variable === 'menu-item-label-text') {
      const actual = canonicalValue(canonical.get(path));
      results.push({ module, ...declaration, path, expected: 'titleMedium', actual, status: actual === 'titleMedium' ? 'reconciled-semantic-reference' : 'mismatch' });
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

    if (module === 'md-comp-fab-menu' && declaration.variable === 'menu-item-container-elevation') {
      const driftId = 'fab-menu-list-item-container-elevation';
      status = driftIds.has(driftId) && token && Object.is(actual, expectedValue) ? 'reconciled-documented-drift' : 'mismatch';
      results.push({ module, ...declaration, path, expected: expectedValue, actual, driftId, status });
      continue;
    }

    results.push({ module, ...declaration, path, expected: expectedValue, actual, status });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(`Material Web FAB Menu overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length} documentedDrift=${documentedDrift}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
