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

test('Style Dictionary reads only canonical DTCG', async () => {
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
});

test('generated CSS outputs and package exports stay internally consistent', async () => {
  const configUrl = new URL('style-dictionary.config.mjs', packageRoot);
  const { default: config } = await import(
    `${configUrl.href}?exports=${Date.now()}`
  );
  const manifest = JSON.parse(
    await readFile(new URL('package.json', packageRoot), 'utf8'),
  );

  assert.equal(manifest.main, './dist/generated/tokens.js');
  assert.equal(manifest.module, './dist/generated/tokens.js');
  assert.equal(manifest.types, './dist/generated/tokens.d.ts');

  for (const file of config.platforms.css?.files ?? []) {
    const exportName = `./${file.destination}`;
    assert.equal(
      manifest.exports?.[exportName],
      `./dist/generated/${file.destination}`,
      `generated CSS ${file.destination} must be exported at ${exportName}`,
    );
  }
});

test('UI token CSS subpath imports resolve through package exports', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('package.json', packageRoot), 'utf8'),
  );
  const exportedSubpaths = new Set(
    Object.keys(manifest.exports ?? {})
      .filter((specifier) => specifier.endsWith('.css'))
      .map((specifier) => `@m3-ui/tokens/${specifier.slice(2)}`),
  );

  for (const file of await sourceFiles(uiSourceRoot)) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/['"](@m3-ui\/tokens\/[^'"]+\.css)['"]/g)].map(
      (match) => match[1],
    );
    for (const specifier of imports) {
      assert.ok(
        exportedSubpaths.has(specifier),
        `${file.pathname} imports unexported token CSS subpath ${specifier}`,
      );
    }
  }
});
