import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createFromSource } from 'fumadocs-core/search/server';
import { loader } from 'fumadocs-core/source';
import { register } from 'fumadocs-mdx/node';

register({
  macro: {
    include: ['src/lib/source.ts'],
  },
});

const { docs } = await import('../src/lib/source.ts');
const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
const response = await createFromSource(source).staticGET();

if (!response.ok) {
  throw new Error(`Failed to export docs search index: ${response.status}`);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, '../dist/search-index.json');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, await response.text(), 'utf8');
