import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = join(repoRoot, '.github/workflows');
const workflowFiles = (await readdir(workflowDir))
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const allowedTokenSteps = new Map([
  ['ci.yml', new Set(['Inventory pinned Compose token source'])],
  ['material-freshness.yml', new Set(['Probe relevant upstream freshness'])],
  ['release-dry-run.yml', new Set()],
]);

let checkoutCount = 0;
let tokenCount = 0;

for (const filename of workflowFiles) {
  const text = await readFile(join(workflowDir, filename), 'utf8');
  const lines = text.split(/\r?\n/);
  const steps = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)-\s+name:\s*(.+?)\s*$/);
    if (!match) continue;
    const indent = match[1].length;
    let end = lines.length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const next = lines[cursor].match(/^(\s*)-\s+name:\s*(.+?)\s*$/);
      if (next && next[1].length <= indent) {
        end = cursor;
        break;
      }
    }
    steps.push({ name: match[2], start: index, end, indent });
  }

  for (const step of steps) {
    const block = lines.slice(step.start, step.end).join('\n');
    if (/uses:\s*actions\/checkout@[0-9a-f]{40}\b/i.test(block)) {
      checkoutCount += 1;
      assert.match(
        block,
        /persist-credentials:\s*false\b/,
        `${filename} step "${step.name}" must set persist-credentials: false`,
      );
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*(GITHUB_TOKEN|GH_TOKEN):\s*(.+?)\s*$/);
    if (!match) continue;
    tokenCount += 1;
    const step = steps.find(({ start, end }) => index > start && index < end);
    assert.ok(step, `${filename}:${index + 1} GitHub token must be scoped to an individual step`);

    const allowed = allowedTokenSteps.get(filename) ?? new Set();
    assert.equal(
      allowed.has(step.name),
      true,
      `${filename} step "${step.name}" is not allowlisted to receive ${match[1]}`,
    );
    assert.equal(match[1], 'GITHUB_TOKEN', `${filename} must use only the audited GITHUB_TOKEN variable`);
    assert.equal(
      match[2],
      '${{ github.token }}',
      `${filename} step "${step.name}" must use only github.token`,
    );
  }
}

assert.ok(checkoutCount > 0, 'expected at least one checkout step');
assert.equal(tokenCount, 2, 'exactly two audited workflow steps may receive GITHUB_TOKEN');

console.log(
  `GitHub Actions credential guard passed for ${checkoutCount} checkout steps and ${tokenCount} scoped token exposures across ${workflowFiles.length} workflows.`,
);
