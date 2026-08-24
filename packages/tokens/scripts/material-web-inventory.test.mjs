import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { material3Sources } from './sources.mjs';

const snapshot = JSON.parse(
  await readFile(new URL('../audit/material-web-generated.json', import.meta.url), 'utf8'),
);

test('Material Web generated-module denominator is pinned without copying upstream source', () => {
  const source = material3Sources.materialWeb;
  assert.equal(snapshot.source.repository, source.repository);
  assert.equal(snapshot.source.revision, source.revision);
  assert.equal(snapshot.source.generatedVersion, source.latestGeneratedVersion);
  assert.equal(snapshot.source.root, source.latestGeneratedRoot);
  assert.deepEqual(snapshot.counts, {
    allForwards: 194,
    componentModules: 177,
    systemModules: 13,
    referenceModules: 2,
    otherModules: 2,
  });
  for (const digest of Object.values(snapshot.digests)) {
    assert.match(digest, /^[a-f0-9]{64}$/);
  }
});
