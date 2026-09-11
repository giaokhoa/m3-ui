import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/figma-reference-evidence.json'), 'utf8'));
const metricsEvidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/figma-typography-metrics-evidence.json'), 'utf8'));
const failures = [];
const expectedSource = material3Sources.figma;

function validateSource(source, label) {
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    if (source?.[field] !== expectedSource[field]) {
      failures.push({ type: 'source-pin-mismatch', label, field, expected: expectedSource[field], actual: source?.[field] ?? null });
    }
  }
  if (typeof source?.verifiedAt !== 'string' || Number.isNaN(Date.parse(source.verifiedAt))) {
    failures.push({ type: 'invalid-verified-at', label, actual: source?.verifiedAt ?? null });
  }
}
validateSource(evidence.source, 'reference');
validateSource(metricsEvidence.source, 'typography-metrics');

function validKey(key) {
  return typeof key === 'string' && /^[0-9a-f]{40}$/.test(key);
}
const allKeys = new Set();
function validateKey(kind, owner, key) {
  if (!validKey(key)) {
    failures.push({ type: 'invalid-figma-key', kind, owner, key: key ?? null });
    return false;
  }
  allKeys.add(key);
  return true;
}

if (!Array.isArray(evidence.collections) || evidence.collections.length === 0) failures.push({ type: 'missing-collections' });
if (!Array.isArray(evidence.styles) || evidence.styles.length === 0) failures.push({ type: 'missing-styles' });

const primaryKeys = new Set();
const collectionNames = new Set();
let variableSamples = 0;
for (const collection of evidence.collections ?? []) {
  if (typeof collection.name !== 'string' || collection.name.length === 0) {
    failures.push({ type: 'invalid-collection-name', collection });
    continue;
  }
  if (collectionNames.has(collection.name)) failures.push({ type: 'duplicate-collection-name', name: collection.name });
  collectionNames.add(collection.name);
  if (validateKey('variable-set', collection.name, collection.variableSetKey)) {
    if (primaryKeys.has(collection.variableSetKey)) failures.push({ type: 'duplicate-figma-key', key: collection.variableSetKey, owner: collection.name });
    primaryKeys.add(collection.variableSetKey);
  }
  if (collection.mode !== 'Baseline') failures.push({ type: 'unexpected-collection-mode', collection: collection.name, actual: collection.mode ?? null });
  if (!Array.isArray(collection.samples) || collection.samples.length === 0) {
    failures.push({ type: 'missing-variable-samples', collection: collection.name });
    continue;
  }
  for (const sample of collection.samples) {
    variableSamples += 1;
    if (validateKey('variable', `${collection.name}/${sample.name ?? '?'}`, sample.key)) {
      if (primaryKeys.has(sample.key)) failures.push({ type: 'duplicate-figma-key', key: sample.key, owner: sample.name ?? '?' });
      primaryKeys.add(sample.key);
    }
    if (!['FLOAT', 'STRING', 'BOOLEAN', 'COLOR'].includes(sample.variableType)) {
      failures.push({ type: 'invalid-variable-type', collection: collection.name, name: sample.name ?? null, actual: sample.variableType ?? null });
    }
    if (!Array.isArray(sample.scopes) || sample.scopes.length === 0 || sample.scopes.some((scope) => typeof scope !== 'string')) {
      failures.push({ type: 'invalid-variable-scopes', collection: collection.name, name: sample.name ?? null });
    }
  }
}
for (const style of evidence.styles ?? []) {
  if (validateKey('style', style.name ?? '?', style.key)) {
    if (primaryKeys.has(style.key)) failures.push({ type: 'duplicate-figma-key', key: style.key, owner: style.name ?? '?' });
    primaryKeys.add(style.key);
  }
  if (!['TEXT', 'FILL', 'EFFECT', 'GRID'].includes(style.styleType)) {
    failures.push({ type: 'invalid-style-type', name: style.name ?? null, actual: style.styleType ?? null });
  }
}

