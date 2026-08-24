import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const audit = JSON.parse(await readFile(new URL('../audit/expressive-shapes.json', import.meta.url), 'utf8'));

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value)).sort();
}

test('Figma and Compose both satisfy the material.io 35-shape count', () => {
  assert.equal(audit.figma.count, audit.spec.expectedCount);
  assert.equal(audit.compose.count, audit.spec.expectedCount);
});

test('shape vocabulary drift is explicit rather than silently reconciled', () => {
  const figmaOnly = difference(audit.figma.shapes, audit.compose.shapes);
  const composeOnly = difference(audit.compose.shapes, audit.figma.shapes);
  assert.deepEqual(figmaOnly, audit.drift.figmaOnly);
  assert.deepEqual(composeOnly, audit.drift.composeOnly);
  assert.equal(audit.drift.classification, 'source-drift');
  assert.equal(audit.drift.preferredReference, 'compose');
});

test('Material Web absence is classified as not observed, not as a spec violation', () => {
  assert.equal(audit.materialWeb.classification, 'not-observed');
});
