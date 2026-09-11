import {
  assertMaterialWebCanonicalArtifacts,
  loadMaterialWebCoverage,
} from './material-web-coverage-model.mjs';

const coverage = await loadMaterialWebCoverage();
const { reconciled, excluded, classified, all, outsideExcluded } = coverage.counts;
const complete =
  coverage.componentSetMatches &&
  coverage.outsideSetMatches &&
  coverage.duplicates.length === 0 &&
  coverage.invalid.length === 0 &&
  classified === all;

console.log(
  `Material Web module coverage: reconciled=${reconciled} excluded=${excluded} ` +
    `classified=${classified} all=${all} outsideExcluded=${outsideExcluded}`,
);

if (!coverage.componentSetMatches || !coverage.outsideSetMatches) {
  console.error('Material Web coverage manifest does not match the pinned generated-module digests.');
}
if (coverage.duplicates.length > 0 || coverage.invalid.length > 0) {
  console.error(JSON.stringify({ duplicates: coverage.duplicates, invalid: coverage.invalid }, null, 2));
}

try {
  await assertMaterialWebCanonicalArtifacts(coverage);
} catch (error) {
  console.error(`Missing canonical artifact: ${error.message}`);
  process.exitCode = 1;
}

if (process.argv.includes('--require-complete') && !complete) process.exitCode = 1;
