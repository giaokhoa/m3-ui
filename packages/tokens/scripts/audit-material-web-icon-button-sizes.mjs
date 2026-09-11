import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-icon-button-xsmall', 'xSmall'],
  ['md-comp-icon-button-small', 'small'],
  ['md-comp-icon-button-medium', 'medium'],
  ['md-comp-icon-button-large', 'large'],
  ['md-comp-icon-button-xlarge', 'xLarge'],
].map(([module, size]) => ({ module, size, root: `component.iconButton.size.${size}` }));

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
function pathFor(module, variable) {
  const root = module.root;
  const base = {
    'container-height': `${root}.containerHeight`,
    'default-leading-space': `${root}.${module.size === 'large' ? 'uniformLeadingSpace' : 'defaultLeadingSpace'}`,
    'default-trailing-space': `${root}.${module.size === 'large' ? 'uniformTrailingSpace' : 'defaultTrailingSpace'}`,
    'icon-size': `${root}.iconSize`,
    'narrow-leading-space': `${root}.narrowLeadingSpace`,
    'narrow-trailing-space': `${root}.narrowTrailingSpace`,
    'outlined-outline-width': `${root}.outlinedOutlineWidth`,
    'wide-leading-space': `${root}.wideLeadingSpace`,
    'wide-trailing-space': `${root}.wideTrailingSpace`,
    'container-shape-round': `${root}.containerShapeRound`,
    'container-shape-square': `${root}.containerShapeSquare`,
    'pressed-container-corner-size-motion-spring-damping': `${root}.pressedShapeMotion.spring.dampingRatio`,
    'pressed-container-corner-size-motion-spring-stiffness': `${root}.pressedShapeMotion.spring.stiffness`,
    'pressed-container-shape': `${root}.pressedContainerShape`,
    'selected-container-shape-round': `${root}.selectedContainerShapeRound`,
    'selected-container-shape-square': `${root}.selectedContainerShapeSquare`,
  };
  return base[variable];
}
function normalize(raw) {
  const px = raw.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  let match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-motion\.\$spring-fast-spatial-(damping|stiffness)$/);
  if (match) {
    const property = match[1] === 'damping' ? 'dampingRatio' : 'stiffness';
    return { kind: 'alias', value: `{motion.spring.standard.fastSpatial.${property}}` };
  }
  return { kind: 'unsupported', value: raw };
}
function variables(text) {
  return [...text.matchAll(/^\$([a-z0-9-]+):\s*(.+);$/gm)].map((match) => ({ variable: match[1], raw: match[2].trim() }));
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-icon-button-size-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of variables(await response.text())) {
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
const pending = results.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Icon Button size overlap audit: modules=${modules.length} declarations=${results.length} reconciled=${results.length - pending.length} pending=${pending.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
