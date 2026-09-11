import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildApiReferenceModel,
  defaultRepositoryRoot,
  stableApiReferenceJson,
} from './api-reference.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const outputPath = resolve(
  appDir,
  process.argv[2] ?? 'src/generated/api-reference.generated.json',
);
const model = buildApiReferenceModel({ repoRoot: defaultRepositoryRoot() });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, stableApiReferenceJson(model), 'utf8');

console.log(
  `[docs] generated ${Object.keys(model.exports).length} public API entries -> ${outputPath}`,
);
