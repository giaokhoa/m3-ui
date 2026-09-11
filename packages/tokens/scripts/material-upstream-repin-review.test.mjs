import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { material3Sources } from './sources.mjs';

const review = JSON.parse(
  await readFile(
    new URL('../audit/material-upstream-repin-review.json', import.meta.url),
    'utf8',
  ),
);
const repoRoot = new URL('../../../', import.meta.url);
const commitShaPattern = /^[0-9a-f]{40}$/;

const dispositions = new Set([
  'no-observable-m3-ui-impact',
  'already-equivalent-on-web',
  'documented-adaptation-remains-valid',
  'audit-provenance-token-metadata-only',
  'test-update-required',
  'production-fix-required',
]);

test('reviewed upstream re-pin record matches the checked-in source registry', () => {
  assert.equal(review.sources.compose.toRevision, material3Sources.compose.revision);
  assert.equal(review.sources.compose.toRevisionAt, material3Sources.compose.revisionAt);
  assert.equal(
    review.sources.materialWeb.reviewedRevision,
    material3Sources.materialWeb.revision,
  );
  assert.equal(
    review.sources.materialWeb.reviewedRevisionAt,
    material3Sources.materialWeb.revisionAt,
  );
});

test('review records path-aware source selection and token provenance separately', () => {
  assert.equal(review.sources.compose.candidateContainsAllScopeHeads, true);
  assert.ok(commitShaPattern.test(review.sources.compose.toRevision));
  for (const [scope, revision] of Object.entries(review.sources.compose.scopeHeads)) {
    assert.ok(commitShaPattern.test(revision), `${scope}: scope head must be an exact commit`);
  }

  assert.equal(review.sources.compose.tokenRootChanged, false);
  assert.equal(review.sources.compose.canonicalDtcgChanged, false);
  assert.equal(review.sources.compose.generatedTokenCssChanged, false);
  assert.equal(review.sources.materialWeb.rePinRequired, false);
  assert.equal(review.sources.materialWeb.relationToReviewedRevision, 'behind');
  assert.equal(review.reviewDecision.canonicalTokenRegeneration, false);
});

test('every reviewed semantic delta has a supported disposition and checked-in evidence', async () => {
  assert.ok(review.deltas.length > 0);
  for (const delta of review.deltas) {
    assert.ok(delta.id, 'delta id is required');
    assert.ok(delta.surface, `${delta.id}: surface is required`);
    assert.ok(
      dispositions.has(delta.disposition),
      `${delta.id}: unsupported disposition ${delta.disposition}`,
    );
    assert.ok(
      Array.isArray(delta.evidence) && delta.evidence.length > 0,
      `${delta.id}: checked-in evidence is required`,
    );
    assert.ok(
      delta.upstreamRevision ||
        (Array.isArray(delta.upstreamRevisions) && delta.upstreamRevisions.length > 0),
      `${delta.id}: upstream revision evidence is required`,
    );

    const revisions = delta.upstreamRevision
      ? [delta.upstreamRevision]
      : delta.upstreamRevisions;
    for (const revision of revisions) {
      assert.ok(
        commitShaPattern.test(revision),
        `${delta.id}: upstream revision must be an exact commit`,
      );
    }

    for (const evidence of delta.evidence) {
      await assert.doesNotReject(
        access(new URL(evidence, repoRoot)),
        `${delta.id}: evidence path must exist: ${evidence}`,
      );
    }
  }
});

test('production fixes and parent lifecycle decisions remain explicit', () => {
  const productionFixIds = review.deltas
    .filter((delta) => delta.disposition === 'production-fix-required')
    .map((delta) => delta.id)
    .sort();

  assert.deepEqual(productionFixIds, [
    'scroll-field-focus-indication',
    'time-picker-expressive-geometry',
  ]);
  assert.deepEqual(review.reviewDecision.productionChanges, [
    'ScrollField shared focus indication',
    'TimePicker expressive geometry',
  ]);
  assert.deepEqual(review.reviewDecision.parentsRemainOpen, [296, 327]);
});
