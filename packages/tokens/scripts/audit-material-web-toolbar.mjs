import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-toolbar-docked', root: 'component.toolbar.docked' },
  { module: 'md-comp-toolbar-floating', root: 'component.toolbar.floating' },
  { module: 'md-comp-toolbar-floating-fab', root: 'component.toolbar.floatingFab' },
  { module: 'md-comp-toolbar-standard', root: 'component.toolbar.standard' },
  { module: 'md-comp-toolbar-vibrant', root: 'component.toolbar.vibrant' },
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
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-toolbar-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const path = `${module.root}.${camel(declaration.variable)}`;
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
console.log(`Material Web Toolbar overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
