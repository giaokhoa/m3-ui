import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = ['md-comp-filled-autocomplete', 'md-comp-outlined-autocomplete'];

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
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
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

function typographySemantic(variant, variable) {
  if (/^text-field-label-text-populated-(?:size|line-height)$/.test(variable)) {
    return {
      path: variable.endsWith('size')
        ? 'component.autocomplete.webShared.populatedLabelTextSize'
        : 'component.autocomplete.webShared.populatedLabelTextLineHeight',
      directSource: true,
    };
  }
  const specs = [
    ['text-field-input-text', `component.autocomplete.${variant}.fieldInputTextFont`, 'bodyLarge'],
    ['text-field-label-text', `component.autocomplete.${variant}.fieldLabelTextFont`, 'bodyLarge'],
    ['text-field-supporting-text', `component.autocomplete.${variant}.fieldSupportingTextFont`, 'bodySmall'],
  ];
  for (const [prefix, path, semantic] of specs) {
    if (new RegExp(`^${prefix}-(?:font|line-height|size|tracking|weight|type)$`).test(variable)) return { path, semantic };
  }
}

function sharedPath(variable) {
  if (variable === 'menu-cascading-menu-indicator-icon-size') return 'component.autocomplete.webShared.menuCascadingIndicatorIconSize';
  if (variable === 'menu-cascading-menu-indicator-icon-color') return 'component.autocomplete.webShared.menuCascadingIndicatorIconColor';
  if (variable === 'menu-container-shadow-color') return 'component.autocomplete.webShared.menuContainerShadowColor';
  if (variable === 'text-field-hover-state-layer-color' || variable === 'text-field-error-hover-state-layer-color') return 'component.autocomplete.webShared.hoverStateLayerColor';
  if (variable === 'text-field-hover-state-layer-opacity' || variable === 'text-field-error-hover-state-layer-opacity') return 'component.autocomplete.webShared.hoverStateLayerOpacity';
}

function directPath(variant, variable) {
  const root = `component.autocomplete.${variant}`;
  if (!variable.startsWith('text-field-')) return `${root}.${camel(variable)}`;
  const rest = variable.slice('text-field-'.length);
  if (/(?:^|-)(?:input-text|label-text|supporting-text)(?:-|$)/.test(rest)) {
    return `${root}.field${cap(camel(rest))}`;
  }
  return `${root}.textField${cap(camel(rest))}`;
}

const results = [];
for (const module of modules) {
  const variant = module.includes('filled-') ? 'filled' : 'outlined';
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-autocomplete-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }

    const typography = typographySemantic(variant, declaration.variable);
    if (typography) {
      if (typography.directSource) {
        const expected = sourceValue(declaration.raw);
        const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
        const actual = resolvedValue(canonical.get(typography.path));
        results.push({ module, ...declaration, path: typography.path, expected: expectedValue, actual, status: expected.kind !== 'unsupported' && Object.is(actual, expectedValue) ? 'reconciled-semantic-reference' : 'mismatch' });
      } else {
        const actual = canonicalValue(canonical.get(typography.path));
        results.push({ module, ...declaration, path: typography.path, expected: typography.semantic, actual, status: actual === typography.semantic ? 'reconciled-semantic-reference' : 'mismatch' });
      }
      continue;
    }

    const path = sharedPath(declaration.variable) ?? directPath(variant, declaration.variable);
    const expected = sourceValue(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const expectedValue = expected.kind === 'canonical' ? resolvedValue(canonical.get(expected.path)) : expected.value;
    const actual = resolvedValue(token);
    results.push({ module, ...declaration, path, expected: expectedValue, actual, status: token && Object.is(actual, expectedValue) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}

const current = results.filter((result) => !result.status.startsWith('excluded-'));
const pending = current.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Autocomplete overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
