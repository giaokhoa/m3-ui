import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/typography-tracking-reference-evidence.json'), 'utf8'));
const figmaEvidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/figma-reference-evidence.json'), 'utf8'));
const foundationDrift = JSON.parse(await readFile(resolve(scriptDir, '../audit/foundation-drift.json'), 'utf8'));
const canonical = JSON.parse(await readFile(resolve(scriptDir, '../tokens/core/typography.json'), 'utf8'));

const expectedTracking = Object.freeze({
  displayLarge: -0.25,
  displayMedium: 0,
  displaySmall: 0,
  headlineLarge: 0,
  headlineMedium: 0,
  headlineSmall: 0,
  titleLarge: 0,
  titleMedium: 0.15,
  titleSmall: 0.1,
  bodyLarge: 0.5,
  bodyMedium: 0.25,
  bodySmall: 0.4,
  labelLarge: 0.1,
  labelMedium: 0.5,
  labelSmall: 0.5,
});

function assertSourcePin(actual, expected) {
  for (const field of ['kind', 'name', 'repository', 'revision', 'revisionAt', 'tokenFile']) {
    assert.equal(actual[field], expected[field], `${actual.name ?? 'source'} ${field} pin mismatch`);
  }
}

test('Material Components Android and Flutter tracking evidence stays pinned as read-only implementation references', () => {
  assert.equal(evidence.buildInput, false);
  assert.match(evidence.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  assertSourcePin(evidence.materialComponentsAndroid, material3Sources.materialComponentsAndroid);
  assertSourcePin(evidence.flutter, material3Sources.flutter);
  assert.equal(evidence.materialComponentsAndroid.generatedVersion, material3Sources.materialComponentsAndroid.generatedVersion);
  assert.equal(evidence.flutter.generatedFrom, material3Sources.flutter.generatedFrom);
});

test('Material Components Android generated md.sys.typescale normalizes to the complete 15-role tracking vocabulary', () => {
  assert.deepEqual(evidence.roleOrder, Object.keys(expectedTracking));
  assert.equal(new Set(evidence.roleOrder).size, 15);
  for (const [role, expected] of Object.entries(expectedTracking)) {
    const observation = evidence.materialComponentsAndroid.roles[role];
    assert.ok(observation, `missing Material Components Android role ${role}`);
    assert.equal(observation.trackingPx, expected, `${role} normalized Android tracking mismatch`);
    const derived = observation.fontSizeSp * observation.letterSpacingEm;
    assert.ok(Math.abs(derived - expected) < 0.000001, `${role} Android em conversion no longer derives ${expected}px`);
  }
});

test('Flutter generated Material token database output agrees with Figma and Material Web on all 15 baseline tracking roles', () => {
  assert.deepEqual(evidence.flutter.roles, expectedTracking);

  const figmaTracking = Object.fromEntries(
    figmaEvidence.typographyBaselineTracking.map(({ role, baselineValue }) => [role, baselineValue]),
  );
  assert.deepEqual(figmaTracking, expectedTracking);
  assert.deepEqual(foundationDrift.typography.materialWeb.latestGenerated.baselineTracking, expectedTracking);

  const androidTracking = Object.fromEntries(
    Object.entries(evidence.materialComponentsAndroid.roles).map(([role, value]) => [role, value.trackingPx]),
  );
  assert.deepEqual(androidTracking, expectedTracking);
});

test('the unresolved canonical/Compose tracking difference is exactly three roles and remains a normative-spec review', () => {
  const composeTracking = foundationDrift.typography.compose.baselineTracking;
  const canonicalTracking = Object.fromEntries(
    evidence.roleOrder.map((role) => [role, canonical.typography[role].letterSpacing.$value.value]),
  );
  assert.deepEqual(canonicalTracking, composeTracking);

  const differingRoles = evidence.roleOrder.filter((role) => canonicalTracking[role] !== expectedTracking[role]);
  assert.deepEqual(differingRoles, ['displayLarge', 'titleMedium', 'bodyMedium']);

  const drift = foundationDrift.typography.drift.find((entry) => entry.id === 'typography-baseline-tracking-source-lag');
  assert.ok(drift, 'missing typography baseline tracking drift record');
  assert.equal(drift.classification, 'cross-source-value-drift');
  assert.equal(drift.preferredReference, 'normative-spec-review');
});
