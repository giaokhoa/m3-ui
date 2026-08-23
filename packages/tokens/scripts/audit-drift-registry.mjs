import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const auditDir = resolve(scriptDir, '../audit');
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const typographyTrackingEvidenceFile = 'typography-tracking-reference-evidence.json';
const typographyTrackingEvidence = JSON.parse(
  await readFile(resolve(auditDir, typographyTrackingEvidenceFile), 'utf8'),
);

const driftFiles = (await readdir(auditDir))
  .filter((name) => name.endsWith('-drift.json') || name === 'foundation-drift.json')
  .sort();

function collectNamedArrays(value, keyName, trail = [], output = []) {
  if (Array.isArray(value)) return output;
  if (!value || typeof value !== 'object') return output;
  for (const [key, child] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    if (key === keyName && Array.isArray(child)) {
      for (const entry of child) output.push({ entry, trail: nextTrail.join('.') });
      continue;
    }
    collectNamedArrays(child, keyName, nextTrail, output);
  }
  return output;
}

function revisionChecks(value, trail = [], output = []) {
  if (!value || typeof value !== 'object') return output;
  for (const [key, child] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    const path = nextTrail.join('.');
    if (typeof child === 'string') {
      if (key === 'composeRevision' || path.endsWith('compose.revision')) {
        output.push({ path, expected: material3Sources.compose.revision, actual: child });
      }
      if (key === 'materialWebRevision' || path.endsWith('materialWeb.revision')) {
        output.push({ path, expected: material3Sources.materialWeb.revision, actual: child });
      }
      if (
        key === 'materialWebGeneratedVersion' ||
        key === 'latestGeneratedVersion' ||
        path.endsWith('materialWeb.latestGeneratedVersion')
      ) {
        output.push({ path, expected: material3Sources.materialWeb.latestGeneratedVersion, actual: child });
      }
      if (path.endsWith('materialComponentsAndroid.revision')) {
        output.push({ path, expected: material3Sources.materialComponentsAndroid.revision, actual: child });
      }
      if (
        key === 'materialComponentsAndroidGeneratedVersion' ||
        path.endsWith('materialComponentsAndroid.generatedVersion')
      ) {
        output.push({ path, expected: material3Sources.materialComponentsAndroid.generatedVersion, actual: child });
      }
      if (path.endsWith('flutter.revision')) {
        output.push({ path, expected: material3Sources.flutter.revision, actual: child });
      }
      if (path.endsWith('flutter.generatedFrom')) {
        output.push({ path, expected: material3Sources.flutter.generatedFrom, actual: child });
      }
    }
    revisionChecks(child, nextTrail, output);
  }
  return output;
}

const drifts = [];
const semanticRemaps = [];
const revisionMismatches = [];
const malformed = [];

for (const file of driftFiles) {
  const document = JSON.parse(await readFile(resolve(auditDir, file), 'utf8'));
  const entries = [
    ...collectNamedArrays(document, 'drift'),
    ...collectNamedArrays(document, 'records'),
  ];
  for (const { entry, trail } of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      malformed.push({ file, trail, reason: 'drift entry must be an object' });
      continue;
    }
    if (typeof entry.id !== 'string' || entry.id.length === 0) {
      malformed.push({ file, trail, reason: 'drift entry must have a non-empty id' });
      continue;
    }
    if (typeof entry.classification !== 'string' || entry.classification.length === 0) {
      malformed.push({ file, trail, id: entry.id, reason: 'drift entry must have a non-empty classification' });
      continue;
    }
    if (entry.canonicalPath && !canonical.has(entry.canonicalPath)) {
      malformed.push({
        file,
        trail,
        id: entry.id,
        canonicalPath: entry.canonicalPath,
        reason: 'canonicalPath does not exist in the Style Dictionary token source',
      });
    }
    drifts.push({ file, trail, ...entry });
  }

  for (const { entry, trail } of collectNamedArrays(document, 'semanticRemaps')) {
    if (entry && typeof entry === 'object' && typeof entry.id === 'string') {
      semanticRemaps.push({ file, trail, ...entry });
    }
  }

  for (const check of revisionChecks(document)) {
    if (check.actual !== check.expected) revisionMismatches.push({ file, ...check });
  }
}

