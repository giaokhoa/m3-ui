import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GROUP_ORDER = [
  'size',
  'shape',
  'typography',
  'icon',
  'spacing',
  'elevation',
  'color',
  'state',
  'motion',
  'other',
];

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isToken(value) {
  return isObject(value) && Object.prototype.hasOwnProperty.call(value, '$value');
}

async function listJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listJsonFiles(absolute)));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(absolute);
  }
  return files;
}

function mergeGraph(target, source, path = []) {
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      target[key] = value;
      continue;
    }
    if (isObject(target[key]) && isObject(value) && !isToken(target[key]) && !isToken(value)) {
      mergeGraph(target[key], value, [...path, key]);
      continue;
    }
    if (JSON.stringify(target[key]) !== JSON.stringify(value)) {
      throw new Error(`Conflicting canonical token definition at ${[...path, key].join('.')}`);
    }
  }
}

function getAtPath(graph, tokenPath) {
  let current = graph;
  for (const segment of tokenPath.split('.')) {
    if (!isObject(current) || !(segment in current)) return undefined;
    current = current[segment];
  }
  return current;
}

function exactAlias(value) {
  if (typeof value !== 'string') return null;
  const match = /^\{([^{}]+)\}$/.exec(value.trim());
  return match?.[1] ?? null;
}

function resolveTokenValue(graph, tokenPath, stack = []) {
  if (stack.includes(tokenPath)) {
    throw new Error(`Circular token alias: ${[...stack, tokenPath].join(' -> ')}`);
  }
  const token = getAtPath(graph, tokenPath);
  if (!isToken(token)) throw new Error(`Token alias does not resolve to a token: ${tokenPath}`);
  const alias = exactAlias(token.$value);
  if (!alias) return token.$value;
  return resolveTokenValue(graph, alias, [...stack, tokenPath]);
}

function formatValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (isObject(value) && typeof value.value === 'number' && typeof value.unit === 'string') {
    return `${value.value}${value.unit}`;
  }
  return JSON.stringify(value);
}

function classifyGroup(path, token) {
  const searchable = `${path.join('.')} ${token.$type ?? ''}`.toLowerCase();
  if (/typography|font|labeltext|supportingtext|headline|titletext|bodytext/.test(searchable)) return 'typography';
  if (/shape|radius|corner/.test(searchable)) return 'shape';
  if (/elevation|shadow/.test(searchable)) return 'elevation';
  if (/statelayer|hover|focus|pressed|dragged|selected|disabled|checked/.test(searchable)) return 'state';
  if (/color|colour|tint/.test(searchable)) return 'color';
  if (/padding|spacing|space|gap|margin|offset/.test(searchable)) return 'spacing';
  if (/icon/.test(searchable)) return 'icon';
  if (/opacity|state/.test(searchable)) return 'state';
  if (/motion|duration|easing|spring/.test(searchable)) return 'motion';
  if (/width|height|size|diameter|thickness|length|min|max/.test(searchable)) return 'size';
  return 'other';
}

function walkTokens(node, graph, rootPath, path = [], inheritedType = null, entries = []) {
  const groupType = isObject(node) && typeof node.$type === 'string' ? node.$type : inheritedType;
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const nextPath = [...path, key];
    if (isToken(value)) {
      const absolutePath = [...rootPath, ...nextPath];
      const tokenPath = absolutePath.join('.');
      const alias = exactAlias(value.$value);
      const resolved = resolveTokenValue(graph, tokenPath);
      entries.push({
        path: nextPath.join('.'),
        tokenPath,
        type: value.$type ?? groupType ?? 'unknown',
        group: classifyGroup(absolutePath, value),
        value: formatValue(value.$value),
        alias,
        resolvedValue: formatValue(resolved),
      });
    } else if (isObject(value)) {
      walkTokens(value, graph, rootPath, nextPath, groupType, entries);
    }
  }
  return entries;
}

function familyCandidates(graph) {
  const candidates = [];
  for (const [key, value] of Object.entries(graph)) {
    if (key === 'component' || key === 'theme' || !isObject(value)) continue;
    candidates.push({ name: key, tokenPath: key, node: value });
  }
  if (isObject(graph.component)) {
    for (const [key, value] of Object.entries(graph.component)) {
      if (isObject(value)) candidates.push({ name: key, tokenPath: `component.${key}`, node: value });
    }
  }
  return candidates.sort((left, right) => left.name.localeCompare(right.name));
}

function serializeFamily(candidate, graph) {
  const entries = walkTokens(candidate.node, graph, candidate.tokenPath.split('.')).sort((left, right) =>
    left.path.localeCompare(right.path),
  );
  const availableGroups = GROUP_ORDER.filter((group) => entries.some((entry) => entry.group === group));
  return {
    name: candidate.name,
    tokenPath: candidate.tokenPath,
    availableGroups,
    entries,
  };
}

export function defaultRepositoryRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
}

export async function buildMaterialSpecModel({
  repoRoot = defaultRepositoryRoot(),
  tokensDirectory = 'packages/tokens/tokens',
} = {}) {
  const absoluteRepoRoot = resolve(repoRoot);
  const absoluteTokensDirectory = resolve(absoluteRepoRoot, tokensDirectory);
  const files = await listJsonFiles(absoluteTokensDirectory);
  const graph = {};
  for (const file of files) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    mergeGraph(graph, parsed);
  }

  const families = {};
  for (const candidate of familyCandidates(graph)) {
    if (families[candidate.name]) {
      throw new Error(
        `Ambiguous Material spec family "${candidate.name}" at ${families[candidate.name].tokenPath} and ${candidate.tokenPath}`,
      );
    }
    families[candidate.name] = serializeFamily(candidate, graph);
  }

  return {
    schemaVersion: 1,
    source: normalizePath(relative(absoluteRepoRoot, absoluteTokensDirectory)),
    families,
  };
}

export function requireMaterialSpecFamily(model, family) {
  const entry = model.families[family];
  if (!entry) {
    throw new Error(
      `Unknown Material spec family "${family}". Use a canonical foundation or component token family from ${model.source}.`,
    );
  }
  return entry;
}

export function selectMaterialSpecEntries(model, family, groups = null) {
  const entry = requireMaterialSpecFamily(model, family);
  if (!groups || groups.length === 0) return entry.entries;
  const requested = [...new Set(groups)];
  for (const group of requested) {
    if (!entry.availableGroups.includes(group)) {
      throw new Error(
        `Material spec family "${family}" has no "${group}" group. Available groups: ${entry.availableGroups.join(', ')}.`,
      );
    }
  }
  return entry.entries.filter((token) => requested.includes(token.group));
}

export function stableMaterialSpecJson(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}
