import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-fab', 'component.fab.size.baseline'],
  ['md-comp-extended-fab', 'component.fab.extended.baseline'],
  ['md-comp-extended-fab-primary-container', 'component.fab.extended.container.primary'],
  ['md-comp-extended-fab-secondary-container', 'component.fab.extended.container.secondary'],
  ['md-comp-extended-fab-tertiary-container', 'component.fab.extended.container.tertiary'],
  ['md-comp-extended-fab-primary', 'component.fab.extended.variant.primary'],
  ['md-comp-extended-fab-secondary', 'component.fab.extended.variant.secondary'],
  ['md-comp-extended-fab-tertiary', 'component.fab.extended.variant.tertiary'],
  ['md-comp-extended-fab-surface', 'component.fab.extended.surface'],
  ['md-comp-extended-fab-branded', 'component.fab.extended.branded'],
].map(([module, root]) => ({ module, root }));

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function pathFor(module, declaration) {
  if (
    declaration.kind === 'mixin' ||
    /^label-text-(font|line-height|size|tracking|weight)$/.test(declaration.variable)
  ) {
    return `${module.root}.labelTextTypography`;
  }
  return `${module.root}.${camel(declaration.variable)}`;
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
  match = raw.match(/^md-sys-typescale\.\$label-large-(font|line-height|size|tracking|weight)$/);
  if (match) return { kind: 'typography', value: 'labelLarge' };
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
      const body = lines.slice(index + 1, index + 7).join('\n');
      const style = body.match(/@include\s+md-sys-typescale\.([a-z]+-[a-z]+);/)?.[1];
      declarations.push({
        tokenName,
        variable: mixin[1],
        deprecated,
        kind: 'mixin',
        style: style ? camel(style) : 'labelLarge',
      });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-fab-remaining-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const path = pathFor(module, declaration);
    const token = canonical.get(path);
    if (declaration.kind === 'mixin') {
      const actual = resolvedValue(token);
      results.push({
        module: module.module,
        ...declaration,
        path,
        expected: declaration.style,
        actual,
        status: token && actual === declaration.style ? 'reconciled-typography-mixin' : token ? 'mismatch' : 'pending',
      });
      continue;
    }
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    if (expected.kind === 'typography') {
      const actual = resolvedValue(token);
      results.push({
        module: module.module,
        ...declaration,
        path,
        expected: expected.value,
        actual,
        status: token && actual === expected.value ? 'reconciled-typography-decomposition' : token ? 'mismatch' : 'pending',
      });
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
      status: matches ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
    });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web FAB remaining overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
