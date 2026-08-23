import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidencePath = resolve(scriptDir, '../audit/figma-reference-evidence.json');
const evidence = JSON.parse(await readFile(evidencePath, 'utf8'));
const failures = [];
const source = evidence.source ?? {};
const expected = material3Sources.figma;

for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
  if (source[field] !== expected[field]) {
    failures.push({
      type: 'source-pin-mismatch',
      field,
      expected: expected[field],
      actual: source[field] ?? null,
    });
  }
}

if (typeof source.verifiedAt !== 'string' || Number.isNaN(Date.parse(source.verifiedAt))) {
  failures.push({ type: 'invalid-verified-at', actual: source.verifiedAt ?? null });
}

if (!Array.isArray(evidence.collections) || evidence.collections.length === 0) {
  failures.push({ type: 'missing-collections' });
}
if (!Array.isArray(evidence.styles) || evidence.styles.length === 0) {
  failures.push({ type: 'missing-styles' });
}

const keys = new Map();
function registerKey(kind, owner, key) {
  if (typeof key !== 'string' || !/^[0-9a-f]{40}$/.test(key)) {
    failures.push({ type: 'invalid-figma-key', kind, owner, key: key ?? null });
    return;
  }
  const previous = keys.get(key);
  if (previous) {
    failures.push({ type: 'duplicate-figma-key', key, previous, current: { kind, owner } });
    return;
  }
  keys.set(key, { kind, owner });
}

const collectionNames = new Set();
let variableSamples = 0;
for (const collection of evidence.collections ?? []) {
  if (typeof collection.name !== 'string' || collection.name.length === 0) {
    failures.push({ type: 'invalid-collection-name', collection });
    continue;
  }
  if (collectionNames.has(collection.name)) {
    failures.push({ type: 'duplicate-collection-name', name: collection.name });
  }
  collectionNames.add(collection.name);
  registerKey('variable-set', collection.name, collection.variableSetKey);

  if (!Array.isArray(collection.samples) || collection.samples.length === 0) {
    failures.push({ type: 'missing-variable-samples', collection: collection.name });
    continue;
  }
  for (const sample of collection.samples) {
    variableSamples += 1;
    registerKey('variable', `${collection.name}/${sample.name ?? '?'}`, sample.key);
    if (!['FLOAT', 'STRING', 'BOOLEAN', 'COLOR'].includes(sample.variableType)) {
      failures.push({
        type: 'invalid-variable-type',
        collection: collection.name,
        name: sample.name ?? null,
        actual: sample.variableType ?? null,
      });
    }
    if (!Array.isArray(sample.scopes) || sample.scopes.length === 0 || sample.scopes.some((scope) => typeof scope !== 'string')) {
      failures.push({ type: 'invalid-variable-scopes', collection: collection.name, name: sample.name ?? null });
    }
  }
}

for (const style of evidence.styles ?? []) {
  registerKey('style', style.name ?? '?', style.key);
  if (!['TEXT', 'FILL', 'EFFECT', 'GRID'].includes(style.styleType)) {
    failures.push({ type: 'invalid-style-type', name: style.name ?? null, actual: style.styleType ?? null });
  }
}

const requiredShapeNames = [
  'Corner/None',
  'Corner/Extra-small',
  'Corner/Small',
  'Corner/Medium',
  'Corner/Large',
  'Corner/Large-increased',
  'Corner/Extra-large',
  'Corner/Full',
];
const shape = (evidence.collections ?? []).find((collection) => collection.name === 'Shape');
const shapeNames = new Set(shape?.samples?.map((sample) => sample.name) ?? []);
for (const name of requiredShapeNames) {
  if (!shapeNames.has(name)) failures.push({ type: 'missing-shape-evidence', name });
}

const typescale = (evidence.collections ?? []).find((collection) => collection.name === 'Typescale');
const typescaleNames = new Set(typescale?.samples?.map((sample) => sample.name) ?? []);
for (const suffix of ['Font', 'Size', 'Line Height', 'Tracking', 'Weight', 'Weight-emphasized']) {
  const name = `Static/Display Large/${suffix}`;
  if (!typescaleNames.has(name)) failures.push({ type: 'missing-typescale-evidence', name });
}

const styleNames = new Set((evidence.styles ?? []).map((style) => style.name));
for (const name of [
  'M3/display/large',
  'M3/display/large-emphasized',
  'M3/key-colors/primary',
  'M3/key-colors/secondary',
  'M3/key-colors/tertiary',
  'M3/key-colors/error',
  'M3/key-colors/neutral',
  'M3/key-colors/neutral-variant',
]) {
  if (!styleNames.has(name)) failures.push({ type: 'missing-style-evidence', name });
}

const summary = {
  source: `${source.name ?? 'unknown'} ${source.version ?? 'unknown'}`,
  verifiedAt: source.verifiedAt ?? null,
  libraryKey: source.libraryKey ?? null,
  collections: evidence.collections?.length ?? 0,
  variableSamples,
  styles: evidence.styles?.length ?? 0,
  uniqueFigmaKeys: keys.size,
  failures: failures.length,
  buildInput: false,
};

console.log(
  `Figma reference evidence: collections=${summary.collections} variableSamples=${summary.variableSamples} styles=${summary.styles} uniqueKeys=${summary.uniqueFigmaKeys} failures=${summary.failures}`,
);
console.log(JSON.stringify(summary, null, 2));

if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  if (process.argv.includes('--require-complete')) process.exitCode = 1;
}