const expectedShape = new Map([
  ['Corner/None', 0], ['Corner/Extra-small', 4], ['Corner/Small', 8], ['Corner/Medium', 12],
  ['Corner/Large', 16], ['Corner/Large-increased', 20], ['Corner/Extra-large', 28], ['Corner/Full', 1000],
]);
const shape = (evidence.collections ?? []).find((collection) => collection.name === 'Shape');
const shapeSamples = new Map(shape?.samples?.map((sample) => [sample.name, sample]) ?? []);
for (const [name, expectedValue] of expectedShape) {
  const sample = shapeSamples.get(name);
  if (!sample) failures.push({ type: 'missing-shape-evidence', name });
  else if (sample.baselineValue !== expectedValue) failures.push({ type: 'figma-value-mismatch', collection: 'Shape', name, expected: expectedValue, actual: sample.baselineValue ?? null });
}

const expectedTypescale = new Map([
  ['Static/Display Large/Font', ['resolvedBaselineValue', 'Roboto']],
  ['Static/Display Large/Size', ['baselineValue', 57]],
  ['Static/Display Large/Line Height', ['baselineValue', 64]],
  ['Static/Display Large/Tracking', ['baselineValue', -0.25]],
  ['Static/Display Large/Weight', ['resolvedBaselineValue', 'Regular']],
  ['Static/Display Large/Weight-emphasized', ['resolvedBaselineValue', 'Medium']],
]);
const typescale = (evidence.collections ?? []).find((collection) => collection.name === 'Typescale');
const typescaleSamples = new Map(typescale?.samples?.map((sample) => [sample.name, sample]) ?? []);
for (const [name, [valueField, expectedValue]] of expectedTypescale) {
  const sample = typescaleSamples.get(name);
  if (!sample) failures.push({ type: 'missing-typescale-evidence', name });
  else if (sample[valueField] !== expectedValue) failures.push({ type: 'figma-value-mismatch', collection: 'Typescale', name, valueField, expected: expectedValue, actual: sample[valueField] ?? null });
}

const expectedTracking = new Map([
  ['displayLarge', -0.25], ['displayMedium', 0], ['displaySmall', 0],
  ['headlineLarge', 0], ['headlineMedium', 0], ['headlineSmall', 0],
  ['titleLarge', 0], ['titleMedium', 0.15], ['titleSmall', 0.1],
  ['bodyLarge', 0.5], ['bodyMedium', 0.25], ['bodySmall', 0.4],
  ['labelLarge', 0.1], ['labelMedium', 0.5], ['labelSmall', 0.5],
]);
const trackingEntries = evidence.typographyBaselineTracking ?? [];
const trackingByRole = new Map(trackingEntries.map((entry) => [entry.role, entry]));
const trackingKeys = new Set();
for (const [role, expectedValue] of expectedTracking) {
  const entry = trackingByRole.get(role);
  if (!entry) {
    failures.push({ type: 'missing-baseline-tracking-evidence', role });
    continue;
  }
  if (validateKey('baseline-tracking', role, entry.key)) {
    if (trackingKeys.has(entry.key)) failures.push({ type: 'duplicate-baseline-tracking-key', role, key: entry.key });
    trackingKeys.add(entry.key);
  }
  if (entry.baselineValue !== expectedValue) failures.push({ type: 'figma-baseline-tracking-mismatch', role, expected: expectedValue, actual: entry.baselineValue ?? null });
}
for (const entry of trackingEntries) {
  if (!expectedTracking.has(entry.role)) failures.push({ type: 'unexpected-baseline-tracking-role', role: entry.role ?? null });
}

