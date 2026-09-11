import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const appDir = resolve(import.meta.dirname, '..');
const serverAppDir = resolve(appDir, '.next/server/app');
const chunksDir = resolve(appDir, '.next/static/chunks');
const maxInitialJsGzipBytes = 600 * 1024;

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else files.push(path);
  }

  return files;
}

function chunkReferences(html) {
  return new Set(
    [...html.matchAll(/\/_next\/static\/chunks\/([^"?]+\.js)/g)].map(
      (match) => match[1],
    ),
  );
}

function routeForHtml(file) {
  const path = relative(serverAppDir, file).replaceAll('\\', '/');
  const withoutExtension = path.slice(0, -'.html'.length);
  return `/${withoutExtension}`;
}

const htmlFiles = (await filesUnder(serverAppDir))
  .filter((file) => {
    if (!file.endsWith('.html')) return false;
    const route = routeForHtml(file);
    return route === '/docs' || route.startsWith('/docs/');
  })
  .toSorted();

if (htmlFiles.length === 0) {
  throw new Error('No prerendered docs HTML found; run the production docs build first.');
}

const gzipBytesByChunk = new Map();
let largest = { route: '', bytes: 0 };

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  let bytes = 0;

  for (const chunkName of chunkReferences(html)) {
    let gzipBytes = gzipBytesByChunk.get(chunkName);
    if (gzipBytes === undefined) {
      const chunk = await readFile(resolve(chunksDir, chunkName));
      gzipBytes = gzipSync(chunk, { level: 9 }).byteLength;
      gzipBytesByChunk.set(chunkName, gzipBytes);
    }
    bytes += gzipBytes;
  }

  const route = routeForHtml(htmlFile);
  if (bytes > largest.bytes) largest = { route, bytes };

  if (bytes > maxInitialJsGzipBytes) {
    throw new Error(
      `${route} references ${bytes.toLocaleString()} B gzip of initial JavaScript, ` +
        `exceeding the ${maxInitialJsGzipBytes.toLocaleString()} B docs budget.`,
    );
  }
}

console.log(
  `[docs] initial JavaScript budget passed for ${htmlFiles.length} pages; ` +
    `largest is ${largest.route} at ${largest.bytes.toLocaleString()} B gzip ` +
    `(budget ${maxInitialJsGzipBytes.toLocaleString()} B).`,
);
