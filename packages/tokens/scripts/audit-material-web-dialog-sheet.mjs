import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-dialog', root: 'component.dialog' },
  { module: 'md-comp-full-screen-dialog', root: 'component.fullScreenDialog' },
  { module: 'md-comp-sheet-bottom', root: 'component.sheetBottom' },
  { module: 'md-comp-sheet-floating', root: 'component.sheetFloating' },
  { module: 'md-comp-sheet-side', root: 'component.sheetSide' },
];

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
function resolvedAlias(alias) {
  const match = alias.match(/^\{(.+)\}$/);
  return match ? resolvedValue(canonical.get(match[1])) : alias;
}
function semanticTypography(module, variable) {
  const rules = [
    ['md-comp-dialog', /^action-label-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.dialog.actionLabelTextFont', 'labelLarge'],
    ['md-comp-dialog', /^headline-(?:font|line-height|size|tracking|weight|type)$/, 'component.dialog.headlineFont', 'headlineSmall'],
    ['md-comp-dialog', /^supporting-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.dialog.supportingTextFont', 'bodyMedium'],
    ['md-comp-full-screen-dialog', /^header-action-label-text-(?:font|line-height|size|tracking|weight|type)$/, 'component.fullScreenDialog.headerActionLabelTextFont', 'labelLarge'],
    ['md-comp-full-screen-dialog', /^header-headline-(?:font|line-height|size|tracking|weight|type)$/, 'component.fullScreenDialog.headerHeadlineFont', 'titleLarge'],
    ['md-comp-sheet-side', /^docked-headline-(?:font|line-height|size|tracking|weight|type)$/, 'component.sheetSide.dockedHeadlineFont', 'titleLarge'],
  ];
  for (const [moduleName, pattern, path, expected] of rules) {
    if (module.module === moduleName && pattern.test(variable)) return { path, expected };
  }
  return undefined;
}
function pathFor(module, variable) {
  const special = {
    'md-comp-dialog': {
      'with-icon-icon-size': 'component.dialog.iconSize',
      'with-icon-icon-color': 'component.dialog.iconColor',
    },
  };
  return special[module.module]?.[variable] ?? `${module.root}.${camel(variable)}`;
}
function normalize(raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  match = raw.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}%` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$level(\d+)$/);
  if (match) return { kind: 'value', value: `level${match[1]}` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'alias', value: `{state.focusIndicator.${camel(match[1])}}` };
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-dialog-sheet-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const typography = semanticTypography(module, declaration.variable);
    if (typography) {
      const actual = canonicalValue(canonical.get(typography.path));
      results.push({ module: module.module, ...declaration, path: typography.path, expected: typography.expected, actual, status: actual === typography.expected ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = pathFor(module, declaration.variable);
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const expectedValue = expected.kind === 'alias' ? resolvedAlias(expected.value) : expected.value;
    const actual = resolvedValue(token);
    results.push({ module: module.module, ...declaration, path, expected: expectedValue, actual, status: token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Dialog/Sheet overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
