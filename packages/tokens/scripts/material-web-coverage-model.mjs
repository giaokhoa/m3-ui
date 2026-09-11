import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';

const inventoryUrl = new URL('../audit/material-web-generated.json', import.meta.url);
const manifestUrl = new URL('../audit/material-web-coverage.json', import.meta.url);

function digest(values) {
  return createHash('sha256').update([...values].sort().join('\n')).digest('hex');
}

export async function loadMaterialWebCoverage() {
  const inventory = JSON.parse(await readFile(inventoryUrl, 'utf8'));
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const groups = manifest.groups ?? [];
  const componentEntries = groups.flatMap((group) =>
    (group.sources ?? []).map((source) => ({ source, group })),
  );
  const outsideEntries = manifest.outsideComponentDenominator ?? [];

  const seen = new Set();
  const duplicates = [];
  for (const { source, group } of componentEntries) {
    if (seen.has(source)) duplicates.push({ family: group.family, source });
    seen.add(source);
  }

  const invalid = [];
  for (const group of groups) {
    if (!group.family || !['reconciled', 'excluded'].includes(group.status)) {
      invalid.push({ family: group.family ?? null, reason: 'invalid status/family' });
      continue;
    }
    if (group.status === 'reconciled' && !(group.canonical?.length > 0)) {
      invalid.push({ family: group.family, reason: 'reconciled group has no canonical artifact' });
    }
    if (group.status === 'excluded' && !group.reason) {
      invalid.push({ family: group.family, reason: 'excluded group has no reason' });
    }
  }
  for (const entry of outsideEntries) {
    if (entry.status !== 'excluded' || !entry.reason) {
      invalid.push({ family: entry.source ?? null, reason: 'outside-denominator alias must be explicitly excluded with reason' });
    }
  }

  const componentSources = componentEntries.map(({ source }) => source);
  const outsideSources = outsideEntries.map(({ source }) => source);
  const componentSetMatches =
    componentSources.length === inventory.counts.componentModules &&
    digest(componentSources) === inventory.digests.components;
  const outsideSetMatches =
    outsideSources.length === inventory.counts.otherModules &&
    digest(outsideSources) === inventory.digests.other;

  const reconciled = groups.filter((group) => group.status === 'reconciled');
  const excluded = groups.filter((group) => group.status === 'excluded');
  const counts = {
    reconciled: reconciled.reduce((sum, group) => sum + group.sources.length, 0),
    excluded: excluded.reduce((sum, group) => sum + group.sources.length, 0),
    classified: componentSources.length,
    all: inventory.counts.componentModules,
    outsideExcluded: outsideEntries.length,
  };

  return {
    inventory,
    manifest,
    groups,
    reconciled,
    excluded,
    duplicates,
    invalid,
    componentSetMatches,
    outsideSetMatches,
    counts,
  };
}

export async function assertMaterialWebCanonicalArtifacts(coverage) {
  for (const group of coverage.reconciled) {
    for (const canonicalFile of group.canonical ?? []) {
      await access(new URL(`../${canonicalFile}`, import.meta.url));
    }
  }
}
