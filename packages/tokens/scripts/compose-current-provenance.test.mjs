import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { material3Sources } from './sources.mjs';

const currentProvenanceFiles = [
  'packages/ui/src/components/ScrollField/README.md',
  'packages/ui/src/components/AppBarColumn/README.md',
  'packages/ui/src/components/AppBarRow/README.md',
  'packages/ui/src/components/FabMenu/README.md',
  'packages/ui/src/components/BottomSheetScaffold/README.md',
  'packages/ui/src/components/LoadingIndicator/README.md',
  'packages/ui/src/components/NonInteractiveScrollbar/README.md',
  'packages/ui/src/components/TextField/SecureTextField.README.md',
  'packages/ui/src/components/Slider/README.md',
  'packages/ui/src/components/BottomAppBar/README.md',
  'packages/ui/src/components/ToggleButton/README.md',
  'packages/ui/src/components/ProgressIndicator/README.md',
  'packages/ui/src/components/IconButton/README.md',
  'packages/ui/src/internal/material-shapes/PROVENANCE.md',
  'packages/tokens/audit/expressive-shapes.json',
];

async function repoFile(relativePath) {
  return readFile(new URL(`../../../${relativePath}`, import.meta.url), 'utf8');
}

async function indexedReviews() {
  const index = JSON.parse(
    await repoFile('packages/tokens/audit/material-upstream-repin-reviews.json'),
  );
  return Promise.all(
    index.reviews.map(async (entry) => ({
      ...entry,
      content: await repoFile(`packages/tokens/audit/${entry.file}`),
      review: JSON.parse(await repoFile(`packages/tokens/audit/${entry.file}`)),
    })),
  );
}

test('current Compose provenance follows the reviewed source registry', async () => {
  const reviewedRevision = material3Sources.compose.revision;
  assert.match(reviewedRevision, /^[0-9a-f]{40}$/);

  for (const relativePath of currentProvenanceFiles) {
    const content = await repoFile(relativePath);
    assert.ok(
      content.includes(reviewedRevision),
      `${relativePath} must reference reviewed Compose revision ${reviewedRevision}`,
    );
  }
});

test('all prior reviewed Compose revisions stay historical instead of leaking into current claims', async () => {
  const reviews = await indexedReviews();
  const currentRevision = material3Sources.compose.revision;
  const historicalRevisions = new Set();

  for (const { review } of reviews) {
    historicalRevisions.add(review.sources.compose.fromRevision);
    historicalRevisions.add(review.sources.compose.toRevision);
  }
  historicalRevisions.delete(currentRevision);

  assert.ok(historicalRevisions.size > 0, 'at least one historical Compose revision is expected');
  for (const revision of historicalRevisions) {
    assert.match(revision, /^[0-9a-f]{40}$/);
    for (const relativePath of currentProvenanceFiles) {
      const content = await repoFile(relativePath);
      assert.ok(
        !content.includes(revision),
        `${relativePath} must not present historical Compose revision ${revision} as current provenance`,
      );
    }
  }

  for (const entry of reviews) {
    assert.ok(
      entry.content.includes(entry.review.sources.compose.fromRevision),
      `${entry.file} must retain its original fromRevision`,
    );
    assert.ok(
      entry.content.includes(entry.review.sources.compose.toRevision),
      `${entry.file} must retain its original toRevision`,
    );
  }
});
