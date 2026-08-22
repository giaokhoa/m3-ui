import { access, readdir, readFile } from 'node:fs/promises';

const inventoryUrl = new URL('../audit/compose-token-files.json', import.meta.url);
const coverageDir = new URL('../audit/compose-coverage/', import.meta.url);

export async function loadComposeCoverage() {
  const inventory = JSON.parse(await readFile(inventoryUrl, 'utf8'));
  const manifestFiles = (await readdir(coverageDir)).filter((file) => file.endsWith('.json')).sort();
  const manifests = await Promise.all(manifestFiles.map(async (file) => ({ file, value: JSON.parse(await readFile(new URL(file, coverageDir), 'utf8')) })));
  const allSourceFiles = [...inventory.foundation, ...inventory.components];
  const sourceSet = new Set(allSourceFiles);
  const duplicates = [];
  const unknown = [];
  const seen = new Set();

  for (const { file, value } of manifests) {
    for (const sourceFile of value.sources ?? []) {
      if (!sourceSet.has(sourceFile)) unknown.push({ file, sourceFile });
      if (seen.has(sourceFile)) duplicates.push({ file, sourceFile });
      seen.add(sourceFile);
    }
  }

  const pending = allSourceFiles.filter((file) => !seen.has(file));
  const reconciled = manifests.filter(({ value }) => value.status === 'reconciled');
  const excluded = manifests.filter(({ value }) => value.status === 'excluded');
  return {
    inventory, manifests, reconciled, excluded, pending, duplicates, unknown,
    counts: {
      reconciled: reconciled.reduce((sum, { value }) => sum + value.sources.length, 0),
      excluded: excluded.reduce((sum, { value }) => sum + value.sources.length, 0),
      pending: pending.length,
      all: allSourceFiles.length,
    },
  };
}

export async function assertCanonicalArtifacts(manifest) {
  for (const canonicalFile of manifest.canonical ?? []) await access(new URL(`../${canonicalFile}`, import.meta.url));
}
