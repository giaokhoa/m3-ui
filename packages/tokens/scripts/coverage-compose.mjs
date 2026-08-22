import { readFile } from 'node:fs/promises';
const coverage = JSON.parse(await readFile(new URL('../audit/compose-coverage.json', import.meta.url), 'utf8'));
const { reconciled, excluded, pending, all } = coverage.counts;
console.log(`Compose token coverage: reconciled=${reconciled} excluded=${excluded} pending=${pending} all=${all}`);
if (pending > 0) {
  console.log('Pending token files:');
  for (const file of coverage.pending) console.log(`- ${file}`);
}
if (process.argv.includes('--require-complete') && pending > 0) process.exitCode = 1;
