import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/motion-reference-evidence.json'), 'utf8'));
const foundationDrift = JSON.parse(await readFile(resolve(scriptDir, '../audit/foundation-drift.json'), 'utf8'));
const canonical = JSON.parse(await readFile(resolve(scriptDir, '../tokens/core/motion.json'), 'utf8')).motion;

function resolveCanonicalEasing(name) {
  const value = canonical.easing[name].$value;
  const match = /^\{motion\.easing\.([A-Za-z0-9]+)\}$/.exec(value);
  return match ? canonical.easing[match[1]].$value : value;
}

function canonicalDurationMs() {
  return Object.fromEntries(
    Object.entries(canonical.duration).map(([name, token]) => [name, Number.parseFloat(token.$value)]),
  );
}

function canonicalEasing() {
  return Object.fromEntries(Object.keys(canonical.easing).map((name) => [name, resolveCanonicalEasing(name)]));
}

function canonicalSpring(scheme) {
  return Object.fromEntries(
    Object.entries(canonical.spring[scheme]).map(([name, value]) => [
      name,
      { dampingRatio: value.dampingRatio.$value, stiffness: value.stiffness.$value },
    ]),
  );
}

function driftById(id) {
  return foundationDrift.motion.drift.find((entry) => entry.id === id);
}

test('motion reference evidence stays pinned, read-only, and outside the canonical build graph', () => {
  assert.equal(evidence.status, 'reference-audit');
  assert.equal(evidence.buildInput, false);
  assert.match(evidence.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);

  for (const field of ['kind', 'name', 'repository', 'revision', 'revisionAt']) {
    assert.equal(evidence.androidxCompose[field], material3Sources.compose[field], `Compose ${field} pin mismatch`);
    assert.equal(evidence.materialWeb[field], material3Sources.materialWeb[field], `Material Web ${field} pin mismatch`);
  }
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(evidence.figmaMaterial3Kit[field], material3Sources.figma[field], `Figma ${field} pin mismatch`);
  }
  assert.equal(evidence.materialWeb.latestGenerated.version, material3Sources.materialWeb.latestGeneratedVersion);
  assert.equal(evidence.materialWeb.publicAdapter.version, material3Sources.materialWeb.publicAdapterVersion);
  assert.equal(evidence.figmaMaterial3Kit.readOnly, true);
  assert.equal(JSON.stringify(evidence).includes('T4NuERAoU056MwShPtFpGx'), false, 'scratch Figma file key must never be persisted');
});

test('pinned Compose generated motion tokens exactly corroborate canonical classic motion and both spring schemes', () => {
  assert.deepEqual(evidence.androidxCompose.durationMs, canonicalDurationMs());
  assert.deepEqual(evidence.androidxCompose.easing, canonicalEasing());
  assert.deepEqual(evidence.androidxCompose.spring.standard, canonicalSpring('standard'));
  assert.deepEqual(evidence.androidxCompose.spring.expressive, canonicalSpring('expressive'));

  assert.equal(Object.keys(evidence.androidxCompose.durationMs).length, 16);
  assert.equal(Object.keys(evidence.androidxCompose.easing).length, 10);
  assert.equal(Object.keys(evidence.androidxCompose.spring.standard).length, 6);
  assert.equal(Object.keys(evidence.androidxCompose.spring.expressive).length, 6);
  assert.deepEqual(evidence.reconciliation.canonicalVsCompose, {
    durationMatches: 16,
    easingMatches: 10,
    standardSpringFamilies: 6,
    expressiveSpringFamilies: 6,
    mismatches: 0,
  });
});

test('Material Web 34.0.21 corroborates classic motion and standard springs while expressive springs remain absent', () => {
  const latest = evidence.materialWeb.latestGenerated;
  assert.equal(latest.path, 'tokens/versions/latest/sass/_md-sys-motion.scss');
  assert.deepEqual(latest.durationMs, canonicalDurationMs());
  assert.deepEqual(latest.easing, canonicalEasing());
  assert.deepEqual(latest.spring.standard, canonicalSpring('standard'));
  assert.equal(latest.spring.expressiveFamiliesObserved, 0);
  assert.equal(Object.keys(latest.spring.standard).length, 6);

  assert.equal(evidence.materialWeb.publicAdapter.path, 'tokens/versions/v0_192/_md-sys-motion.scss');
  assert.equal(evidence.materialWeb.publicAdapter.durationCount, 16);
  assert.equal(evidence.materialWeb.publicAdapter.easingCount, 10);
  assert.equal(evidence.materialWeb.publicAdapter.springPhysicsObserved, false);

  assert.equal(evidence.materialWeb.labsCssAdapter.path, 'labs/gb/styles/motion/md-motion-tokens-easing.scss');
  assert.equal(evidence.materialWeb.labsCssAdapter.importsLatestGenerated, true);
  assert.equal(evidence.materialWeb.labsCssAdapter.durationCssCustomProperties, 16);
  assert.equal(evidence.materialWeb.labsCssAdapter.easingCssCustomProperties, 6);
  assert.equal(evidence.materialWeb.labsCssAdapter.springCssCustomProperties, 0);

  assert.deepEqual(evidence.reconciliation.canonicalVsMaterialWebLatest, {
    durationMatches: 16,
    easingMatches: 10,
    standardSpringFamilies: 6,
    expressiveSpringFamiliesObserved: 0,
  });
});

test('Figma Material 3 Design Kit V1.25 publishes no motion variables or styles under the audited vocabulary', () => {
  assert.deepEqual(Object.keys(evidence.figmaMaterial3Kit.publishedSearch), ['spring', 'motion', 'easing', 'duration']);
  for (const [term, result] of Object.entries(evidence.figmaMaterial3Kit.publishedSearch)) {
    assert.deepEqual(result, { variables: 0, styles: 0 }, `${term} unexpectedly became a published Figma motion variable/style`);
  }
  assert.equal(evidence.reconciliation.figmaPublishedVariableOrStyleMatches, 0);
  assert.equal(evidence.reconciliation.canonicalMutationRequired, false);
});

test('motion cross-source gaps remain explicit drift classifications rather than alternate build inputs', () => {
  const expressiveWeb = driftById('motion-expressive-web-latest');
  assert.ok(expressiveWeb, 'missing Material Web expressive motion drift record');
  assert.equal(expressiveWeb.classification, 'source-lag');
  assert.equal(expressiveWeb.preferredReference, 'compose');

  const publicAdapter = driftById('motion-web-public-adapter');
  assert.ok(publicAdapter, 'missing Material Web public adapter drift record');
  assert.equal(publicAdapter.classification, 'public-adapter-lag');
  assert.equal(publicAdapter.preferredReference, 'materialWebLatest');

  const figma = driftById('motion-spring-figma');
  assert.ok(figma, 'missing Figma motion drift record');
  assert.equal(figma.classification, 'not-observed');
  assert.equal(figma.preferredReference, 'compose+materialWebLatest');
});
