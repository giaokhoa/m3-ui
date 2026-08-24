import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = ['md-comp-list', 'md-comp-list-expand', 'md-comp-list-reorder', 'md-comp-list-reveal'];

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function canonicalValue(token) {
  if (!token) return undefined;
  if (token.type === 'dimension' && token.value && typeof token.value === 'object') return `${token.value.value}${token.value.unit}`;
  return token.value;
}
function resolvedValue(token, seen = new Set()) {
  const value = canonicalValue(token);
  if (typeof value !== 'string') return value;
  const alias = value.match(/^\{(.+)\}$/);
  if (!alias) return value;
  if (seen.has(alias[1])) throw new Error(`Alias cycle at ${alias[1]}`);
  const target = canonical.get(alias[1]);
  if (!target) return value;
  seen.add(alias[1]);
  return resolvedValue(target, seen);
}
function sourceValue(raw) {
  let match = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (match) return { kind: 'value', value: `${Number(match[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$(level[0-5])$/);
  if (match) return { kind: 'value', value: match[1] };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed|dragged)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(inner-offset|outer-offset|thickness)$/);
  if (match) {
    const field = match[1] === 'inner-offset' ? 'innerOffset' : match[1] === 'outer-offset' ? 'outerOffset' : 'thickness';
    return { kind: 'canonical', path: `state.focusIndicator.${field}` };
  }
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
      continue;
    }
    const mixin = line.match(/^@mixin\s+([a-z0-9-]+)\s*\{/);
    if (tokenName && mixin) {
      declarations.push({ tokenName, variable: mixin[1], raw: '@mixin', deprecated });
      tokenName = undefined;
      deprecated = false;
    }
  }
  return declarations;
}

function canonicalKey(variable) {
  return camel(variable.replace(/^list-item-/, 'item-').replace(/-list-item-/g, '-item-'));
}
function sectionFor(module) {
  if (module === 'md-comp-list') return 'base';
  if (module === 'md-comp-list-expand') return 'expanded';
  if (module === 'md-comp-list-reorder') return 'reorder';
  return 'reveal';
}
function typographySemantic(variable) {
  const specs = [
    ['list-item-label-text', 'itemLabelTextFont', 'bodyLarge'],
    ['list-item-leading-avatar-label', 'itemLeadingAvatarLabelFont', 'titleMedium'],
    ['list-item-overline', 'itemOverlineFont', 'labelSmall'],
    ['list-item-supporting-text', 'itemSupportingTextFont', 'bodyMedium'],
    ['list-item-trailing-supporting-text', 'itemTrailingSupportingTextFont', 'labelSmall'],
  ];
  for (const [prefix, key, semantic] of specs) {
    if (new RegExp(`^${prefix}-(?:font|line-height|size|tracking|weight|type)$`).test(variable)) return { key, semantic };
  }
}
function stateLayerColorPath(section, variable) {
  if (!variable.endsWith('state-layer-color')) return undefined;
  if (section === 'base') {
    if (/^list-item-selected-disabled-/.test(variable)) return 'component.list.base.itemSelectedDisabledLabelTextColor';
    if (/^list-item-selected-(?:dragged|focus|hover|pressed)-/.test(variable)) return 'color.role.onSurface';
    if (/^list-item-disabled-/.test(variable)) return 'component.list.base.itemDisabledLabelTextColor';
    if (/^list-item-(?:dragged|focus|hover|pressed)-/.test(variable)) return 'component.list.base.itemLabelTextColor';
  }
  if (section === 'reorder') return 'component.list.reorder.itemLabelTextColor';
  if (section === 'reveal') {
    if (/^list-item-action-icon-button-/.test(variable)) return 'component.list.reveal.itemActionButtonIconIconColor';
    if (/^list-item-icon-button-/.test(variable)) return 'component.list.reveal.itemButtonIconIconColor';
  }
}
function pathFor(module, variable) {
  const section = sectionFor(module);
  const typography = typographySemantic(variable);
  if (typography && section === 'base') return { path: `component.list.base.${typography.key}`, semantic: typography.semantic };

  if (section === 'reveal') {
    if (variable === 'list-item-action-icon-button-icon-color') return { path: 'component.list.reveal.itemActionButtonIconIconColor' };
    if (variable === 'list-item-icon-button-icon-color') return { path: 'component.list.reveal.itemButtonIconIconColor' };
  }

  const root = `component.list.${section}`;
  const direct = `${root}.${canonicalKey(variable)}`;
  if (canonical.has(direct)) return { path: direct };

  const stateColor = stateLayerColorPath(section, variable);
  if (stateColor) return { path: stateColor, semanticReference: true };

  return undefined;
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-list-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    let mapping = pathFor(module, declaration.variable);
    const expected = sourceValue(declaration.raw);

    if (!mapping && declaration.variable.endsWith('state-layer-opacity') && expected.kind === 'canonical') {
      mapping = { path: expected.path, semanticReference: true };
    }
    if (!mapping) {
      results.push({ module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }

    if (mapping.semantic) {
      const actual = canonicalValue(canonical.get(mapping.path));
      results.push({ module, ...declaration, path: mapping.path, expected: mapping.semantic, actual, status: actual === mapping.semantic ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }

    if (expected.kind === 'unsupported') {
      results.push({ module, ...declaration, path: mapping.path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(mapping.path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    const reconciled = token && Object.is(actual, expectedValue);
    results.push({
      module,
      ...declaration,
      path: mapping.path,
      expected: expectedValue,
      actual,
      status: reconciled ? (mapping.semanticReference ? 'reconciled-semantic-reference' : 'reconciled-direct') : token ? 'mismatch' : 'pending',
    });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web List overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
