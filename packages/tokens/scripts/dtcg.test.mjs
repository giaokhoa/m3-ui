import assert from 'node:assert/strict';
import test from 'node:test';
import { collectTokens, resolveTokenValues, validateCanonical } from './dtcg.mjs';

test('accepts valid DTCG aliases and resolves dimensions to web numbers', () => {
  const source = {
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

test('accepts runtime CSS variable references as plain DTCG strings', () => {
  const source = {
    containerColor: { $type: 'string', $value: 'var(--primary)' },
  };
  const validation = validateCanonical(source);
  assert.deepEqual(validation.errors, []);
  assert.equal(resolveTokenValues(validation.tokens).get('containerColor'), 'var(--primary)');
});

test('rejects a missing alias target', () => {
  const source = {
    size: { $type: 'dimension', alias: { $value: '{size.missing}' } },
  };
  assert.match(validateCanonical(source).errors.join('\n'), /does not exist/);
});

test('rejects alias cycles', () => {
  const source = {
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
    valid: { $type: 'number', $value: 1, value: 1 },
  };
  assert.match(validateCanonical(source).errors.join('\n'), /legacy value key/);
});

test('canonical tokens need no project-specific metadata', () => {
  const source = { value: { $type: 'number', $value: 1 } };
  assert.deepEqual(validateCanonical(source).errors, []);
});

test('collectTokens inherits group type', () => {
  const tokens = collectTokens({ opacity: { $type: 'number', hover: { $value: 0.08 } } });
  assert.equal(tokens.get('opacity.hover').type, 'number');
});
