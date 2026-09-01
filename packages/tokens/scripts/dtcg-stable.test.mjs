import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectTokens,
  validateDtcgStableStructure,
} from './dtcg.mjs';

test('accepts stable 2025.10 group metadata and root tokens', () => {
  const source = {
    color: {
      $description: 'Semantic colors',
      $type: 'string',
      $deprecated: false,
      $extensions: { 'com.example.meta': { owner: 'design' } },
      accent: {
        $root: { $value: 'var(--primary)' },
        strong: { $value: 'var(--primary)' },
      },
    },
  };

  assert.deepEqual(validateDtcgStableStructure(source), []);
  const tokens = collectTokens(source);
  assert.equal(tokens.get('color.accent.$root').value, 'var(--primary)');
  assert.equal(tokens.get('color.accent.$root').type, 'string');
});

test('rejects token and group names reserved by the stable format', () => {
  const errors = validateDtcgStableStructure({
    'bad.name': { $type: 'number', $value: 1 },
    'bad{name': { $type: 'number', $value: 2 },
  });
  assert.match(errors.join('\n'), /must not contain/);
});

test('rejects unknown stable properties and invalid metadata shapes', () => {
  const errors = validateDtcgStableStructure({
    group: {
      $description: 42,
      $unknown: true,
      token: {
        $type: 'number',
        $value: 1,
        $extensions: [],
      },
    },
  });
  assert.match(errors.join('\n'), /\$description must be a string/);
  assert.match(errors.join('\n'), /unsupported DTCG property \$unknown/);
  assert.match(errors.join('\n'), /\$extensions must be an object/);
});

test('rejects objects that are both tokens and groups', () => {
  const errors = validateDtcgStableStructure({
    invalid: {
      $type: 'number',
      $value: 1,
      child: { $value: 2 },
    },
  });
  assert.match(errors.join('\n'), /token cannot also contain child token\/group child/);
});
