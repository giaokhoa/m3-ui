import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = join(repoRoot, '.github/workflows');
const workflowFiles = (await readdir(workflowDir))
  .filter((name) => /\.ya?ml$/i.test(name))
  .sort();

const remoteUses = [];
for (const filename of workflowFiles) {
  const text = await readFile(join(workflowDir, filename), 'utf8');
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/);
    if (!match) continue;
    const spec = match[1];
    if (spec.startsWith('./') || spec.startsWith('docker://')) continue;
    remoteUses.push({ filename, line: index + 1, spec });
  }
}

assert.ok(remoteUses.length > 0, 'expected at least one remote GitHub Action use');
for (const { filename, line, spec } of remoteUses) {
  const at = spec.lastIndexOf('@');
  assert.ok(at > 0, `${filename}:${line} remote action must include an immutable ref: ${spec}`);
  const ref = spec.slice(at + 1);
  assert.match(
    ref,
    /^[0-9a-f]{40}$/i,
    `${filename}:${line} remote action must be pinned to a full 40-character commit SHA: ${spec}`,
  );
}

console.log(`GitHub Actions pin guard passed for ${remoteUses.length} remote action uses across ${workflowFiles.length} workflows.`);