const corroboratingReferenceChecks = [
  {
    path: 'materialComponentsAndroid.revision',
    expected: material3Sources.materialComponentsAndroid.revision,
    actual: typographyTrackingEvidence.materialComponentsAndroid?.revision,
  },
  {
    path: 'materialComponentsAndroid.generatedVersion',
    expected: material3Sources.materialComponentsAndroid.generatedVersion,
    actual: typographyTrackingEvidence.materialComponentsAndroid?.generatedVersion,
  },
  {
    path: 'flutter.revision',
    expected: material3Sources.flutter.revision,
    actual: typographyTrackingEvidence.flutter?.revision,
  },
  {
    path: 'flutter.generatedFrom',
    expected: material3Sources.flutter.generatedFrom,
    actual: typographyTrackingEvidence.flutter?.generatedFrom,
  },
];
for (const check of corroboratingReferenceChecks) {
  if (check.actual !== check.expected) {
    revisionMismatches.push({ file: typographyTrackingEvidenceFile, ...check });
  }
}

const byId = new Map();
for (const drift of drifts) {
  const previous = byId.get(drift.id) ?? [];
  previous.push({ file: drift.file, trail: drift.trail });
  byId.set(drift.id, previous);
}
const duplicateIds = [...byId.entries()]
  .filter(([, locations]) => locations.length > 1)
  .map(([id, locations]) => ({ id, locations }));

const classificationCounts = Object.fromEntries(
  [...new Set(drifts.map((entry) => entry.classification))]
    .sort()
    .map((classification) => [
      classification,
      drifts.filter((entry) => entry.classification === classification).length,
    ]),
);
const filesWithDrift = [...new Set(drifts.map((entry) => entry.file))].sort();
const modulesWithDrift = [...new Set(drifts.flatMap((entry) => [entry.module, ...(entry.modules ?? [])]).filter(Boolean))].sort();

const summary = {
  canonicalSource: 'tokens/**/*.json',
  externalReferences: {
    compose: `${material3Sources.compose.repository}@${material3Sources.compose.revision}`,
    materialWeb: `${material3Sources.materialWeb.repository}@${material3Sources.materialWeb.revision}`,
    materialWebGeneratedVersion: material3Sources.materialWeb.latestGeneratedVersion,
    figma: `${material3Sources.figma.name} ${material3Sources.figma.version}`,
    materialComponentsAndroid: `${material3Sources.materialComponentsAndroid.repository}@${material3Sources.materialComponentsAndroid.revision}`,
    materialComponentsAndroidGeneratedVersion: material3Sources.materialComponentsAndroid.generatedVersion,
    flutter: `${material3Sources.flutter.repository}@${material3Sources.flutter.revision}`,
    flutterGeneratedFrom: material3Sources.flutter.generatedFrom,
  },
  counts: {
    manifests: driftFiles.length,
    manifestsWithDrift: filesWithDrift.length,
    driftRecords: drifts.length,
    semanticRemaps: semanticRemaps.length,
    modulesWithDrift: modulesWithDrift.length,
    duplicateIds: duplicateIds.length,
    malformed: malformed.length,
    revisionMismatches: revisionMismatches.length,
  },
  classificationCounts,
};

console.log(`Cross-source drift registry: manifests=${summary.counts.manifests} driftRecords=${summary.counts.driftRecords} modulesWithDrift=${summary.counts.modulesWithDrift} semanticRemaps=${summary.counts.semanticRemaps} duplicateIds=${summary.counts.duplicateIds} malformed=${summary.counts.malformed} revisionMismatches=${summary.counts.revisionMismatches}`);
console.log(JSON.stringify(summary, null, 2));

const failures = { duplicateIds, malformed, revisionMismatches };
if (duplicateIds.length || malformed.length || revisionMismatches.length) {
  console.error(JSON.stringify(failures, null, 2));
}
if (process.argv.includes('--require-complete') && (duplicateIds.length || malformed.length || revisionMismatches.length)) {
  process.exitCode = 1;
}
