import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { material3Sources } from './sources.mjs';

async function repoJson(relativePath) {
  return JSON.parse(
    await readFile(new URL(`../../../${relativePath}`, import.meta.url), 'utf8'),
  );
}

const review = await repoJson('packages/tokens/audit/typography-normative-review.json');
const drift = await repoJson('packages/tokens/audit/foundation-drift.json');
const canonical = await repoJson('packages/tokens/tokens/core/typography.json');
const reference = await repoJson(
  'packages/tokens/audit/typography-tracking-reference-evidence.json',
);
const figma = await repoJson('packages/tokens/audit/figma-reference-evidence.json');

const canonicalTracking = (role) => canonical.typography[role].letterSpacing.$value.value;
const canonicalWeight = (role) => {
  const value = canonical.typography[role].fontWeight.$value;
  const alias = value.match(/^\{typeface\.weight\.([A-Za-z]+)\}$/)?.[1];
  assert.ok(alias, `${role} font weight must remain a canonical typeface alias`);
  return canonical.typeface.weight[alias].$value;
};

test('normative review records the official Material pages and an explicit unavailable-value result', () => {
  assert.equal(review.issue, 338);
  assert.equal(review.reviewedAt, '2026-09-10');
  assert.equal(review.buildInput, false);
  assert.deepEqual(review.normative.pages, [
    material3Sources.spec.pages.typographyOverview,
    material3Sources.spec.pages.typographyTokens,
  ]);
  assert.equal(
    review.normative.retrievalResult,
    'javascript-shell-no-text-verifiable-token-values',
  );
  assert.equal(review.normative.thirdPartyValuesAcceptedAsNormative, false);
});

test('baseline disagreement stays explicit and does not majority-vote canonical DTCG', () => {
  assert.equal(review.baseline.disposition, 'insufficient-normative-evidence');
  assert.equal(review.baseline.canonicalChange, false);
  assert.deepEqual(review.baseline.roleOrder, [
    'displayLarge',
    'titleMedium',
    'bodyMedium',
  ]);

  const figmaTracking = Object.fromEntries(
    figma.typographyBaselineTracking.map(({ role, baselineValue }) => [role, baselineValue]),
  );
  const androidTracking = Object.fromEntries(
    Object.entries(reference.materialComponentsAndroid.roles).map(([role, value]) => [
      role,
      value.trackingPx,
    ]),
  );

  for (const role of review.baseline.roleOrder) {
    const values = review.baseline.differences[role];
    assert.equal(values.canonical, canonicalTracking(role));
    assert.equal(values.compose, drift.typography.compose.baselineTracking[role]);
    assert.equal(values.figma, figmaTracking[role]);
    assert.equal(
      values.materialWeb,
      drift.typography.materialWeb.latestGenerated.baselineTracking[role],
    );
    assert.equal(values.materialComponentsAndroid, androidTracking[role]);
    assert.equal(values.flutter, reference.flutter.roles[role]);
    assert.equal(values.canonical, values.compose);
    assert.notEqual(values.canonical, values.materialWeb);
  }

  assert.equal(review.decision.majorityVoteUsed, false);
  assert.equal(review.decision.upstreamCopiedIntoCanonical, false);
  assert.equal(review.decision.canonicalDtcgChanged, false);
  assert.equal(review.decision.generatedOutputsChanged, false);
  assert.equal(review.decision.driftMustRemainExplicit, true);
});

test('emphasized Compose TODO is source-specific drift while canonical keeps reviewed generated evidence', () => {
  assert.equal(review.emphasized.disposition, 'source-specific-implementation-drift');
  assert.equal(review.emphasized.canonicalChange, false);
  assert.equal(review.emphasized.composeBlockMarkedTodo, true);
  assert.equal(drift.typography.compose.emphasizedBlockMarkedTodo, true);

  const expected = review.emphasized.representativeDifferences;
  assert.equal(expected.displayLargeTracking.canonical, canonicalTracking('displayLargeEmphasized'));
  assert.equal(expected.bodyLargeTracking.canonical, canonicalTracking('bodyLargeEmphasized'));
  assert.equal(expected.titleMediumWeight.canonical, canonicalWeight('titleMediumEmphasized'));
  assert.equal(expected.titleSmallWeight.canonical, canonicalWeight('titleSmallEmphasized'));
  assert.equal(expected.labelLargeWeight.canonical, canonicalWeight('labelLargeEmphasized'));
  assert.equal(expected.labelMediumWeight.canonical, canonicalWeight('labelMediumEmphasized'));
  assert.equal(expected.labelSmallWeight.canonical, canonicalWeight('labelSmallEmphasized'));

  assert.equal(expected.displayLargeTracking.compose, drift.typography.compose.knownEmphasizedDrift.displayLargeTracking);
  assert.equal(expected.bodyLargeTracking.compose, drift.typography.compose.knownEmphasizedDrift.bodyLargeTracking);
  assert.equal(expected.titleMediumWeight.compose, drift.typography.compose.knownEmphasizedDrift.titleMediumSmallWeight);
  assert.equal(expected.labelLargeWeight.compose, drift.typography.compose.knownEmphasizedDrift.labelWeight);

  assert.equal(expected.displayLargeTracking.materialWeb, canonicalTracking('displayLargeEmphasized'));
  assert.equal(expected.bodyLargeTracking.materialWeb, canonicalTracking('bodyLargeEmphasized'));
  assert.equal(expected.titleMediumWeight.materialWeb, 600);
  assert.equal(expected.labelLargeWeight.materialWeb, 600);
});

test('existing drift registry still exposes both typography disagreements separately', () => {
  const byId = new Map(drift.typography.drift.map((entry) => [entry.id, entry]));
  assert.equal(
    byId.get(review.baseline.driftId)?.classification,
    'cross-source-value-drift',
  );
  assert.equal(
    byId.get(review.emphasized.driftId)?.classification,
    'source-drift',
  );
});
