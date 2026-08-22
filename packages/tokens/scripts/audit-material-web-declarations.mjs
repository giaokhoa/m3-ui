import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const foundationDrift = JSON.parse(
  await readFile(new URL('../audit/foundation-drift.json', import.meta.url), 'utf8'),
);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(
  await readCanonicalDirectory(resolve(scriptDir, '../tokens')),
);

const modules = [
  { module: 'md-comp-carousel-item', root: 'component.carouselItem' },
  {
    module: 'md-comp-banners',
    root: 'component.banners',
    paths: {
      'standard-color': 'component.banners.standard.containerColor',
      'standard-body-text-color': 'component.banners.standard.bodyTextColor',
      'standard-icon-color': 'component.banners.standard.iconColor',
      'standard-title-text-color': 'component.banners.standard.titleTextColor',
      'vibrant-color': 'component.banners.vibrant.containerColor',
      'vibrant-body-text-color': 'component.banners.vibrant.bodyTextColor',
      'vibrant-icon-color': 'component.banners.vibrant.iconColor',
      'vibrant-title-text-color': 'component.banners.vibrant.titleTextColor',
    },
  },
  {
    module: 'md-comp-banners-basic',
    root: 'component.banners.basic',
    paths: {
      height: 'component.banners.basic.containerHeight',
      'mobile-height': 'component.banners.basic.mobileContainerHeight',
      'two-lines-height': 'component.banners.basic.twoLinesContainerHeight',
    },
  },
  { module: 'md-comp-banners-rich', root: 'component.banners.rich' },
  { module: 'md-comp-data-table', root: 'component.dataTable' },
  { module: 'md-comp-date-picker-docked', root: 'component.datePickerDocked' },
  { module: 'md-comp-filled-select', root: 'component.select.filled' },
  { module: 'md-comp-outlined-select', root: 'component.select.outlined' },
  { module: 'md-comp-full-screen-dialog', root: 'component.fullScreenDialog' },
  { module: 'md-comp-sheet-floating', root: 'component.sheetFloating' },
  { module: 'md-comp-sheet-side', root: 'component.sheetSide' },
];

const stateValues = foundationDrift.state.materialWeb.latestGenerated;

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function tokenPath(module, variable) {
  return module.paths?.[variable] ?? `${module.root}.${camel(variable)}`;
}

function canonicalValue(token) {
  if (!token) return undefined;
  if (token.type === 'dimension' && token.value && typeof token.value === 'object') {
    return `${token.value.value}${token.value.unit}`;
  }
  return token.value;
}

function normalizeRaw(raw) {
  const value = raw.trim();
  const dimension = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (dimension) return { kind: 'value', value: `${Number(dimension[1])}px` };
  const number = value.match(/^-?\d+(?:\.\d+)?$/);
  if (number) return { kind: 'value', value: Number(value) };
  if (/^-?\d+(?:\.\d+)?%$/.test(value)) return { kind: 'value', value };

  let match = value.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = value.match(/^md-sys-elevation\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = value.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = value.match(/^md-sys-state\.\$([a-z]+)-state-layer-opacity$/);
  if (match) return { kind: 'value', value: stateValues[match[1]] };
  match = value.match(/^md-sys-state-focus-indicator\.\$(inner-offset|outer-offset|thickness)$/);
  if (match) return { kind: 'foundation-reference', target: `state.focusIndicator.${camel(match[1])}` };
  match = value.match(/^md-sys-typescale(?:-emphasized)?\.\$([a-z]+-[a-z]+)-(font|line-height|size|tracking|weight)$/);
  if (match) {
    if (match[2] === 'font') return { kind: 'value', value: camel(match[1]) };
    return { kind: 'typography-decomposition', style: camel(match[1]) };
  }
  return { kind: 'unsupported-source-value', raw: value };
}

function parseSass(text) {
  const declarations = [];
  const lines = text.split(/\r?\n/);
  let tokenName;
  let deprecated = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
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
      declarations.push({ tokenName, variable: variable[1], raw: variable[2], deprecated, kind: 'variable' });
      tokenName = undefined;
      deprecated = false;
      continue;
    }
    const mixin = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixin) {
      declarations.push({ tokenName, variable: mixin[1], deprecated, kind: 'mixin' });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

function typographyFontPath(path) {
  if (path.endsWith('LineHeight')) return `${path.slice(0, -'LineHeight'.length)}Font`;
  if (path.endsWith('Size')) return `${path.slice(0, -'Size'.length)}Font`;
  if (path.endsWith('Tracking')) return `${path.slice(0, -'Tracking'.length)}Font`;
  if (path.endsWith('Weight')) return `${path.slice(0, -'Weight'.length)}Font`;
  if (path.endsWith('Type')) return `${path.slice(0, -'Type'.length)}Font`;
  return undefined;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-token-declaration-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  const declarations = parseSass(await response.text());
  for (const declaration of declarations) {
    if (declaration.deprecated) {
      results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    const path = tokenPath(module, declaration.variable);
    if (declaration.kind === 'mixin') {
      const fontPath = typographyFontPath(path);
      results.push({
        module: module.module,
        ...declaration,
        path,
        status: fontPath && canonical.has(fontPath) ? 'reconciled-typography-mixin' : 'pending',
        ...(fontPath ? { canonicalPath: fontPath } : {}),
      });
      continue;
    }

    const expected = normalizeRaw(declaration.raw);
    if (expected.kind === 'foundation-reference') {
      results.push({
        module: module.module,
        ...declaration,
        path,
        status: canonical.has(expected.target) ? 'reconciled-foundation-reference' : 'pending-foundation',
        canonicalPath: expected.target,
      });
      continue;
    }
    if (expected.kind === 'typography-decomposition') {
      const fontPath = typographyFontPath(path);
      const token = fontPath ? canonical.get(fontPath) : undefined;
      results.push({
        module: module.module,
        ...declaration,
        path,
        status: token && canonicalValue(token) === expected.style ? 'reconciled-typography-decomposition' : 'pending',
        ...(fontPath ? { canonicalPath: fontPath } : {}),
        expected: expected.style,
        actual: canonicalValue(token),
      });
      continue;
    }
    if (expected.kind === 'unsupported-source-value') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-value' });
      continue;
    }

    const token = canonical.get(path);
    const actual = canonicalValue(token);
    results.push({
      module: module.module,
      ...declaration,
      path,
      status: token && Object.is(actual, expected.value) ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
      expected: expected.value,
      actual,
    });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
const counts = {
  modules: modules.length,
  declarations: results.length,
  current: current.length,
  deprecated: results.length - current.length,
  reconciled: current.length - pending.length,
  pending: pending.length,
};

console.log(`Material Web declaration audit: modules=${counts.modules} current=${counts.current} reconciled=${counts.reconciled} pending=${counts.pending} deprecated=${counts.deprecated}`);
if (pending.length > 0) {
  console.log(JSON.stringify(pending.map(({ module, tokenName, variable, status, path, canonicalPath, expected, actual, raw }) => ({
    module, tokenName, variable, status, path, canonicalPath, expected, actual, raw,
  })), null, 2));
}
if (process.argv.includes('--require-complete') && pending.length > 0) process.exitCode = 1;
