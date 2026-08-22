import assert from 'node:assert/strict';
import test from 'node:test';
import {
  androidX,
  isAndroidXTokenEntry,
  tokenSourceFromDirectoryEntry,
  tokenSourcesFromDirectory,
} from './manifest.mjs';

const entry = (name, sha, overrides = {}) => ({
  name,
  path: `${androidX.tokenRoot}/${name}`,
  sha,
  type: 'file',
  ...overrides,
});

test('pins exactly one immutable AndroidX revision and token directory', () => {
  assert.equal(androidX.repository, 'androidx/androidx');
  assert.match(androidX.revision, /^[0-9a-f]{40}$/);
  assert.match(androidX.tokenRoot, /material3\/tokens$/);
});

test('discovers every direct *Tokens.kt file and ignores unrelated entries', () => {
  const sources = tokenSourcesFromDirectory([
    entry('FilledButtonTokens.kt', 'a'.repeat(40)),
    entry('FabPrimaryTokens.kt', 'b'.repeat(40)),
    entry('README.md', 'c'.repeat(40)),
    entry('NestedTokens.kt', 'd'.repeat(40), { type: 'dir' }),
    entry('ElsewhereTokens.kt', 'e'.repeat(40), {
      path: 'somewhere/else/ElsewhereTokens.kt',
    }),
  ]);

  assert.deepEqual(
    sources.map((source) => source.file),
    ['FabPrimaryTokens.kt', 'FilledButtonTokens.kt'],
  );
});

test('derives output and export identity mechanically from AndroidX filename', () => {
  assert.deepEqual(
    tokenSourceFromDirectoryEntry(
      entry('ButtonXLargeTokens.kt', '1'.repeat(40)),
    ),
    {
      file: 'ButtonXLargeTokens.kt',
      path: `${androidX.tokenRoot}/ButtonXLargeTokens.kt`,
      blobSha: '1'.repeat(40),
      exportName: 'buttonXLargeTokensGenerated',
      output:
        'packages/tokens/src/generated/androidx/button-x-large.ts',
    },
  );
});

test('directory discovery sorts deterministically and validates uniqueness', () => {
  const sources = tokenSourcesFromDirectory([
    entry('SwitchTokens.kt', '2'.repeat(40)),
    entry('CheckboxTokens.kt', '3'.repeat(40)),
  ]);
  assert.deepEqual(
    sources.map((source) => source.file),
    ['CheckboxTokens.kt', 'SwitchTokens.kt'],
  );

  assert.throws(
    () =>
      tokenSourcesFromDirectory([
        entry('SwitchTokens.kt', '2'.repeat(40)),
        entry('SwitchTokens.kt', '2'.repeat(40)),
      ]),
    /not unique/,
  );
});

test('rejects invalid directory records and invalid blob SHAs', () => {
  assert.equal(isAndroidXTokenEntry(null), false);
  assert.equal(isAndroidXTokenEntry(entry('Button.kt', 'a'.repeat(40))), false);
  assert.throws(
    () => tokenSourceFromDirectoryEntry(entry('SwitchTokens.kt', 'bad')),
    /Invalid Git blob SHA/,
  );
  assert.throws(() => tokenSourcesFromDirectory([]), /No \*Tokens\.kt files/);
  assert.throws(
    () => tokenSourcesFromDirectory({}),
    /response must be an array/,
  );
});
