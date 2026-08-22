import assert from 'node:assert/strict';
import test from 'node:test';
import { assertCanonicalArtifacts, loadComposeCoverage } from './compose-coverage-model.mjs';

test('Compose snapshot locks the full pinned Material3 token denominator', async () => {
  const { inventory } = await loadComposeCoverage();
  assert.deepEqual(inventory.counts, { all: 120, foundation: 17, component: 103 });
  assert.equal(inventory.foundation.length, 17);
  assert.equal(inventory.components.length, 103);
  const files = [...inventory.foundation, ...inventory.components];
  assert.equal(new Set(files).size, 120);
  assert.deepEqual([...inventory.foundation].sort(), inventory.foundation);
  assert.deepEqual([...inventory.components].sort(), inventory.components);
});

test('coverage manifests classify only pinned sources exactly once', async () => {
  const coverage = await loadComposeCoverage();
  assert.deepEqual(coverage.duplicates, []);
  assert.deepEqual(coverage.unknown, []);
  assert.equal(coverage.counts.reconciled + coverage.counts.excluded + coverage.counts.pending, coverage.counts.all);
  assert.equal(coverage.counts.all, 120);
});

test('reconciled source families point only at checked-in canonical artifacts', async () => {
  const { reconciled } = await loadComposeCoverage();
  for (const { file, value } of reconciled) {
    assert.ok(value.family, `${file} has no family`);
    assert.ok(value.sources.length > 0, `${file} has no source files`);
    assert.ok(value.canonical.length > 0, `${file} has no canonical artifacts`);
    await assertCanonicalArtifacts(value);
  }
});

test('excluded families always carry an explicit reason', async () => {
  const { excluded } = await loadComposeCoverage();
  for (const { file, value } of excluded) {
    assert.ok(value.sources.length > 0, `${file} has no source files`);
    assert.equal(typeof value.reason, 'string', `${file} exclusion reason`);
    assert.ok(value.reason.trim().length > 0, `${file} exclusion reason`);
  }
});

test('coverage stays incomplete until every pinned source file is reconciled or explicitly excluded', async () => {
  const coverage = await loadComposeCoverage();
  assert.equal(coverage.counts.pending, coverage.pending.length);
  assert.deepEqual([...coverage.pending].sort(), coverage.pending);
});
