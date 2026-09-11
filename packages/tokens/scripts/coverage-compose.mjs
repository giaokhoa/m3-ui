import { loadComposeCoverage } from './compose-coverage-model.mjs';
const coverage = await loadComposeCoverage();
const { reconciled, excluded, pending, all } = coverage.counts;
console.log(`Compose token coverage: reconciled=${reconciled} excluded=${excluded} pending=${pending} all=${all}`);
if (coverage.duplicates.length > 0 || coverage.unknown.length > 0) {
  console.error(JSON.stringify({ duplicates: coverage.duplicates, unknown: coverage.unknown }, null, 2));
  process.exitCode = 1;
}
if (pending > 0) {
  console.log('Pending token files:');
  for (const file of coverage.pending) console.log(`- ${file}`);
}
if (process.argv.includes('--require-complete') && pending > 0) process.exitCode = 1;
