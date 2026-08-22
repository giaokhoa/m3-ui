import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const inventory = JSON.parse(await readFile(new URL('../audit/compose-token-files.json', import.meta.url), 'utf8'));
const coverage = JSON.parse(await readFile(new URL('../audit/compose-coverage.json', import.meta.url), 'utf8'));
const reconciledSources = () => coverage.reconciled.flatMap((family) => family.sources);

test('Compose snapshot locks the full pinned Material3 token denominator', () => {
  assert.deepEqual(inventory.counts, { all: 120, foundation: 17, component: 103 });
  assert.equal(inventory.foundation.length, 17);
  assert.equal(inventory.components.length, 103);
  const files = [...inventory.foundation, ...inventory.components];
  assert.equal(new Set(files).size, 120);
  assert.deepEqual([...inventory.foundation].sort(), inventory.foundation);
  assert.deepEqual([...inventory.components].sort(), inventory.components);
});

test('every pinned Compose token file has exactly one reconciliation state', () => {
  assert.equal(coverage.sourceRevision, inventory.source.revision);
  const reconciled = reconciledSources();
  const excluded = coverage.excluded.flatMap((entry) => entry.sources);
  const classified = [...reconciled, ...excluded, ...coverage.pending];
  assert.equal(classified.length, inventory.counts.all);
  assert.equal(new Set(classified).size, inventory.counts.all);
  assert.deepEqual([...classified].sort(), [...inventory.foundation, ...inventory.components].sort());
  assert.deepEqual(coverage.counts, { reconciled: reconciled.length, excluded: excluded.length, pending: coverage.pending.length, all: classified.length });
});

test('reconciled source families point only at checked-in canonical artifacts', async () => {
  for (const family of coverage.reconciled) {
    assert.ok(family.sources.length > 0, `${family.family} has no source files`);
    assert.ok(family.canonical.length > 0, `${family.family} has no canonical artifacts`);
    for (const canonicalFile of family.canonical) await access(new URL(`../${canonicalFile}`, import.meta.url));
  }
});

test('exclusions always carry an explicit reason', () => {
  for (const exclusion of coverage.excluded) {
    assert.ok(exclusion.sources.length > 0, `${exclusion.family} has no source files`);
    assert.equal(typeof exclusion.reason, 'string', `${exclusion.family} exclusion reason`);
    assert.ok(exclusion.reason.trim().length > 0, `${exclusion.family} exclusion reason`);
  }
});

test('AppBar token family is reconciled as one semantic canonical family', () => {
  const appBar = coverage.reconciled.find((family) => family.family === 'app-bar');
  assert.deepEqual(appBar.sources, ['AppBarTokens.kt','AppBarSmallTokens.kt','AppBarMediumTokens.kt','AppBarMediumFlexibleTokens.kt','AppBarLargeTokens.kt','AppBarLargeFlexibleTokens.kt']);
  assert.deepEqual(appBar.canonical, ['tokens/component/app-bar.json']);
});
