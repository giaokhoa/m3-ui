import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const driftManifest = JSON.parse(
  await readFile(new URL('../audit/material-web-button-variant-drift.json', import.meta.url), 'utf8'),
);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-button-filled', 'filled'],
  ['md-comp-button-tonal', 'filledTonal'],
  ['md-comp-button-elevated', 'elevated'],
  ['md-comp-button-outlined', 'outlined'],
  ['md-comp-button-text', 'text'],
].map(([module, variant]) => ({ module, root: `component.button.variant.${variant}` }));
const driftByDeclaration = new Map(
  driftManifest.drift.map((entry) => [`${entry.module}:${entry.variable}`, entry]),
);
const seenDrift = new Set();

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function pathFor(root, variable) {
  const elevation = {
    'container-elevation': 'defaultElevation',
    'disabled-container-elevation': 'disabledElevation',
    'focused-container-elevation': 'focusedElevation',
    'hovered-container-elevation': 'hoveredElevation',
    'pressed-container-elevation': 'pressedElevation',
  }[variable];
  return `${root}.${elevation ?? camel(variable)}`;
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
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$(level\d)$/);
  if (match) return { kind: 'value', value: match[1] };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  return { kind: 'unsupported', value: raw };
}

function declarationsFromSass(text) {
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-button-variant-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of declarationsFromSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const path = pathFor(module.root, declaration.variable);
    const expected = normalize(declaration.raw);
    const token = canonical.get(path);
    const drift = driftByDeclaration.get(`${module.module}:${declaration.variable}`);
    if (drift) {
      if (drift.canonicalPath !== path) {
        throw new Error(`Drift ${drift.id} path mismatch: ${drift.canonicalPath} != ${path}`);
      }
      seenDrift.add(drift.id);
    }
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
    const matches = token && Object.is(actual, expected.value);
    results.push({
      module: module.module,
      ...declaration,
      path,
      expected: expected.value,
      actual,
      ...(drift ? { driftId: drift.id } : {}),
      status: drift && token ? 'reconciled-documented-drift' : matches ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
    });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const unusedDrift = driftManifest.drift.filter((entry) => !seenDrift.has(entry.id));
const deprecated = results.length - current.length;
const documentedDrift = current.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(
  `Material Web Button variant overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${deprecated} documentedDrift=${documentedDrift}`,
);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (unusedDrift.length) console.error(`Unused variant drift: ${unusedDrift.map((entry) => entry.id).join(', ')}`);
if (process.argv.includes('--require-complete') && (pending.length || unusedDrift.length)) process.exitCode = 1;
