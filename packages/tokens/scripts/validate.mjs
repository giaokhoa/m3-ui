import { resolve } from 'node:path';
import { readCanonical, validateCanonical } from './dtcg.mjs';

const path = resolve('packages/tokens/tokens/m3.json');
const source = await readCanonical(path);
const { errors, tokens } = validateCanonical(source);

if (errors.length > 0) {
  console.error('Canonical DTCG validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${tokens.size} canonical DTCG tokens.`);
}
