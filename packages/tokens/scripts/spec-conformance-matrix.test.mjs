import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const matrix = JSON.parse(
  await readFile(new URL('../audit/spec-conformance-matrix.json', import.meta.url), 'utf8'),
);
const web = JSON.parse(
  await readFile(new URL('../audit/material-web-coverage.json', import.meta.url), 'utf8'),
);

test('textual-spec matrix covers every Material Web family disposition', () => {
  const expected = web.groups.map(({ family }) => family).sort();
  const actual = matrix.families.map(({ family }) => family).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
});

test('only captured m3.material.io family claims are marked text-verified', () => {
  const verified = Object.fromEntries(
    matrix.families
      .filter(({ textualSpec }) => textualSpec.status === 'verified')
      .map(({ family, textualSpec }) => [family, textualSpec.claim]),
  );
  assert.deepEqual(verified, {
    'button-group': 'new',
    'progress-indicator': 'updated',
    'split-button': 'new',
    toolbar: 'new',
  });
});

test('Web-only families remain explicit when no normative text was captured', () => {
  for (const family of [
    'banners',
    'carousel',
    'data-table',
    'full-screen-dialog',
    'menu-button',
    'select',
    'sheets',
  ]) {
    const row = matrix.families.find((candidate) => candidate.family === family);
    assert.equal(row?.moduleDisposition, 'current-reconciled');
    assert.equal(row?.textualSpec.status, 'not-text-verified');
    assert.equal(row?.drift[0]?.classification, 'not-text-verified');
  }
});

test('legacy aliases are drift/disposition records, never current textual conformance', () => {
  const aliases = matrix.families.filter(
    ({ moduleDisposition }) => moduleDisposition === 'excluded-generated-alias',
  );
  assert.equal(aliases.length, 4);
  for (const row of aliases) {
    assert.equal(row.textualSpec.status, 'not-applicable');
    assert.equal(row.drift[0].classification, 'upstream-deprecation');
  }
});
