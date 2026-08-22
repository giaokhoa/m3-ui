import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const snapshot = JSON.parse(
  await readFile(new URL('../audit/material-web-generated.json', import.meta.url), 'utf8'),
);
const indexUrl = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_index.scss`;
const response = await fetch(indexUrl, {
  headers: { 'user-agent': 'm3-ui-token-inventory' },
});
if (!response.ok) throw new Error(`Failed to inventory Material Web tokens: ${response.status}`);

const index = await response.text();
const forwards = [...index.matchAll(/@forward\s+['"]([^'"]+)['"]/g)].map((match) => match[1]).sort();
const components = forwards.filter((name) => name.startsWith('md-comp-'));
const systems = forwards.filter((name) => name.startsWith('md-sys-'));
const references = forwards.filter((name) => name.startsWith('md-ref-'));
const other = forwards.filter(
  (name) => !name.startsWith('md-comp-') && !name.startsWith('md-sys-') && !name.startsWith('md-ref-'),
);

function digest(values) {
  return createHash('sha256').update(values.join('\n')).digest('hex');
}

const report = {
  source: {
    repository: source.repository,
    revision: source.revision,
    revisionAt: source.revisionAt,
    generatedVersion: source.latestGeneratedVersion,
    root: source.latestGeneratedRoot,
  },
  counts: {
    allForwards: forwards.length,
    componentModules: components.length,
    systemModules: systems.length,
    referenceModules: references.length,
    otherModules: other.length,
  },
  digests: {
    allForwards: digest(forwards),
    components: digest(components),
    systems: digest(systems),
    references: digest(references),
    other: digest(other),
  },
  components,
  systems,
  references,
  other,
};

console.log(JSON.stringify(report, null, 2));

const sourceMatches =
  snapshot.source.repository === report.source.repository &&
  snapshot.source.revision === report.source.revision &&
  snapshot.source.generatedVersion === report.source.generatedVersion &&
  snapshot.source.root === report.source.root;
const countsMatch = JSON.stringify(snapshot.counts) === JSON.stringify(report.counts);
const digestsMatch = JSON.stringify(snapshot.digests) === JSON.stringify(report.digests);

if (!sourceMatches || !countsMatch || !digestsMatch) {
  console.error('Pinned Material Web generated-module inventory drifted from the reviewed snapshot.');
  process.exitCode = 1;
}
