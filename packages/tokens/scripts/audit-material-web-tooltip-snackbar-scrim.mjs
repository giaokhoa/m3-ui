import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-plain-tooltip', root: 'component.tooltip.plain' },
  { module: 'md-comp-rich-tooltip', root: 'component.tooltip.rich' },
  { module: 'md-comp-snackbar', root: 'component.snackbar' },
  { module: 'md-comp-scrim', root: 'scrim' },
];

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
function resolvedAlias(alias) {
  const match = alias.match(/^\{(.+)\}$/);
  return match ? resolvedValue(canonical.get(match[1])) : alias;
}
function typography(module, variable) {
  const rules = [
    ['md-comp-plain-tooltip', /^supporting-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.tooltip.plain.supportingTextTypography', 'bodySmall'],
    ['md-comp-rich-tooltip', /^action-label-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.tooltip.rich.actionLabelTextTypography', 'labelLarge'],
    ['md-comp-rich-tooltip', /^subhead-(?:font|line-height|size|tracking|weight|type)$/, 'component.tooltip.rich.subheadTypography', 'titleSmall'],
    ['md-comp-rich-tooltip', /^supporting-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.tooltip.rich.supportingTextTypography', 'bodyMedium'],
    ['md-comp-snackbar', /^action-label-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.snackbar.action.labelTypography', 'labelLarge'],
    ['md-comp-snackbar', /^supporting-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.snackbar.supportingText.typography', 'bodyMedium'],
  ];
  for (const [moduleName, pattern, path, expected] of rules) {
    if (module.module === moduleName && pattern.test(variable)) return { path, expected };
  }
  return undefined;
}
function pathFor(module, variable) {
  if (module.module === 'md-comp-snackbar') {
    const mappings = {
      'icon-size': 'component.snackbar.icon.size',
      'with-single-line-container-height': 'component.snackbar.container.singleLineHeight',
      'with-two-lines-container-height': 'component.snackbar.container.twoLinesHeight',
      'action-focus-label-text-color': 'component.snackbar.action.focusLabelTextColor',
      'action-focus-state-layer-color': 'component.snackbar.action.focusStateLayerColor',
      'action-focus-state-layer-opacity': 'component.snackbar.action.focusStateLayerOpacity',
      'action-hover-label-text-color': 'component.snackbar.action.hoverLabelTextColor',
      'action-hover-state-layer-color': 'component.snackbar.action.hoverStateLayerColor',
      'action-hover-state-layer-opacity': 'component.snackbar.action.hoverStateLayerOpacity',
      'action-label-text-color': 'component.snackbar.action.labelTextColor',
      'action-pressed-label-text-color': 'component.snackbar.action.pressedLabelTextColor',
      'action-pressed-state-layer-color': 'component.snackbar.action.pressedStateLayerColor',
      'action-pressed-state-layer-opacity': 'component.snackbar.action.pressedStateLayerOpacity',
      'container-color': 'component.snackbar.container.color',
      'container-elevation': 'component.snackbar.container.elevation',
      'container-shadow-color': 'component.snackbar.container.shadowColor',
      'container-shape': 'component.snackbar.container.shape',
      'icon-color': 'component.snackbar.icon.color',
      'icon-focus-icon-color': 'component.snackbar.icon.focusColor',
      'icon-focus-state-layer-color': 'component.snackbar.icon.focusStateLayerColor',
      'icon-focus-state-layer-opacity': 'component.snackbar.icon.focusStateLayerOpacity',
      'icon-hover-icon-color': 'component.snackbar.icon.hoverColor',
      'icon-hover-state-layer-color': 'component.snackbar.icon.hoverStateLayerColor',
      'icon-hover-state-layer-opacity': 'component.snackbar.icon.hoverStateLayerOpacity',
      'icon-pressed-icon-color': 'component.snackbar.icon.pressedColor',
      'icon-pressed-state-layer-color': 'component.snackbar.icon.pressedStateLayerColor',
      'icon-pressed-state-layer-opacity': 'component.snackbar.icon.pressedStateLayerOpacity',
      'supporting-text-color': 'component.snackbar.supportingText.color',
    };
    return mappings[variable];
  }
  return `${module.root}.${camel(variable)}`;
}
function normalize(module, variable, raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) {
    if (module.module === 'md-comp-scrim' && variable === 'container-color' && match[1] === 'scrim') {
      return { kind: 'canonical-alias', value: '{color.role.scrim}' };
    }
    return { kind: 'value', value: `var(--${match[1]})` };
  }
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-tooltip-snackbar-scrim-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const semanticTypography = typography(module, declaration.variable);
    if (semanticTypography) {
      const actual = canonicalValue(canonical.get(semanticTypography.path));
      results.push({ module: module.module, ...declaration, path: semanticTypography.path, expected: semanticTypography.expected, actual, status: actual === semanticTypography.expected ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = pathFor(module, declaration.variable);
    if (!path) {
      results.push({ module: module.module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
    const expected = normalize(module, declaration.variable, declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    let expectedValue;
    let actual;
    if (expected.kind === 'canonical-alias') {
      expectedValue = expected.value;
      actual = canonicalValue(token);
    } else if (expected.kind === 'alias') {
      expectedValue = resolvedAlias(expected.value);
      actual = resolvedValue(token);
    } else {
      expectedValue = expected.value;
      actual = resolvedValue(token);
    }
    results.push({ module: module.module, ...declaration, path, expected: expectedValue, actual, status: token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Tooltip/Snackbar/Scrim audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
