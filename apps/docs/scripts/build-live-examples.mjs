import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLiveExampleModel, stableLiveExampleJson } from './live-examples.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const sourcePath = resolve(appDir, 'src/liveExamples.tsx');
const outputPath = resolve(
  appDir,
  process.argv[2] ?? 'src/generated/live-examples.generated.json',
);
const model = buildLiveExampleModel({ sourcePath, repoRoot: resolve(appDir, '../..') });

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, stableLiveExampleJson(model), 'utf8');

console.log(
  `[docs] generated ${Object.keys(model.examples).length} live example sources -> ${outputPath}`,
);
