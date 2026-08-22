import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-fab-small', 'component.fab.size.small'],
  ['md-comp-fab-medium', 'component.fab.size.medium'],
  ['md-comp-fab-large', 'component.fab.size.large'],
  ['md-comp-extended-fab-small', 'component.fab.extended.size.small'],
  ['md-comp-extended-fab-medium', 'component.fab.extended.size.medium'],
  ['md-comp-extended-fab-large', 'component.fab.extended.size.large'],
].map(([module, root]) => ({ module, root }));

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
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  const shape = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (shape) return { kind: 'value', value: camel(shape[1]) };
  return { kind: 'unsupported', value: raw };
}
function parseSass(text) {
  const declarations = [];
  const lines = text.split(/\r?\n/);
  let tokenName;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const token = line.match(/^\/\/\/\s+(md\.[^\s(]+)/);
    if (token) {
      tokenName = token[1];
      continue;
    }
    const variable = line.match(/^\$([a-z0-9-]+):\s*(.+);$/);
    if (tokenName && variable) {
      declarations.push({ tokenName, variable: variable[1], raw: variable[2].trim(), kind: 'variable' });
      tokenName = undefined;
      continue;
    }
    const mixin = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixin) {
      const body = lines.slice(index + 1, index + 5).join('\n');
      const style = body.match(/@include\s+md-sys-typescale\.([a-z]+-[a-z]+);/)?.[1];
      declarations.push({ tokenName, variable: mixin[1], kind: 'mixin', style: style ? camel(style) : undefined });
      tokenName = undefined;
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-fab-size-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    const path = `${module.root}.${declaration.variable === 'label-text' ? 'labelTextTypography' : camel(declaration.variable)}`;
    const token = canonical.get(path);
    if (declaration.kind === 'mixin') {
      const actual = canonicalValue(token);
      results.push({
        module: module.module,
        ...declaration,
        path,
        expected: declaration.style,
        actual,
        status: token && declaration.style && actual === declaration.style ? 'reconciled-typography-mixin' : token ? 'mismatch' : 'pending',
      });
      continue;
    }
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const actual = canonicalValue(token);
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
const pending = results.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web FAB size overlap audit: modules=${modules.length} declarations=${results.length} reconciled=${results.length - pending.length} pending=${pending.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
