import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandStyleSources } from './generated-style-dependencies.mjs';
import { styleEntries } from './style-entries.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(packageRoot, 'dist/styles');

function header(name, sources) {
  return [
    `/* @m3-ui/ui modular styles: ${name}`,
    ' * Self-contained entry generated from source CSS.',
    ` * Sources: ${sources.join(', ')}`,
    ' */',
    '',
  ].join('\n');
}

await mkdir(outputRoot, { recursive: true });

for (const [name, sources] of Object.entries(styleEntries)) {
  const expandedSources = expandStyleSources(sources);
  const chunks = [];
  for (const source of expandedSources) {
    const content = await readFile(resolve(packageRoot, source), 'utf8');
    chunks.push(`/* ${source} */\n${content.trim()}\n`);
  }

  const output = `${header(name, expandedSources)}${chunks.join('\n')}`;
  await writeFile(resolve(outputRoot, `${name}.css`), output, 'utf8');
}

console.log(`Built ${Object.keys(styleEntries).length} modular style entries.`);
