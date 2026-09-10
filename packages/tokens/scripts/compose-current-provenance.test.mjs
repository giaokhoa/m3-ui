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

test('historical re-pin provenance stays historical instead of leaking into current claims', async () => {
  const review = JSON.parse(
    await repoFile('packages/tokens/audit/material-upstream-repin-review.json'),
  );
  const historicalRevision = review.sources.compose.fromRevision;

  assert.match(historicalRevision, /^[0-9a-f]{40}$/);
  assert.notEqual(historicalRevision, material3Sources.compose.revision);

  for (const relativePath of currentProvenanceFiles) {
    const content = await repoFile(relativePath);
    assert.ok(
      !content.includes(historicalRevision),
      `${relativePath} must not present historical Compose revision ${historicalRevision} as current provenance`,
    );
  }

  const historicalReview = await repoFile(
    'packages/tokens/audit/material-upstream-repin-review.json',
  );
  assert.ok(
    historicalReview.includes(historicalRevision),
    'the reviewed re-pin history must retain its original fromRevision',
  );
});
