import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = ['md-comp-filled-menu-button', 'md-comp-outlined-menu-button', 'md-comp-standard-menu-button'];

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
  if (match) return { kind: 'value', value: match[1].replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'canonical', path: `state.layer.opacity.${match[1]}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'canonical', path: match[1] === 'outer-offset' ? 'state.focusIndicator.outerOffset' : 'state.focusIndicator.thickness' };
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

function variantFor(module) {
  if (module.includes('filled-')) return 'filled';
  if (module.includes('outlined-')) return 'outlined';
  return 'standard';
}

function directPath(variant, variable) {
  const root = `component.menuButton.${variant}`;
  const shared = 'component.menuButton.shared';
  const common = {
    'container-height': `${shared}.containerHeight`,
    'trailing-icon-size': `${shared}.trailingIconSize`,
    'with-icon-leading-icon-size': `${shared}.leadingIconSize`,
    'focus-indicator-color': `${shared}.focusIndicatorColor`,
    'focus-indicator-outline-offset': `${shared}.focusIndicatorOutlineOffset`,
    'focus-indicator-thickness': `${shared}.focusIndicatorThickness`,
  };
  if (common[variable]) return common[variable];

  if (/state-layer-opacity$/.test(variable)) {
    if (variant === 'filled' && variable === 'pressed-state-layer-opacity') return 'state.layer.opacity.focus';
    if (variable.startsWith('focus-')) return 'state.layer.opacity.focus';
    if (variable.startsWith('hover-')) return 'state.layer.opacity.hover';
    if (variable.startsWith('pressed-')) return 'state.layer.opacity.pressed';
  }

  if (/^disabled-(?:trailing-icon-opacity)$/.test(variable) || /^with-icon-disabled-(?:leading-icon|icon)-opacity$/.test(variable)) {
    return 'state.disabled.contentOpacity';
  }
  if (/^disabled-(?:label-text|trailing-icon)-color$/.test(variable) || /^with-icon-disabled-(?:leading-icon|icon)-color$/.test(variable)) {
    return 'color.role.onSurface';
  }

  if (variant === 'filled') {
    const map = {
      'disabled-container-opacity': `${root}.disabledContainerOpacity`,
      'disabled-label-text-opacity': `${root}.disabledLabelTextOpacity`,
      'container-color': `${root}.containerColor`,
      'container-elevation': `${root}.containerElevation`,
      'disabled-container-color': `${root}.disabledContainerColor`,
      'disabled-container-elevation': `${root}.containerElevation`,
      'focus-container-elevation': `${root}.containerElevation`,
      'hover-container-elevation': `${root}.hoverContainerElevation`,
      'label-text-color': `${root}.labelTextColor`,
      'shape': `${root}.shape`,
      'trailing-icon-color': `${root}.labelTextColor`,
      'with-icon-leading-icon-color': `${root}.labelTextColor`,
    };
    if (map[variable]) return map[variable];
    if (/^(?:focus|hover|pressed)-(?:label-text|state-layer|trailing-icon)-color$/.test(variable)) return `${root}.labelTextColor`;
    if (/^with-icon-(?:focus|hover|pressed)-leading-icon-color$/.test(variable)) return `${root}.labelTextColor`;
  }

  if (variant === 'outlined') {
    const map = {
      'disabled-container-opacity': `${root}.disabledContainerOpacity`,
      'disabled-label-text-opacity': `${root}.disabledLabelTextOpacity`,
      'outline-width': `${root}.outlineWidth`,
      'outline-color': `${root}.outlineColor`,
      'shape': `${root}.shape`,
      'label-text-color': `${root}.labelTextColor`,
      'trailing-icon-color': `${root}.trailingIconColor`,
      'focus-outline-color': `${root}.labelTextColor`,
      'hover-outline-color': `${root}.outlineColor`,
      'pressed-outline-color': `${root}.outlineColor`,
      'disabled-outline-color': 'color.role.onSurface',
      'with-icon-leading-icon-color': `${root}.labelTextColor`,
    };
    if (map[variable]) return map[variable];
    if (/^(?:focus|hover|pressed)-(?:label-text|state-layer|trailing-icon)-color$/.test(variable)) return `${root}.labelTextColor`;
    if (/^with-icon-(?:focus|hover|pressed)-leading-icon-color$/.test(variable)) return `${root}.labelTextColor`;
  }

  if (variant === 'standard') {
    const map = {
      'disabled-label-text-opacity': `${root}.disabledLabelTextOpacity`,
      'container-shape': `${root}.containerShape`,
      'label-text-color': `${root}.labelTextColor`,
      'trailing-icon-color': `${root}.trailingIconColor`,
      'with-icon-leading-icon-color': `${root}.labelTextColor`,
    };
    if (map[variable]) return map[variable];
    if (/^(?:focus|hover|pressed)-(?:label-text|state-layer|trailing-icon)-color$/.test(variable)) return `${root}.labelTextColor`;
    if (/^with-icon-(?:focus-icon|hover-leading-icon|pressed-icon)-color$/.test(variable)) return `${root}.labelTextColor`;
  }
}

const results = [];
for (const module of modules) {
  const variant = variantFor(module);
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-menu-button-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) {
      results.push({ module, ...declaration, status: 'excluded-deprecated' });
      continue;
    }
    if (/^label-text-(?:font|line-height|size|tracking|weight|type)$/.test(declaration.variable)) {
      const path = 'component.menuButton.shared.labelTextFont';
      const actual = canonicalValue(canonical.get(path));
      results.push({ module, ...declaration, path, expected: 'labelLarge', actual, status: actual === 'labelLarge' ? 'reconciled-semantic-reference' : 'mismatch' });
      continue;
    }
    const path = directPath(variant, declaration.variable);
    if (!path) {
      results.push({ module, ...declaration, status: 'pending-unmapped-source' });
      continue;
    }
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
console.log(`Material Web Menu Button overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
