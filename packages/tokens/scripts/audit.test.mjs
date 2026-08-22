import assert from 'node:assert/strict';
import test from 'node:test';
import { compareTokenGraph, hasAuditDrift, summarizeAudit } from './audit.mjs';

const mappings = [
  { canonical: 'a', reference: 'upstream.a' },
  { canonical: 'b', reference: 'upstream.b' },
  { canonical: 'c', reference: 'upstream.c' },
  { canonical: 'd', reference: 'upstream.d' },
];

test('classifies match, mismatch, and missing values independently', () => {
  const canonical = new Map([['a', 1], ['b', 2], ['c', 3]]);
  const reference = new Map([['upstream.a', 1], ['upstream.b', 9], ['upstream.d', 4]]);
  const results = compareTokenGraph(canonical, reference, mappings);
  assert.deepEqual(results.map((result) => result.status), [
    'match',
    'mismatch',
    'missing-reference',
    'missing-canonical',
  ]);
  assert.equal(results[1].canonicalValue, 2);
  assert.equal(results[1].referenceValue, 9);
  assert.equal(hasAuditDrift(results), true);
  assert.deepEqual(summarizeAudit(results), {
    match: 1,
    mismatch: 1,
    'missing-canonical': 1,
    'missing-reference': 1,
  });
});

test('audit comparator is read-only', () => {
  const canonical = new Map([['a', 1]]);
  const reference = new Map([['upstream.a', 2]]);
  const beforeCanonical = structuredClone([...canonical]);
  const beforeReference = structuredClone([...reference]);
  compareTokenGraph(canonical, reference, [mappings[0]]);
  assert.deepEqual([...canonical], beforeCanonical);
  assert.deepEqual([...reference], beforeReference);
});

test('reports no drift only when every mapped token matches', () => {
  const canonical = new Map([['a', 1]]);
  const reference = new Map([['upstream.a', 1]]);
  const results = compareTokenGraph(canonical, reference, [mappings[0]]);
  assert.equal(hasAuditDrift(results), false);
});
