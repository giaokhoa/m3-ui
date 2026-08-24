import { loadComposeCoverage } from './compose-coverage-model.mjs';
import {
  assertMaterialWebCanonicalArtifacts,
  loadMaterialWebCoverage,
} from './material-web-coverage-model.mjs';

const compose = await loadComposeCoverage();
const web = await loadMaterialWebCoverage();

const composeClassified = compose.counts.reconciled + compose.counts.excluded;
const webClassified = web.counts.reconciled + web.counts.excluded;
const classified = composeClassified + webClassified;
const all = compose.counts.all + web.counts.all;
const pending = compose.counts.pending + (web.counts.all - web.counts.classified);
const structurallyValid =
  compose.duplicates.length === 0 &&
  compose.unknown.length === 0 &&
  web.duplicates.length === 0 &&
  web.invalid.length === 0 &&
  web.componentSetMatches &&
  web.outsideSetMatches;

try {
  await assertMaterialWebCanonicalArtifacts(web);
} catch (error) {
  console.error(`Missing canonical artifact: ${error.message}`);
  process.exitCode = 1;
}

const percent = all === 0 ? 100 : (classified / all) * 100;
console.log(
  `Material 3 union module coverage: classified=${classified} all=${all} ` +
    `pending=${pending} coverage=${percent.toFixed(2)}%`,
);
console.log(
  `Disposition: compose(reconciled=${compose.counts.reconciled}, excluded=${compose.counts.excluded}) ` +
    `web(reconciled=${web.counts.reconciled}, excluded=${web.counts.excluded}, outsideExcluded=${web.counts.outsideExcluded})`,
);

if (!structurallyValid) {
  console.error('Union coverage is structurally invalid; inspect Compose/Web coverage manifests.');
  process.exitCode = 1;
}
if (process.argv.includes('--require-complete') && (classified !== all || pending !== 0)) {
  process.exitCode = 1;
}
