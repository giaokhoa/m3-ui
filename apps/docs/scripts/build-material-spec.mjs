import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildMaterialSpecModel,
  defaultRepositoryRoot,
  stableMaterialSpecJson,
} from './material-spec.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const outputPath = resolve(
  appDir,
  process.argv[2] ?? 'src/generated/material-spec.generated.json',
);
const model = await buildMaterialSpecModel({ repoRoot: defaultRepositoryRoot() });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, stableMaterialSpecJson(model), 'utf8');

console.log(
  `[docs] generated ${Object.keys(model.families).length} Material spec families -> ${outputPath}`,
);
