import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);
const uiSourceRoot = new URL('../ui/src/', packageRoot);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(new URL(`${entry.name}/`, directory))));
    } else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(url);
    }
  }

  return files;
}

test('handwritten token runtime and upstream-sync layers stay deleted', async () => {
  await assert.rejects(access(new URL('src/', packageRoot)));
  await assert.rejects(access(new URL('scripts/compose-sync/', repoRoot)));

  const rootManifest = JSON.parse(
    await readFile(new URL('package.json', repoRoot), 'utf8'),
  );
  for (const [name, command] of Object.entries(rootManifest.scripts ?? {})) {
    assert.doesNotMatch(
      `${name} ${command}`,
      /compose:sync|scripts\/compose-sync/,
      `root script ${name} must not resurrect the legacy sync pipeline`,
    );
  }
});

test('Style Dictionary reads only canonical DTCG and emits only typed JS artifacts', async () => {
  const configUrl = new URL('style-dictionary.config.mjs', packageRoot);
  const { default: config } = await import(
    `${configUrl.href}?architecture=${Date.now()}`
  );

  assert.deepEqual(config.source, ['tokens/**/*.json']);
  assert.equal(
    Object.hasOwn(config, 'include'),
    false,
    'upstream references must never be Style Dictionary includes',
  );
  assert.deepEqual(
    Object.keys(config.platforms),
    ['js'],
    'generic CSS-variable platforms are forbidden',
  );
});

test('package exposes only the Style Dictionary generated root API', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('package.json', packageRoot), 'utf8'),
  );

  assert.equal(manifest.main, './dist/generated/tokens.js');
  assert.equal(manifest.module, './dist/generated/tokens.js');
  assert.equal(manifest.types, './dist/generated/tokens.d.ts');
  assert.deepEqual(Object.keys(manifest.exports), ['.']);
  assert.equal(manifest.exports['.'].import, './dist/generated/tokens.js');
  assert.equal(manifest.exports['.'].types, './dist/generated/tokens.d.ts');
  assert.doesNotMatch(manifest.scripts.build, /\btsc\b/);
  assert.equal(Object.hasOwn(manifest.scripts, 'typecheck'), false);
});

test('Style Dictionary skill describes the enforced token ownership boundary', async () => {
  const skill = await readFile(
    new URL('.agents/skills/style-dictionary/SKILL.md', repoRoot),
    'utf8',
  );

  assert.match(skill, /no handwritten runtime `src\/` layer/i);
  assert.match(skill, /Do not create `packages\/tokens\/src\/`/);
  assert.match(skill, /runtime projections\/types belong beside their consumers in `@m3\/ui`/i);
  assert.match(skill, /If an upstream source does not own a web-only token/i);
  assert.doesNotMatch(skill, /src\/.*optional handwritten API\/types/i);
});

test('UI consumes @m3-ui/tokens through the package root only', async () => {
  for (const file of await sourceFiles(uiSourceRoot)) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(
      source,
      /['"]@m3\/tokens\//,
      `${file.pathname} must import @m3-ui/tokens through the package root`,
    );
  }
});
