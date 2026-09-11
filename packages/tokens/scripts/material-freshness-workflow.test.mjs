import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../../../.github/workflows/material-freshness.yml', import.meta.url);
const workflow = await readFile(workflowUrl, 'utf8');
const rootPackage = JSON.parse(
  await readFile(new URL('../../../package.json', import.meta.url), 'utf8'),
);
const pnpmVersion = rootPackage.packageManager.replace(/^pnpm@/, '');

test('Material freshness workflow is scheduled, manual, and read-only', () => {
  assert.match(
    workflow,
    /^on:\n  schedule:\n    - cron: '17 7 \* \* 1'\n  workflow_dispatch:\n/m,
  );
  assert.match(workflow, /^permissions:\n  contents: read\n/m);
  assert.doesNotMatch(workflow, /^    env:\n      GITHUB_TOKEN:/m);
  assert.match(
    workflow,
    /- name: Probe relevant upstream freshness\n        env:\n          GITHUB_TOKEN: \$\{\{ github\.token \}\}\n        run: pnpm --filter @m3-ui\/tokens freshness:upstream/,
  );
  assert.doesNotMatch(workflow, /^\s+pull_request:/m);
  assert.doesNotMatch(workflow, /^\s+push:/m);
});

test('Material freshness workflow invokes only the focused upstream probe', () => {
  assert.match(
    workflow,
    /run: pnpm --filter @m3-ui\/tokens freshness:upstream/,
  );
  assert.doesNotMatch(workflow, /pnpm install/);
  assert.doesNotMatch(workflow, /pnpm build/);
  assert.doesNotMatch(workflow, /visual regression/i);
  assert.doesNotMatch(workflow, /docs chromium/i);
  assert.doesNotMatch(workflow, /conformance/i);
});

test('Material freshness workflow follows pinned repository runtime setup without dependency installation', () => {
  assert.match(workflow, /uses: actions\/checkout@[0-9a-f]{40} # v[^\n]+/i);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /uses: pnpm\/action-setup@[0-9a-f]{40} # v[^\n]+/i);
  assert.ok(
    workflow.includes(`version: ${pnpmVersion}`),
    `freshness workflow pnpm version must match packageManager (${rootPackage.packageManager})`,
  );
  assert.match(workflow, /uses: actions\/setup-node@[0-9a-f]{40} # v[^\n]+/i);
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /timeout-minutes: 10/);
});
