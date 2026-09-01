import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildLiveExampleModel, stableLiveExampleJson } from './live-examples.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const registryPath = resolve(appDir, 'src/liveExamples.tsx');

test('live example source is derived deterministically from the rendered TSX component', () => {
  const model = buildLiveExampleModel({
    sourcePath: registryPath,
    repoRoot: resolve(appDir, '../..'),
  });
  const example = model.examples['button-basic'];

  assert.ok(example);
  assert.match(example.source, /import \{ Button \} from '@m3-ui\/ui';/);
  assert.match(example.source, /export function ButtonBasicLiveExample\(\)/);
  assert.match(example.source, /<Button>Save changes<\/Button>/);
  assert.equal(stableLiveExampleJson(model), stableLiveExampleJson(model));
});

test('changing the rendered component changes generated source without a second snippet', () => {
  const directory = mkdtempSync(join(tmpdir(), 'm3-ui-live-example-'));
  try {
    const sourcePath = join(directory, 'liveExamples.tsx');
    const original = readFileSync(registryPath, 'utf8');
    writeFileSync(sourcePath, original.replace('Save changes', 'Save profile'));

    const model = buildLiveExampleModel({ sourcePath, repoRoot: directory });
    assert.match(model.examples['button-basic'].source, /Save profile/);
    assert.doesNotMatch(model.examples['button-basic'].source, /Save changes/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('MDX fixture uses the runtime registry and copy UI exposes accessible status', () => {
  const fixture = readFileSync(resolve(appDir, 'fixtures/live-example.mdx'), 'utf8');
  const runtime = readFileSync(resolve(appDir, 'src/liveExample.tsx'), 'utf8');
  const mdxRegistry = readFileSync(resolve(appDir, 'src/mdx.tsx'), 'utf8');

  assert.match(fixture, /<LiveExample example="button-basic" sourceInitiallyOpen \/>/);
  assert.doesNotMatch(fixture, /from ['"].*src\//);
  assert.match(mdxRegistry, /LiveExample,/);
  assert.match(runtime, /navigator\.clipboard\.writeText\(source\)/);
  assert.match(runtime, /role="status"/);
  assert.match(runtime, /aria-live="polite"/);
  assert.match(runtime, /aria-expanded=\{sourceOpen\}/);
});
