import { mkdir, writeFile } from 'node:fs/promises';

const distRoot = new URL('../dist/', import.meta.url);
await mkdir(distRoot, { recursive: true });
await writeFile(new URL('css.d.ts', distRoot), 'export {};\n', 'utf8');