const expectedMetrics = Object.freeze({
  displayLarge: [57, 64, 'Regular', 'Medium'], displayMedium: [45, 52, 'Regular', 'Medium'], displaySmall: [36, 44, 'Regular', 'Medium'],
  headlineLarge: [32, 40, 'Regular', 'Medium'], headlineMedium: [28, 36, 'Regular', 'Medium'], headlineSmall: [24, 32, 'Regular', 'Medium'],
  titleLarge: [22, 28, 'Regular', 'Medium'], titleMedium: [16, 24, 'Medium', 'SemiBold'], titleSmall: [14, 20, 'Medium', 'SemiBold'],
  bodyLarge: [16, 24, 'Regular', 'Medium'], bodyMedium: [14, 20, 'Regular', 'Medium'], bodySmall: [12, 16, 'Regular', 'Medium'],
  labelLarge: [14, 20, 'Medium', 'SemiBold'], labelMedium: [12, 16, 'Medium', 'SemiBold'], labelSmall: [11, 16, 'Medium', 'SemiBold'],
});
const metricFields = [
  ['size', 'baselineValue', 0], ['lineHeight', 'baselineValue', 1],
  ['weight', 'resolvedBaselineValue', 2], ['weightEmphasized', 'resolvedBaselineValue', 3],
];
if (metricsEvidence.method?.mode !== 'Baseline') failures.push({ type: 'unexpected-typography-metrics-mode', actual: metricsEvidence.method?.mode ?? null });
const metricEntries = metricsEvidence.roles ?? [];
const metricsByRole = new Map(metricEntries.map((entry) => [entry.role, entry]));
if (metricEntries.length !== 15 || metricsByRole.size !== 15) failures.push({ type: 'incomplete-typography-metric-roles', entries: metricEntries.length, uniqueRoles: metricsByRole.size });
const metricKeys = new Set();
let typographyMetricValues = 0;
for (const [role, expectedValues] of Object.entries(expectedMetrics)) {
  const entry = metricsByRole.get(role);
  if (!entry) {
    failures.push({ type: 'missing-typography-metric-role', role });
    continue;
  }
  for (const [metric, valueField, expectedIndex] of metricFields) {
    const observation = entry[metric];
    if (!observation) {
      failures.push({ type: 'missing-typography-metric', role, metric });
      continue;
    }
    if (validateKey('typography-metric', `${role}.${metric}`, observation.key)) {
      if (metricKeys.has(observation.key)) failures.push({ type: 'duplicate-typography-metric-key', role, metric, key: observation.key });
      metricKeys.add(observation.key);
    }
    const expectedValue = expectedValues[expectedIndex];
    if (observation[valueField] !== expectedValue) failures.push({ type: 'figma-typography-metric-mismatch', role, metric, expected: expectedValue, actual: observation[valueField] ?? null });
    typographyMetricValues += 1;
  }
}
for (const entry of metricEntries) {
  if (!(entry.role in expectedMetrics)) failures.push({ type: 'unexpected-typography-metric-role', role: entry.role ?? null });
}

const styleNames = new Set((evidence.styles ?? []).map((style) => style.name));
for (const name of ['M3/display/large','M3/display/large-emphasized','M3/key-colors/primary','M3/key-colors/secondary','M3/key-colors/tertiary','M3/key-colors/error','M3/key-colors/neutral','M3/key-colors/neutral-variant']) {
  if (!styleNames.has(name)) failures.push({ type: 'missing-style-evidence', name });
}

const summary = {
  source: `${evidence.source?.name ?? 'unknown'} ${evidence.source?.version ?? 'unknown'}`,
  verifiedAt: evidence.source?.verifiedAt ?? null,
  libraryKey: evidence.source?.libraryKey ?? null,
  collections: evidence.collections?.length ?? 0,
  variableSamples,
  resolvedValueSamples: expectedShape.size + expectedTypescale.size,
  baselineTrackingRoles: expectedTracking.size,
  typographyMetricRoles: metricsByRole.size,
  typographyMetricValues,
  styles: evidence.styles?.length ?? 0,
  uniqueFigmaKeys: allKeys.size,
  failures: failures.length,
  buildInput: false,
};
console.log(`Figma reference evidence: collections=${summary.collections} variableSamples=${summary.variableSamples} resolvedValues=${summary.resolvedValueSamples} baselineTrackingRoles=${summary.baselineTrackingRoles} typographyMetricRoles=${summary.typographyMetricRoles} typographyMetricValues=${summary.typographyMetricValues} styles=${summary.styles} uniqueKeys=${summary.uniqueFigmaKeys} failures=${summary.failures}`);
console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  if (process.argv.includes('--require-complete')) process.exitCode = 1;
}
