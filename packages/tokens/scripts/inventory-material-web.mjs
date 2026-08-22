import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const indexUrl = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_index.scss`;
const response = await fetch(indexUrl, {
  headers: { 'user-agent': 'm3-ui-token-inventory' },
});
if (!response.ok) throw new Error(`Failed to inventory Material Web tokens: ${response.status}`);

const index = await response.text();
const forwards = [...index.matchAll(/@forward\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);
const components = forwards.filter((name) => name.startsWith('md-comp-')).sort();
const systems = forwards.filter((name) => name.startsWith('md-sys-')).sort();
const references = forwards.filter((name) => name.startsWith('md-ref-')).sort();
const other = forwards
  .filter((name) => !name.startsWith('md-comp-') && !name.startsWith('md-sys-') && !name.startsWith('md-ref-'))
  .sort();

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
  components,
  systems,
  references,
  other,
};

console.log(JSON.stringify(report, null, 2));
