import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactRoot = resolve(repoRoot, process.env.M3_UI_PAGES_ARTIFACT ?? 'pages-dist');
const basePath = process.env.M3_UI_DOCS_BASE_PATH ?? '/m3-ui';
const storybookBasePath = `${basePath}/storybook/`;

assert.match(basePath, /^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/, 'Pages base path must be a root-relative path without a trailing slash');

async function mustExist(path) {
  await access(join(artifactRoot, path));
}

async function htmlFiles(dir) {
  const root = join(artifactRoot, dir);
  const out = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.name.endsWith('.html')) out.push(absolute);
    }
  }
  await walk(root);
  return out;
}

function rootAbsoluteUrls(html) {
  return [...html.matchAll(/(?:href|src)=["'](\/[^"']*)["']/g)].map((match) => match[1]);
}

await mustExist('index.html');
await mustExist('docs/index.html');
await mustExist('storybook/index.html');
await mustExist('storybook/iframe.html');
await mustExist('search-index.json');
await mustExist('.nojekyll');

const rootIndex = await readFile(join(artifactRoot, 'index.html'), 'utf8');
assert.match(
  rootIndex,
  new RegExp(`http-equiv=[\"']refresh[\"'][^>]+content=[\"']0;url=${basePath.replaceAll('/', '\\/')}\/docs\/[\"']`, 'i'),
  'Pages root must contain a static redirect to the base-path-scoped docs index',
);
assert.doesNotMatch(rootIndex, /NEXT_REDIRECT/, 'Pages root must not rely on a Next server redirect digest');

const docsHtml = await htmlFiles('docs');
assert.ok(docsHtml.length >= 2, 'expected multiple statically exported docs pages');
for (const file of docsHtml) {
  const html = await readFile(file, 'utf8');
  for (const url of rootAbsoluteUrls(html)) {
    if (url.startsWith('//')) continue;
    assert.ok(
      url === basePath || url.startsWith(`${basePath}/`) || url.startsWith('/home') || url.startsWith('/search'),
      `${relative(artifactRoot, file)} contains an unscoped root-absolute URL: ${url}`,
    );
  }
}

const docsIndex = await readFile(join(artifactRoot, 'docs/index.html'), 'utf8');
assert.match(docsIndex, new RegExp(`${basePath.replaceAll('/', '\\/')}\\/_next\\/`), 'docs export must reference Next assets under the Pages base path');

const nextChunksRoot = join(artifactRoot, '_next/static/chunks');
const nextChunkFiles = await readdir(nextChunksRoot);
let searchIndexPathFound = false;
for (const filename of nextChunkFiles) {
  if (!filename.endsWith('.js')) continue;
  const chunk = await readFile(join(nextChunksRoot, filename), 'utf8');
  if (chunk.includes(`${basePath}/search-index.json`)) searchIndexPathFound = true;
}
assert.ok(
  searchIndexPathFound,
  `client chunks must request the search index through ${basePath}/search-index.json`,
);

for (const file of await htmlFiles('storybook')) {
  const html = await readFile(file, 'utf8');
  for (const url of rootAbsoluteUrls(html)) {
    if (url.startsWith('//')) continue;
    assert.ok(
      url === storybookBasePath.slice(0, -1) || url.startsWith(storybookBasePath),
      `${relative(artifactRoot, file)} contains a Storybook root-absolute URL outside ${storybookBasePath}: ${url}`,
    );
  }
}

console.log(`Pages artifact verified at ${relative(repoRoot, artifactRoot)} for ${basePath} with ${docsHtml.length} docs HTML pages.`);
