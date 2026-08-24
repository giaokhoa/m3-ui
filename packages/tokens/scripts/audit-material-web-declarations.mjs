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
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));

const modules = [
  { module: 'md-comp-carousel-item', root: 'component.carouselItem' },
  {
    module: 'md-comp-banner',
    root: 'component.banners.legacyLayout',
    paths: {
      'desktop-with-single-line-container-height': 'component.banners.legacyLayout.desktopSingleLineContainerHeight',
      'desktop-with-three-lines-container-height': 'component.banners.legacyLayout.desktopThreeLinesContainerHeight',
      'desktop-with-two-lines-with-image-container-height': 'component.banners.legacyLayout.desktopTwoLinesWithImageContainerHeight',
      'mobile-with-single-line-container-height': 'component.banners.legacyLayout.mobileSingleLineContainerHeight',
      'mobile-with-two-lines-container-height': 'component.banners.legacyLayout.mobileTwoLinesContainerHeight',
      'mobile-with-two-lines-with-image-container-height': 'component.banners.legacyLayout.mobileTwoLinesWithImageContainerHeight',
      'with-image-image-size': 'component.banners.legacyLayout.withImageImageSize',
      'with-image-image-shape': 'component.banners.legacyLayout.withImageImageShape',
    },
  },
  {
    module: 'md-comp-banners',
    root: 'component.banners',
    paths: {
      'banners-close-button-pressed-state-layer-color': 'component.banners.closeButtonPressedStateLayerColor',
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

const directTypographyAliases = new Map([
  ['md-comp-filled-select:text-field-label-text-populated-line-height', 'typography.bodySmall.lineHeight'],
  ['md-comp-filled-select:text-field-label-text-populated-size', 'typography.bodySmall.fontSize'],
  ['md-comp-outlined-select:text-field-label-text-populated-line-height', 'typography.bodySmall.lineHeight'],
  ['md-comp-outlined-select:text-field-label-text-populated-size', 'typography.bodySmall.fontSize'],
]);
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

function styleName(rawStyle, emphasized = false) {
  return `${camel(rawStyle)}${emphasized ? 'Emphasized' : ''}`;
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
  if (match) return { kind: 'alias', target: `state.focusIndicator.${camel(match[1])}` };
  match = value.match(/^md-sys-typescale(-emphasized)?\.\$([a-z]+-[a-z]+)-(font|line-height|size|tracking|weight)$/);
  if (match) {
    return {
      kind: 'typography-decomposition',
      style: styleName(match[2], Boolean(match[1])),
      property: match[3],
    };
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
  for (const suffix of ['LineHeight', 'Size', 'Tracking', 'Weight', 'Type']) {
    if (path.endsWith(suffix)) return `${path.slice(0, -suffix.length)}Font`;
  }
  return undefined;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-token-declaration-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
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
    if (expected.kind === 'alias') {
      const token = canonical.get(path);
      const alias = `{${expected.target}}`;
      results.push({
        module: module.module,
        ...declaration,
        path,
        canonicalPath: path,
        expected: alias,
        actual: canonicalValue(token),
        status: token && canonicalValue(token) === alias ? 'reconciled-alias' : token ? 'mismatch' : 'pending',
      });
      continue;
    }
    if (expected.kind === 'typography-decomposition') {
      const directTarget = directTypographyAliases.get(`${module.module}:${declaration.variable}`);
      if (directTarget) {
        const token = canonical.get(path);
        const alias = `{${directTarget}}`;
        results.push({
          module: module.module,
          ...declaration,
          path,
          canonicalPath: path,
          expected: alias,
          actual: canonicalValue(token),
          status: token && canonicalValue(token) === alias ? 'reconciled-typography-alias' : token ? 'mismatch' : 'pending',
        });
        continue;
      }
      const fontPath = expected.property === 'font' ? path : typographyFontPath(path);
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
