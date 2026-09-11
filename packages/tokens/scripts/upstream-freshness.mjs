import { appendFile } from 'node:fs/promises';
import { material3Sources } from './sources.mjs';
import {
  freshnessExitCode,
  probeMaterialFreshness,
  renderFreshnessSummary,
} from './upstream-freshness-lib.mjs';

const githubToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'm3-ui-material-freshness',
  ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}),
};

const report = await probeMaterialFreshness({ sources: material3Sources, headers });
console.log(JSON.stringify(report, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, renderFreshnessSummary(report), 'utf8');
}

process.exitCode = freshnessExitCode(report);
