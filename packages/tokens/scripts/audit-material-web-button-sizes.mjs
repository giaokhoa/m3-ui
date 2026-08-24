import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const driftManifest = JSON.parse(
  await readFile(new URL('../audit/material-web-overlap-drift.json', import.meta.url), 'utf8'),
);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));

const modules = [
  ['md-comp-button-xsmall', 'extraSmall'],
  ['md-comp-button-small', 'small'],
  ['md-comp-button-medium', 'medium'],
  ['md-comp-button-large', 'large'],
  ['md-comp-button-xlarge', 'extraLarge'],
].map(([module, size]) => ({ module, size, root: `component.button.size.${size}` }));

const styles = {
  extraSmall: 'labelLarge',
  small: 'labelLarge',
  medium: 'titleMedium',
  large: 'headlineSmall',
  extraLarge: 'headlineLarge',
};
const driftByDeclaration = new Map(
  driftManifest.drift.map((entry) => [`${entry.module}:${entry.variable}`, entry]),
);
const seenDrift = new Set();

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

function pathFor(root, variable) {
  const paths = {
    'container-height': `${root}.height`,
    'icon-label-space': `${root}.iconSpacing`,
    'icon-size': `${root}.iconSize`,
    'leading-space': `${root}.padding.inlineStart`,
    'outlined-outline-width': `${root}.outlineWidth`,
    'trailing-space': `${root}.padding.inlineEnd`,
    'container-shape-round': `${root}.containerShapeRound`,
    'container-shape-square': `${root}.containerShapeSquare`,
    'pressed-container-corner-size-motion-spring-damping': `${root}.pressedShapeMotion.spring.dampingRatio`,
    'pressed-container-corner-size-motion-spring-stiffness': `${root}.pressedShapeMotion.spring.stiffness`,
    'pressed-container-shape': `${root}.pressedShape`,
    'selected-container-shape-round': `${root}.selectedContainerShapeRound`,
    'selected-container-shape-square': `${root}.selectedContainerShapeSquare`,
  };
  return paths[variable];
}

function normalize(raw) {
  const px = raw.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  const shape = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (shape) {
    return {
      kind: 'value',
      value: shape[1].replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase()),
    };
  }
  const motion = raw.match(/^md-sys-motion\.\$spring-fast-spatial-(damping|stiffness)$/);
  if (motion) {
    const property = motion[1] === 'damping' ? 'dampingRatio' : 'stiffness';
    return { kind: 'alias', value: `{motion.spring.standard.fastSpatial.${property}}` };
  }
  return { kind: 'unsupported', value: raw };
}

function variablesFromSass(text) {
  return [...text.matchAll(/^\$([a-z0-9-]+):\s*(.+);$/gm)].map((match) => ({
    variable: match[1],
    raw: match[2].trim(),
  }));
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-button-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  const text = await response.text();

  for (const declaration of variablesFromSass(text)) {
    const path = pathFor(module.root, declaration.variable);
    if (!path) {
      results.push({ module: module.module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
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

  const typeMixin = text.match(/@mixin\s+label-text\s*\{[\s\S]*?@include\s+md-sys-typescale\.([a-z]+-[a-z]+);[\s\S]*?\}/);
  const expectedStyle = typeMixin?.[1]?.replace(/-([a-z])/g, (_, character) => character.toUpperCase());
  const typographyPath = `${module.root}.typography`;
  const actualStyle = resolvedValue(canonical.get(typographyPath));
  results.push({
    module: module.module,
    variable: 'label-text',
    path: typographyPath,
    expected: expectedStyle,
    actual: actualStyle,
    status: expectedStyle && expectedStyle === styles[module.size] && actualStyle === expectedStyle
      ? 'reconciled-typography-mixin'
      : 'mismatch',
  });
}

const pending = results.filter((result) => !result.status.startsWith('reconciled-'));
const unusedDrift = driftManifest.drift.filter((entry) => !seenDrift.has(entry.id));
const documentedDrift = results.filter((result) => result.status === 'reconciled-documented-drift').length;
console.log(
  `Material Web Button size overlap audit: modules=${modules.length} declarations=${results.length} reconciled=${results.length - pending.length} pending=${pending.length} documentedDrift=${documentedDrift}`,
);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (unusedDrift.length) {
  console.error(`Unused overlap drift: ${unusedDrift.map((entry) => entry.id).join(', ')}`);
}
if (process.argv.includes('--require-complete') && (pending.length || unusedDrift.length)) process.exitCode = 1;
