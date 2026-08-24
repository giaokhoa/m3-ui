import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  { module: 'md-comp-filled-card', variant: 'filled' },
  { module: 'md-comp-elevated-card', variant: 'elevated' },
  { module: 'md-comp-outlined-card', variant: 'outlined' },
];

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
function camel(name) { return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()); }
function pathFor(module, variable) {
  const common = {
    'icon-size': 'component.card.base.iconSize',
    'container-shadow-color': 'component.card.base.containerShadowColor',
    'container-shape': 'component.card.base.containerShape',
    'focus-indicator-color': 'component.card.base.focusIndicatorColor',
    'focus-indicator-outline-offset': 'component.card.base.focusIndicatorOutlineOffset',
    'focus-indicator-thickness': 'component.card.base.focusIndicatorThickness',
    'dragged-state-layer-color': 'component.card.base.state.dragged.color',
    'dragged-state-layer-opacity': 'component.card.base.state.dragged.opacity',
    'focus-state-layer-color': 'component.card.base.state.focus.color',
    'focus-state-layer-opacity': 'component.card.base.state.focus.opacity',
    'hover-state-layer-color': 'component.card.base.state.hover.color',
    'hover-state-layer-opacity': 'component.card.base.state.hover.opacity',
    'pressed-state-layer-color': 'component.card.base.state.pressed.color',
    'pressed-state-layer-opacity': 'component.card.base.state.pressed.opacity',
    'icon-color': 'component.card.base.iconColor',
  };
  if (common[variable]) return common[variable];
  const root = `component.card.variant.${module.variant}`;
  const variant = {
    'container-color': `${root}.containerColor`,
    'container-elevation': `${root}.elevation.default`,
    'disabled-container-opacity': `${root}.disabledContainerOpacity`,
    'disabled-container-color': `${root}.disabledContainerColor`,
    'disabled-container-elevation': `${root}.elevation.disabled`,
    'dragged-container-elevation': `${root}.elevation.dragged`,
    'focus-container-elevation': `${root}.elevation.focused`,
    'hover-container-elevation': `${root}.elevation.hovered`,
    'pressed-container-elevation': `${root}.elevation.pressed`,
  };
  if (variant[variable]) return variant[variable];
  if (module.variant !== 'outlined') return undefined;
  const outline = {
    'disabled-outline-opacity': `${root}.outline.disabledOpacity`,
    'outline-width': `${root}.outline.width`,
    'disabled-outline-color': `${root}.outline.disabledColor`,
    'dragged-outline-color': `${root}.outline.draggedColor`,
    'focus-outline-color': `${root}.outline.focusColor`,
    'hover-outline-color': `${root}.outline.hoverColor`,
    'outline-color': `${root}.outline.color`,
    'pressed-outline-color': `${root}.outline.pressedColor`,
  };
  return outline[variable];
}
function normalize(raw) {
  const px = raw.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return { kind: 'value', value: `${Number(px[1])}px` };
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-elevation\.\$level(\d+)$/);
  if (match) return { kind: 'value', value: `level${match[1]}` };
  match = raw.match(/^md-sys-shape\.\$corner-([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: camel(match[1]) };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed|dragged)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  match = raw.match(/^md-sys-state-focus-indicator\.\$(outer-offset|thickness)$/);
  if (match) return { kind: 'alias', value: `{state.focusIndicator.${match[1] === 'outer-offset' ? 'outerOffset' : 'thickness'}}` };
  return { kind: 'unsupported', value: raw };
}
function parseSass(text) {
  const declarations = [];
  let tokenName;
  let deprecated = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const token = line.match(/^\/\/\/\s+(md\.[^\s(]+)/);
    if (token) { tokenName = token[1]; deprecated = false; continue; }
    if (tokenName && line.includes('@deprecated')) { deprecated = true; continue; }
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
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-card-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of parseSass(await response.text())) {
    if (declaration.deprecated) { results.push({ module: module.module, ...declaration, status: 'excluded-deprecated' }); continue; }
    const path = pathFor(module, declaration.variable);
    if (!path) { results.push({ module: module.module, ...declaration, status: 'pending-unmapped-source' }); continue; }
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') { results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' }); continue; }
    const token = canonical.get(path);
    const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
    results.push({ module: module.module, ...declaration, path, expected: expected.value, actual, status: token && Object.is(actual, expected.value) ? 'reconciled-direct' : token ? 'mismatch' : 'pending' });
  }
}
const current = results.filter((r) => !r.status.startsWith('excluded-'));
const pending = current.filter((r) => !r.status.startsWith('reconciled-'));
console.log(`Material Web Card overlap audit: modules=${modules.length} current=${current.length} reconciled=${current.length - pending.length} pending=${pending.length} deprecated=${results.length - current.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
