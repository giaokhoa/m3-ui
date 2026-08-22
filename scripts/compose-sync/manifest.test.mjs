import assert from 'node:assert/strict';
import test from 'node:test';
import { androidX, tokenSources } from './manifest.mjs';

test('pins one AndroidX revision and generates every tracked token source', () => {
  assert.match(androidX.revision, /^[0-9a-f]{40}$/);
  assert.equal(tokenSources.length, 36);

  for (const source of tokenSources) {
    assert.match(source.file, /Tokens\.kt$/);
    assert.ok(source.path.startsWith(`${androidX.tokenRoot}/`));
    assert.match(source.blobSha, /^[0-9a-f]{40}$/);
    assert.match(source.exportName, /^[a-z]\w*TokensGenerated$/);
    assert.match(
      source.output,
      /^packages\/tokens\/src\/generated\/androidx\/[a-z0-9-]+\.ts$/,
    );
  }
});

test('manifest source, output and export identities are unique', () => {
  for (const key of ['file', 'path', 'blobSha', 'exportName', 'output']) {
    const values = tokenSources.map((source) => source[key]);
    assert.equal(new Set(values).size, values.length, `${key} must be unique`);
  }
});

test('foundation token sets are synced in the same batch as components', () => {
  const files = new Set(tokenSources.map((source) => source.file));
  for (const required of [
    'ElevationTokens.kt',
    'ShapeKeyTokens.kt',
    'ShapeTokens.kt',
    'TypeScaleTokens.kt',
    'TypefaceTokens.kt',
    'TypographyKeyTokens.kt',
    'TypographyTokens.kt',
    'StateTokens.kt',
    'StandardMotionTokens.kt',
    'ExpressiveMotionTokens.kt',
    'MotionSchemeKeyTokens.kt',
    'MotionTokens.kt',
  ]) {
    assert.ok(files.has(required), `${required} must be part of the sync batch`);
  }
});
