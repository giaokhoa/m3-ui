import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { material3Sources } from './sources.mjs';

const auditRoot = new URL('../audit/', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);
const commitShaPattern = /^[0-9a-f]{40}$/;
const reviewIndex = JSON.parse(
  await readFile(new URL('material-upstream-repin-reviews.json', auditRoot), 'utf8'),
);
const reviewEntries = await Promise.all(
  reviewIndex.reviews.map(async (entry) => ({
    ...entry,
    review: JSON.parse(await readFile(new URL(entry.file, auditRoot), 'utf8')),
  })),
);
const latestEntry = reviewEntries.find((entry) => entry.id === reviewIndex.latestReviewId);
assert.ok(latestEntry, 'latest reviewed re-pin must exist in the review index');
const latestReview = latestEntry.review;

const dispositions = new Set([
  'no-observable-m3-ui-impact',
  'already-equivalent-on-web',
  'documented-adaptation-remains-valid',
  'audit-provenance-token-metadata-only',
  'test-update-required',
  'production-fix-required',
]);

test('re-pin review index preserves ordered immutable review generations', () => {
  assert.equal(reviewIndex.schemaVersion, 1);
  assert.ok(reviewEntries.length > 0);

  const ids = reviewEntries.map((entry) => entry.id);
  const files = reviewEntries.map((entry) => entry.file);
  assert.equal(new Set(ids).size, ids.length, 'review ids must be unique');
  assert.equal(new Set(files).size, files.length, 'review files must be unique');

  for (const [index, entry] of reviewEntries.entries()) {
    assert.equal(entry.issue, entry.review.issue, `${entry.id}: issue must match indexed review`);
    assert.ok(commitShaPattern.test(entry.review.sources.compose.fromRevision));
    assert.ok(commitShaPattern.test(entry.review.sources.compose.toRevision));

    if (index > 0) {
      const previous = reviewEntries[index - 1].review;
      assert.equal(
        entry.review.sources.compose.fromRevision,
        previous.sources.compose.toRevision,
        `${entry.id}: review generations must form a continuous Compose revision chain`,
      );
    }
  }
});

test('latest reviewed upstream re-pin matches the checked-in source registry', () => {
  assert.equal(latestReview.sources.compose.toRevision, material3Sources.compose.revision);
  assert.equal(latestReview.sources.compose.toRevisionAt, material3Sources.compose.revisionAt);
  assert.equal(
    latestReview.sources.materialWeb.reviewedRevision,
    material3Sources.materialWeb.revision,
  );
  assert.equal(
    latestReview.sources.materialWeb.reviewedRevisionAt,
    material3Sources.materialWeb.revisionAt,
  );
});

test('latest review records path-aware source selection and token provenance separately', () => {
  assert.equal(latestReview.sources.compose.candidateContainsAllScopeHeads, true);
  assert.ok(commitShaPattern.test(latestReview.sources.compose.toRevision));
  for (const [scope, revision] of Object.entries(latestReview.sources.compose.scopeHeads)) {
    assert.ok(commitShaPattern.test(revision), `${scope}: scope head must be an exact commit`);
  }

  assert.equal(latestReview.sources.compose.tokenRootChanged, false);
  assert.equal(latestReview.sources.compose.canonicalDtcgChanged, false);
  assert.equal(latestReview.sources.compose.generatedTokenCssChanged, false);
  assert.equal(latestReview.sources.materialWeb.rePinRequired, false);
  assert.equal(latestReview.sources.materialWeb.relationToReviewedRevision, 'behind');
  assert.equal(latestReview.reviewDecision.canonicalTokenRegeneration, false);
});

test('every reviewed semantic delta has a supported disposition and checked-in evidence', async () => {
  for (const entry of reviewEntries) {
    assert.ok(entry.review.deltas.length > 0, `${entry.id}: at least one delta is required`);
    for (const delta of entry.review.deltas) {
      assert.ok(delta.id, `${entry.id}: delta id is required`);
      assert.ok(delta.surface, `${entry.id}/${delta.id}: surface is required`);
      assert.ok(
        dispositions.has(delta.disposition),
        `${entry.id}/${delta.id}: unsupported disposition ${delta.disposition}`,
      );
      assert.ok(
        Array.isArray(delta.evidence) && delta.evidence.length > 0,
        `${entry.id}/${delta.id}: checked-in evidence is required`,
      );
      assert.ok(
        delta.upstreamRevision ||
          (Array.isArray(delta.upstreamRevisions) && delta.upstreamRevisions.length > 0),
        `${entry.id}/${delta.id}: upstream revision evidence is required`,
      );

      const revisions = delta.upstreamRevision
        ? [delta.upstreamRevision]
        : delta.upstreamRevisions;
      for (const revision of revisions) {
        assert.ok(
          commitShaPattern.test(revision),
          `${entry.id}/${delta.id}: upstream revision must be an exact commit`,
        );
      }

      for (const evidence of delta.evidence) {
        await assert.doesNotReject(
          access(new URL(evidence, repoRoot)),
          `${entry.id}/${delta.id}: evidence path must exist: ${evidence}`,
        );
      }
    }
  }
});

test('the historical #329 production fixes and lifecycle decisions remain intact', () => {
  const historical = reviewEntries.find((entry) => entry.issue === 329)?.review;
  assert.ok(historical, 'the #329 reviewed re-pin must remain indexed');

  const productionFixIds = historical.deltas
    .filter((delta) => delta.disposition === 'production-fix-required')
    .map((delta) => delta.id)
    .sort();

  assert.deepEqual(productionFixIds, [
    'scroll-field-focus-indication',
    'time-picker-expressive-geometry',
  ]);
  assert.deepEqual(historical.reviewDecision.productionChanges, [
    'ScrollField shared focus indication',
    'TimePicker expressive geometry',
  ]);
  assert.deepEqual(historical.reviewDecision.parentsRemainOpen, [296, 327]);
});
