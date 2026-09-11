import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../../../.github/workflows/material-freshness.yml', import.meta.url);
const workflow = await readFile(workflowUrl, 'utf8');

test('Material freshness workflow is scheduled, manual, and read-only', () => {
  assert.match(
    workflow,
    /^on:\n  schedule:\n    - cron: '17 7 \\* \\* 1'\n  workflow_dispatch:\n/m,
  );
  assert.match(workflow, /^permissions:\n  contents: read\n/m);
  assert.match(workflow, /GITHUB_TOKEN: \\$\\{\\{ github\\.token \\}\\}/);
  assert.doesNotMatch(workflow, /^\\s+pull_request:/m);
  assert.doesNotMatch(workflow, /^\\s+push:/m);
});

test('Material freshness workflow invokes only the focused upstream probe', () => {
  assert.match(
    workflow,
    /run: pnpm --filter @m3-ui\\/tokens freshness:upstream/,
  );
  assert.doesNotMatch(workflow, /pnpm install/);
  assert.doesNotMatch(workflow, /pnpm build/);
  assert.doesNotMatch(workflow, /visual regression/i);
  assert.doesNotMatch(workflow, /docs chromium/i);
  assert.doesNotMatch(workflow, /conformance/i);
});

test('Material freshness workflow follows pinned repository runtime setup without dependency installation', () => {
  assert.match(
    workflow,
    /uses: actions\\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7/,
  );
  assert.match(
    workflow,
    /uses: pnpm\\/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6/,
  );
  assert.match(workflow, /version: 10\\.0\\.0/);
  assert.match(
    workflow,
    /uses: actions\\/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7/,
  );
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /timeout-minutes: 10/);
});
