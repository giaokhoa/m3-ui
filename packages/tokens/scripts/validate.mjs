import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCanonicalDirectory, validateCanonical } from './dtcg.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const directory = resolve(scriptDir, '../tokens');
const source = await readCanonicalDirectory(directory);
const { errors, tokens } = validateCanonical(source);

if (errors.length > 0) {
  console.error('Canonical DTCG validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${tokens.size} canonical DTCG tokens.`);
}
