import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALIAS_PATTERN, collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-progress-indicator', root: 'component.progressIndicator.base' },
  { module: 'md-comp-progress-indicator-circular', root: 'component.progressIndicator.circular' },
  { module: 'md-comp-progress-indicator-linear', root: 'component.progressIndicator.linear' },
];

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function pathFor(module, variable) {
  const mappings = {
    'md-comp-progress-indicator': {
      'active-indicator-color': 'activeIndicatorColor',
      'active-indicator-shape': 'activeShape',
      'stop-indicator-color': 'stopColor',
      'stop-indicator-shape': 'stopShape',
      'track-color': 'trackColor',
      'track-shape': 'trackShape',
    },
    'md-comp-progress-indicator-circular': {
      'active-indicator-thickness': 'activeThickness',
      'active-indicator-wave-amplitude': 'activeWaveAmplitude',
      'active-indicator-wave-wavelength': 'activeWaveWavelength',
      size: 'size',
      'track-active-indicator-space': 'trackActiveSpace',
      'track-thickness': 'trackThickness',
      'with-wave-size': 'waveSize',
    },
    'md-comp-progress-indicator-linear': {
      'active-indicator-thickness': 'activeThickness',
      'active-indicator-wave-amplitude': 'activeWaveAmplitude',
      'active-indicator-wave-wavelength': 'activeWaveWavelength',
      height: 'height',
      'indeterminate-active-indicator-wave-wavelength': 'indeterminateActiveWaveWavelength',
      'stop-indicator-size': 'stopSize',
      'stop-indicator-trailing-space': 'stopTrailingSpace',
      'track-active-indicator-space': 'trackActiveSpace',
      'track-thickness': 'trackThickness',
      'with-wave-height': 'waveHeight',
    },
  };
  const name = mappings[module.module]?.[variable];
  return name ? `${module.root}.${name}` : undefined;
}
function canonicalValue(path, resolving = new Set()) {
  const token = canonical.get(path);
  if (!token) return undefined;
  if (resolving.has(path)) throw new Error(`Progress Indicator audit alias cycle at ${path}`);

  const alias = typeof token.value === 'string' ? token.value.match(ALIAS_PATTERN) : null;
  if (alias) {
    resolving.add(path);
    const value = canonicalValue(alias[1], resolving);
    resolving.delete(path);
    return value;
  }
  if (token.type === 'dimension' && token.value && typeof token.value === 'object') {
    return `${token.value.value}${token.value.unit}`;
  }
  return token.value;
}
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  return { kind: 'unsupported', value: raw };
}
function parseSass(text) {
  const declarations = [];
  const lines = text.split(/\r?\n/);
  let tokenName;
  let deprecated = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const token = line.match(/^\/\/\/\s+(md\.[^\s(]+)/);
    if (token) {
      tokenName = token[1];
      deprecated = false;
      continue;
    }
    if (tokenName && line.includes('@deprecated')) {
      deprecated = true;
      continue;
    }
    const variable = line.match(/^\$([a-z0-9-]+):\s*(.+);$/);
    if (tokenName && variable) {
      declarations.push({ tokenName, variable: variable[1], raw: variable[2].trim(), deprecated });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-progress-indicator-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    const path = pathFor(module, declaration.variable);
    if (!path) {
      results.push({ module: module.module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const actual = canonicalValue(path);
    results.push({
      module: module.module,
      ...declaration,
      path,
      expected: expected.value,
      actual,
      status: token && Object.is(actual, expected.value) ? 'reconciled-resolved' : token ? 'mismatch' : 'pending',
    });
  }
}
const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Progress Indicator overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
