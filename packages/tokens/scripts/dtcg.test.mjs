import assert from 'node:assert/strict';
import test from 'node:test';
import { collectTokens, resolveTokenValues, validateCanonical } from './dtcg.mjs';

const meta = {
  $extensions: {
    'm3-ui': { authority: 'canonical', policy: 'manual-review' },
  },
};

test('accepts valid DTCG aliases and resolves dimensions to web numbers', () => {
  const source = {
    ...meta,
    size: {
      $type: 'dimension',
      base: { $value: { value: 40, unit: 'px' } },
      alias: { $value: '{size.base}' },
    },
  };
  const validation = validateCanonical(source);
  assert.deepEqual(validation.errors, []);
  const values = resolveTokenValues(validation.tokens);
  assert.equal(values.get('size.base'), 40);
  assert.equal(values.get('size.alias'), 40);
});

test('rejects a missing alias target', () => {
  const source = {
    ...meta,
    size: { $type: 'dimension', alias: { $value: '{size.missing}' } },
  };
  assert.match(validateCanonical(source).errors.join('\n'), /does not exist/);
});

test('rejects alias cycles', () => {
  const source = {
    ...meta,
    value: {
      $type: 'number',
      a: { $value: '{value.b}' },
      b: { $value: '{value.a}' },
    },
  };
  assert.match(validateCanonical(source).errors.join('\n'), /cycle/);
});

test('rejects legacy value keys', () => {
  const source = {
    ...meta,
    valid: { $type: 'number', $value: 1, value: 1 },
  };
  assert.match(validateCanonical(source).errors.join('\n'), /legacy value key/);
});

test('requires explicit canonical ownership metadata', () => {
  const source = { value: { $type: 'number', $value: 1 } };
  const errors = validateCanonical(source).errors.join('\n');
  assert.match(errors, /authority/);
  assert.match(errors, /manual-review/);
});

test('collectTokens inherits group type', () => {
  const tokens = collectTokens({ ...meta, opacity: { $type: 'number', hover: { $value: 0.08 } } });
  assert.equal(tokens.get('opacity.hover').type, 'number');
});
