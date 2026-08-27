import { readFile } from 'node:fs/promises';
import { material3Sources } from './sources.mjs';

const source = material3Sources.compose;
const snapshot = JSON.parse(
  await readFile(new URL('../audit/compose-token-files.json', import.meta.url), 'utf8'),
);
const url = `https://api.github.com/repos/${source.repository}/contents/${source.tokenRoot}?ref=${source.revision}`;
const githubToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const response = await fetch(url, {
  headers: {
    accept: 'application/vnd.github+json',
    'user-agent': 'm3-ui-token-inventory',
    ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}),
  },
});
if (!response.ok) throw new Error(`Failed to inventory Compose tokens: ${response.status}`);

const entries = await response.json();
const files = entries
  .filter((entry) => entry.type === 'file' && /Tokens\.kt$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const foundation = new Set(snapshot.foundation);
const foundationFiles = files.filter((file) => foundation.has(file));
const componentFiles = files.filter((file) => !foundation.has(file));
const missingExpectedFoundation = snapshot.foundation.filter((file) => !files.includes(file));
const expectedFiles = [...snapshot.foundation, ...snapshot.components].sort();
const addedSinceSnapshot = files.filter((file) => !expectedFiles.includes(file));
const missingSinceSnapshot = expectedFiles.filter((file) => !files.includes(file));

const report = {
  source: {
    repository: source.repository,
    revision: source.revision,
    revisionAt: source.revisionAt,
  },
  counts: {
    all: files.length,
    foundation: foundationFiles.length,
    component: componentFiles.length,
  },
  foundation: foundationFiles,
  components: componentFiles,
  missingExpectedFoundationFiles: missingExpectedFoundation,
  snapshotDrift: {
    added: addedSinceSnapshot,
    missing: missingSinceSnapshot,
  },
};

console.log(JSON.stringify(report, null, 2));
if (
  source.revision !== snapshot.source.revision ||
  missingExpectedFoundation.length > 0 ||
  addedSinceSnapshot.length > 0 ||
  missingSinceSnapshot.length > 0
) {
  process.exitCode = 1;
}
