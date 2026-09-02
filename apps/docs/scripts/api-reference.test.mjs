import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  buildApiReferenceModel,
  defaultRepositoryRoot,
  requirePublicApiExport,
  stableApiReferenceJson,
} from './api-reference.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = defaultRepositoryRoot();

let cachedModel;
function model() {
  cachedModel ??= buildApiReferenceModel({ repoRoot });
  return cachedModel;
}

test('extracts only exports reachable from the public @m3-ui/ui entrypoint', () => {
  const api = model();
  const button = requirePublicApiExport(api, 'Button');

  assert.equal(button.name, 'Button');
  assert.ok(button.signatures.some((signature) => signature.startsWith('Button(')));
  assert.ok(button.props.some((property) => property.name === 'startIcon'));
  assert.ok(button.props.some((property) => property.name === 'onPress'));
  assert.ok(api.exports.ButtonShapes);
  assert.equal(api.exports.ButtonStyleOptions, undefined);
});

test('missing or renamed exports fail loudly', () => {
  assert.throws(
    () => requirePublicApiExport(model(), 'DefinitelyNotAPublicExport'),
    /Unknown public @m3-ui\/ui export/,
  );
});

test('API output is deterministic and does not leak absolute workspace paths', () => {
  const first = stableApiReferenceJson(model());
  const second = stableApiReferenceJson(buildApiReferenceModel({ repoRoot }));

  assert.equal(first, second);
  assert.equal(first.includes(resolve(repoRoot)), false);
});

test('MDX fixture embeds ApiReference through the shared runtime registry', async () => {
  const fixture = await readFile(resolve(scriptDir, 'fixtures/api-reference.mdx'), 'utf8');
  const serverRegistry = await readFile(resolve(scriptDir, '../src/mdx.tsx'), 'utf8');
  const clientRegistry = await readFile(resolve(scriptDir, '../src/mdx-client.tsx'), 'utf8');

  assert.match(fixture, /<ApiReference name="Button" \/>/);
  assert.doesNotMatch(fixture, /^\s*import\s/m);
  assert.match(serverRegistry, /ApiReference: clientComponent\('ApiReference'\)/);
  assert.match(clientRegistry, /import \{ ApiReference \} from '\.\/apiReference';/);
  assert.match(clientRegistry, /\bApiReference,\s*\n/);
});
