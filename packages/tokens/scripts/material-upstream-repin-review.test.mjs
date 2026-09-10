import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { material3Sources } from './sources.mjs';

const review = JSON.parse(
  await readFile(
    new URL('../audit/material-upstream-repin-review.json', import.meta.url),
    'utf8',
  ),
);

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

test('review records token provenance separately from semantic implementation deltas', () => {
  assert.equal(review.sources.compose.tokenRootChanged, false);
  assert.equal(review.sources.compose.canonicalDtcgChanged, false);
  assert.equal(review.sources.compose.generatedTokenCssChanged, false);
  assert.equal(review.sources.materialWeb.rePinRequired, false);
  assert.equal(review.reviewDecision.canonicalTokenRegeneration, false);
});

test('every reviewed semantic delta has a supported disposition and checked-in evidence', () => {
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
  }
});
