import { resolve } from 'node:path';
import { readCanonical, resolveTokenValues, validateCanonical } from './dtcg.mjs';
import { compareTokenGraph, hasAuditDrift, summarizeAudit } from './audit.mjs';
import { androidX, tokenSources } from '../../../scripts/compose-sync/manifest.mjs';
import { parseAndroidXTokenFile } from '../../../scripts/compose-sync/parser.mjs';

const canonicalPath = resolve('packages/tokens/tokens/m3.json');
const canonical = await readCanonical(canonicalPath);
const validation = validateCanonical(canonical);
if (validation.errors.length > 0) {
  throw new Error(`Canonical source is invalid:\n${validation.errors.join('\n')}`);
}
const canonicalValues = resolveTokenValues(validation.tokens);

const sourceNames = new Set(['ElevationTokens.kt', 'StateTokens.kt', 'SwitchTokens.kt']);
const sources = tokenSources.filter((source) => sourceNames.has(source.file));
const referenceValues = new Map();

for (const source of sources) {
  const url = `https://raw.githubusercontent.com/${androidX.repository}/${androidX.revision}/${source.path}`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-token-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${source.file}: ${response.status}`);
  const parsed = parseAndroidXTokenFile(await response.text(), source.path);
  for (const [name, value] of Object.entries(parsed.tokens)) {
    const normalized = value && typeof value === 'object' && Object.hasOwn(value, 'value')
      ? value.value
      : value;
    referenceValues.set(`${source.file}:${name}`, normalized);
  }
}

const mappings = [
  ...Array.from({ length: 6 }, (_, level) => ({
    canonical: `elevation.level${level}`,
    reference: `ElevationTokens.kt:level${level}`,
  })),
  { canonical: 'state.layer.opacity.dragged', reference: 'StateTokens.kt:draggedStateLayerOpacity' },
  { canonical: 'state.layer.opacity.focus', reference: 'StateTokens.kt:focusStateLayerOpacity' },
  { canonical: 'state.layer.opacity.hover', reference: 'StateTokens.kt:hoverStateLayerOpacity' },
  { canonical: 'state.layer.opacity.pressed', reference: 'StateTokens.kt:pressedStateLayerOpacity' },
  { canonical: 'component.switch.track.width', reference: 'SwitchTokens.kt:trackWidth' },
  { canonical: 'component.switch.track.height', reference: 'SwitchTokens.kt:trackHeight' },
  { canonical: 'component.switch.track.outlineWidth', reference: 'SwitchTokens.kt:trackOutlineWidth' },
  { canonical: 'component.switch.handle.unselectedSize', reference: 'SwitchTokens.kt:unselectedHandleWidth' },
  { canonical: 'component.switch.handle.selectedSize', reference: 'SwitchTokens.kt:selectedHandleWidth' },
  { canonical: 'component.switch.handle.pressedSize', reference: 'SwitchTokens.kt:pressedHandleWidth' },
  { canonical: 'component.switch.handle.iconSize', reference: 'SwitchTokens.kt:selectedIconSize' },
  { canonical: 'component.switch.stateLayerSize', reference: 'SwitchTokens.kt:stateLayerSize' },
];

const results = compareTokenGraph(canonicalValues, referenceValues, mappings);
const summary = summarizeAudit(results);
console.log(`AndroidX audit @ ${androidX.revision}`);
console.log(`match=${summary.match} mismatch=${summary.mismatch} missingCanonical=${summary['missing-canonical']} missingReference=${summary['missing-reference']}`);
for (const result of results.filter((item) => item.status !== 'match')) {
  console.error(`- ${result.status}: ${result.canonical} <- ${result.reference}; canonical=${JSON.stringify(result.canonicalValue)} reference=${JSON.stringify(result.referenceValue)}`);
}
if (hasAuditDrift(results)) process.exitCode = 1;
