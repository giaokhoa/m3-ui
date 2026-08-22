import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const inventory = JSON.parse(
  await readFile(new URL('../audit/compose-token-files.json', import.meta.url), 'utf8'),
);
const coverage = JSON.parse(
  await readFile(new URL('../audit/compose-coverage.json', import.meta.url), 'utf8'),
);

test('Compose snapshot locks the full pinned Material3 token denominator', () => {
  assert.equal(inventory.counts.all, 120);
  assert.equal(inventory.counts.foundation, 17);
  assert.equal(inventory.counts.component, 103);
  assert.equal(inventory.foundation.length, 17);
  assert.equal(inventory.components.length, 103);

  const files = [...inventory.foundation, ...inventory.components];
  assert.equal(new Set(files).size, 120);
  assert.deepEqual([...inventory.foundation].sort(), inventory.foundation);
  assert.deepEqual([...inventory.components].sort(), inventory.components);
});

test('every pinned Compose token file has exactly one reconciliation state', () => {
  assert.equal(coverage.sourceRevision, inventory.source.revision);

  const reconciled = Object.keys(coverage.status.reconciled);
  const excluded = Object.keys(coverage.status.excluded);
  const pending = coverage.status.pending;
  const classified = [...reconciled, ...excluded, ...pending];

  assert.equal(classified.length, inventory.counts.all);
  assert.equal(new Set(classified).size, inventory.counts.all);
  assert.deepEqual(
    [...classified].sort(),
    [...inventory.foundation, ...inventory.components].sort(),
  );

  assert.deepEqual(coverage.counts, {
    reconciled: reconciled.length,
    excluded: excluded.length,
    pending: pending.length,
    all: classified.length,
  });
});

test('reconciled source files point only at checked-in canonical artifacts', async () => {
  for (const [sourceFile, canonicalFiles] of Object.entries(coverage.status.reconciled)) {
    assert.ok(canonicalFiles.length > 0, `${sourceFile} has no canonical artifact`);
    for (const canonicalFile of canonicalFiles) {
      await access(new URL(`../${canonicalFile}`, import.meta.url));
    }
  }
});

test('exclusions always carry an explicit reason', () => {
  for (const [sourceFile, exclusion] of Object.entries(coverage.status.excluded)) {
    assert.equal(typeof exclusion.reason, 'string', `${sourceFile} exclusion reason`);
    assert.ok(exclusion.reason.trim().length > 0, `${sourceFile} exclusion reason`);
  }
});

test('AppBar token family is reconciled as one semantic canonical family', () => {
  const appBarFiles = [
    'AppBarTokens.kt',
    'AppBarSmallTokens.kt',
    'AppBarMediumTokens.kt',
    'AppBarMediumFlexibleTokens.kt',
    'AppBarLargeTokens.kt',
    'AppBarLargeFlexibleTokens.kt',
  ];
  for (const sourceFile of appBarFiles) {
    assert.deepEqual(coverage.status.reconciled[sourceFile], ['tokens/component/app-bar.json']);
  }
});
