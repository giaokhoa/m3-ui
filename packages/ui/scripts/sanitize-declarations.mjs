import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(packageRoot, 'dist');
const cssSideEffectImport = /^import\s+['"][^'"]+\.css['"];\s*$/;

let removedImports = 0;
for (const relativePath of await readdir(distRoot, { recursive: true })) {
  if (!relativePath.endsWith('.d.ts')) continue;
  const filePath = resolve(distRoot, relativePath);
  const source = await readFile(filePath, 'utf8');
  const lines = source.split('\n');
  const kept = lines.filter((line) => {
    if (!cssSideEffectImport.test(line)) return true;
    removedImports += 1;
    return false;
  });
  const output = kept.join('\n');
  if (output !== source) await writeFile(filePath, output, 'utf8');
}

await writeFile(resolve(distRoot, 'css.d.ts'), 'export {};\n', 'utf8');
console.log(`Removed ${removedImports} CSS-only imports from declaration output.`);
