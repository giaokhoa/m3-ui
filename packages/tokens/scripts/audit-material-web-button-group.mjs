import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const sizes = [
  ['xsmall', 'xSmall'],
  ['small', 'small'],
  ['medium', 'medium'],
  ['large', 'large'],
  ['xlarge', 'xLarge'],
];
const modules = [
  ...sizes.map(([sourceSize, size]) => ({
    module: `md-comp-button-group-standard-${sourceSize}`,
    kind: 'standard',
    root: `component.buttonGroup.${size}`,
  })),
  ...sizes.map(([sourceSize, size]) => ({
    module: `md-comp-button-group-connected-${sourceSize}`,
    kind: 'connected',
    root: `component.buttonGroup.connected${size[0].toUpperCase()}${size.slice(1)}`,
  })),
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
  const standard = {
    'between-space': 'betweenSpace',
    'container-height': 'containerHeight',
    'pressed-item-width-multiplier': 'pressedItemWidthMultiplierPercent',
    'pressed-item-width-motion-spring-dampening': 'pressedItemWidthMotion.spring.dampingRatio',
    'pressed-item-width-motion-spring-stiffness': 'pressedItemWidthMotion.spring.stiffness',
  };
  const connected = {
    'between-space': 'betweenSpace',
    'container-height': 'containerHeight',
    'selected-inner-corner-corner-size': 'selectedInnerCornerSizePercent',
    'container-shape': 'containerShape',
    'inner-corner-corner-size': 'innerCornerSize',
    'pressed-inner-corner-corner-size': 'pressedInnerCornerSize',
  };
  const name = (module.kind === 'standard' ? standard : connected)[variable];
  return name ? `${module.root}.${name}` : undefined;
}
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  const percent = raw.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (percent) return { kind: 'value', value: Number(percent[1]) };
  let match = raw.match(/^md-sys-shape\.\$corner-value-([a-z0-9-]+)$/);
  if (match) {
    const name = match[1].replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
    return { kind: 'alias', value: `{shape.corner.${name}}` };
  }
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) {
    const name = match[1].replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
    return { kind: 'value', value: name };
  }
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-button-group-overlap-audit' } });
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
console.log(`Material Web Button Group overlap audit: modules=${modules.length} declarations=${results.length} reconciled=${results.length - pending.length} pending=${pending.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
