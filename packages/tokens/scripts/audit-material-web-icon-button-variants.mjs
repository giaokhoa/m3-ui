import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTokens, readCanonicalDirectory } from './dtcg.mjs';
import { material3Sources } from './sources.mjs';

const source = material3Sources.materialWeb;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const canonical = collectTokens(await readCanonicalDirectory(resolve(scriptDir, '../tokens')));
const modules = [
  ['md-comp-icon-button-standard', 'component.iconButton.standard'],
  ['md-comp-icon-button-filled', 'component.iconButton.variant.filled'],
  ['md-comp-icon-button-tonal', 'component.iconButton.variant.filledTonal'],
  ['md-comp-icon-button-outlined', 'component.iconButton.variant.outlined'],
].map(([module, root]) => ({ module, root }));

function camel(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}
function canonicalValue(token) {
  if (!token) return undefined;
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
function mappedName(variable) {
  return variable
    .replace(/disabled-icon-opacity$/, 'disabled-opacity')
    .replace(/disabled-icon-color$/, 'disabled-color')
    .replace(/focused-icon-color$/, 'focused-color')
    .replace(/hovered-icon-color$/, 'hovered-color')
    .replace(/pressed-icon-color$/, 'pressed-color')
    .replace(/^icon-color$/, 'color')
    .replace(/selected-focused-icon-color$/, 'selected-focused-color')
    .replace(/selected-hovered-icon-color$/, 'selected-hovered-color')
    .replace(/selected-pressed-icon-color$/, 'selected-pressed-color')
    .replace(/selected-icon-color$/, 'selected-color')
    .replace(/unselected-focused-icon-color$/, 'unselected-focused-color')
    .replace(/unselected-hovered-icon-color$/, 'unselected-hovered-color')
    .replace(/unselected-pressed-icon-color$/, 'unselected-pressed-color')
    .replace(/unselected-icon-color$/, 'unselected-color');
}
function pathFor(root, variable) {
  return `${root}.${camel(mappedName(variable))}`;
}
function normalize(raw) {
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { kind: 'value', value: Number(raw) };
  let match = raw.match(/^md-sys-color\.\$([a-z0-9-]+)$/);
  if (match) return { kind: 'value', value: `var(--${match[1]})` };
  match = raw.match(/^md-sys-state\.\$(focus|hover|pressed)-state-layer-opacity$/);
  if (match) return { kind: 'alias', value: `{state.layer.opacity.${match[1]}}` };
  return { kind: 'unsupported', value: raw };
}
function variables(text) {
  return [...text.matchAll(/^\$([a-z0-9-]+):\s*(.+);$/gm)].map((match) => ({ variable: match[1], raw: match[2].trim() }));
}

const results = [];
for (const module of modules) {
  const url = `https://raw.githubusercontent.com/${source.repository}/${source.revision}/${source.latestGeneratedRoot}/_${module.module}.scss`;
  const response = await fetch(url, { headers: { 'user-agent': 'm3-ui-icon-button-variant-overlap-audit' } });
  if (!response.ok) throw new Error(`Failed to fetch ${module.module}: ${response.status}`);
  for (const declaration of variables(await response.text())) {
    const path = pathFor(module.root, declaration.variable);
    const expected = normalize(declaration.raw);
    if (expected.kind === 'unsupported') {
      results.push({ module: module.module, ...declaration, path, status: 'pending-unsupported-source' });
      continue;
    }
    const token = canonical.get(path);
    const actual = expected.kind === 'alias' ? canonicalValue(token) : resolvedValue(token);
    const matches = token && Object.is(actual, expected.value);
    results.push({
      module: module.module,
      ...declaration,
      path,
      expected: expected.value,
      actual,
      status: matches ? 'reconciled-direct' : token ? 'mismatch' : 'pending',
    });
  }
}
const pending = results.filter((result) => !result.status.startsWith('reconciled-'));
console.log(`Material Web Icon Button variant overlap audit: modules=${modules.length} declarations=${results.length} reconciled=${results.length - pending.length} pending=${pending.length}`);
if (pending.length) console.log(JSON.stringify(pending, null, 2));
if (process.argv.includes('--require-complete') && pending.length) process.exitCode = 1;
