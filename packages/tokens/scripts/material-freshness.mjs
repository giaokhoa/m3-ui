import {
  material3Sources,
  materialFreshnessScopes,
} from './sources.mjs';
import {
  createMaterialFreshnessReport,
  materialFreshnessExitCode,
} from './material-freshness-lib.mjs';

const githubToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const report = await createMaterialFreshnessReport({
  sources: material3Sources,
  scopes: materialFreshnessScopes,
  token: githubToken,
});

console.log(JSON.stringify(report, null, 2));
process.exitCode = materialFreshnessExitCode(report);
