import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-app-bar', 'component.appBar.base'],
  ['md-comp-app-bar-small', 'component.appBar.variant.small'],
  ['md-comp-app-bar-medium', 'component.appBar.variant.medium'],
  ['md-comp-app-bar-medium-flexible', 'component.appBar.variant.mediumFlexible'],
  ['md-comp-app-bar-large', 'component.appBar.variant.large'],
  ['md-comp-app-bar-large-flexible', 'component.appBar.variant.largeFlexible'],
].map(([module, root]) => ({ module, root }));

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function pathFor(module, declaration) {
  if (declaration.kind === 'mixin') {
    const typography = {
      'search-label-text-font': 'searchLabelTextTypography',
      'subtitle-font': 'subtitleTypography',
      'title-font': 'titleTypography',
    }[declaration.variable];
    return typography ? `${module.root}.${typography}` : `${module.root}.${camel(declaration.variable)}`;
  }
  if (declaration.variable === 'with-subtitle-container-height') {
    return `${module.root}.largeContainerHeight`;
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
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$(level\d)$/);
  if (match) return { kind: 'value', value: match[1] };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
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
      declarations.push({
        tokenName,
        variable: mixin[1],
        deprecated,
        kind: 'mixin',
        style: style ? camel(style) : undefined,
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-app-bar-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const path = pathFor(module, declaration);
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
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web App Bar overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
