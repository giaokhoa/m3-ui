import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const ALIAS_PATTERN = /^\{([A-Za-z0-9_.-]+)\}$/;

const tokenProperties = new Set([
  '$value',
  '$type',
  '$description',
  '$extensions',
  '$deprecated',
]);
const groupProperties = new Set([
  '$type',
  '$description',
  '$extensions',
  '$deprecated',
  '$extends',
  '$root',
]);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function readCanonical(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function mergeCanonical(target, source, path = []) {
  for (const [key, value] of Object.entries(source)) {
    const nextPath = [...path, key];
    if (!Object.hasOwn(target, key)) {
      target[key] = value;
      continue;
    }

    const current = target[key];
    if (
      isObject(current) &&
      isObject(value) &&
      !Object.hasOwn(current, '$value') &&
      !Object.hasOwn(value, '$value')
    ) {
      mergeCanonical(current, value, nextPath);
      continue;
    }

    throw new Error(`Duplicate canonical path: ${nextPath.join('.')}`);
  }
  return target;
}

async function listJsonFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listJsonFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(path);
    }
  }
  return files.sort();
}

export async function readCanonicalDirectory(directory) {
  const root = {};
  for (const path of await listJsonFiles(directory)) {
    mergeCanonical(root, await readCanonical(path));
  }
  return root;
}

function validateName(name, path, errors) {
  if (name.startsWith('$')) {
    errors.push(`${[...path, name].join('.')}: token/group names must not begin with $`);
  }
  if (/[.{}]/.test(name)) {
    errors.push(`${[...path, name].join('.')}: token/group names must not contain ., {, or }`);
  }
}

function validateMetadata(node, allowed, path, errors) {
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) continue;
    if (!allowed.has(key)) {
      errors.push(`${path || '<root>'}: unsupported DTCG property ${key}`);
      continue;
    }
    if ((key === '$description' || key === '$type' || key === '$extends') && typeof value !== 'string') {
      errors.push(`${path || '<root>'}: ${key} must be a string`);
    }
    if (key === '$extensions' && !isObject(value)) {
      errors.push(`${path || '<root>'}: $extensions must be an object`);
    }
    if (key === '$deprecated' && typeof value !== 'boolean' && typeof value !== 'string') {
      errors.push(`${path || '<root>'}: $deprecated must be a boolean or string`);
    }
  }
}

export function validateDtcgStableStructure(root) {
  const errors = [];
  if (!isObject(root)) return ['<root>: DTCG document must be an object'];

  function visit(node, path = []) {
    const label = path.join('.') || '<root>';
    if (!isObject(node)) {
      errors.push(`${label}: token/group must be an object`);
      return;
    }

    const isToken = Object.hasOwn(node, '$value');
    validateMetadata(node, isToken ? tokenProperties : groupProperties, label, errors);

    if (isToken) {
      for (const key of Object.keys(node)) {
        if (!key.startsWith('$')) {
          errors.push(`${label}: token cannot also contain child token/group ${key}`);
        }
      }
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === '$root') {
        if (!isObject(value) || !Object.hasOwn(value, '$value')) {
          errors.push(`${label}: $root must be a design token with $value`);
        } else {
          visit(value, [...path, '$root']);
        }
        continue;
      }
      if (key.startsWith('$')) continue;
      validateName(key, path, errors);
      visit(value, [...path, key]);
    }
  }

  visit(root);
  return errors;
}

export function collectTokens(root) {
  const tokens = new Map();

  function visit(node, path = [], inheritedType) {
    if (!isObject(node)) return;
    const type = node.$type ?? inheritedType;

    if (Object.hasOwn(node, '$value')) {
      const name = path.join('.');
      if (!name) throw new Error('Root cannot be a token');
      tokens.set(name, { path, type, value: node.$value, node });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === '$root') {
        visit(value, [...path, '$root'], type);
        continue;
      }
      if (key.startsWith('$')) continue;
      visit(value, [...path, key], type);
    }
  }

  visit(root);
  return tokens;
}

export function validateCanonical(root) {
  const errors = [...validateDtcgStableStructure(root)];
  const tokens = collectTokens(root);
  if (tokens.size === 0) errors.push('canonical source contains no tokens');

  for (const [name, token] of tokens) {
    if (!token.type) errors.push(`${name}: missing $type (directly or inherited)`);
    if (Object.hasOwn(token.node, 'value')) {
      errors.push(`${name}: legacy value key is forbidden; use $value`);
    }

    const alias = typeof token.value === 'string' ? token.value.match(ALIAS_PATTERN) : null;
    if (alias && !tokens.has(alias[1])) {
      errors.push(`${name}: alias target ${alias[1]} does not exist`);
    }

    if (token.type === 'dimension' && !alias) {
      const value = token.value;
      if (!value || typeof value !== 'object' || typeof value.value !== 'number') {
        errors.push(`${name}: dimension must be { value: number, unit: string } or an alias`);
      } else if (!['px', 'rem'].includes(value.unit)) {
        errors.push(`${name}: unsupported dimension unit ${JSON.stringify(value.unit)}`);
      }
    }

    if (token.type === 'number' && !alias && typeof token.value !== 'number') {
      errors.push(`${name}: number token must contain a number or an alias`);
    }
    if (token.type === 'string' && !alias && typeof token.value !== 'string') {
      errors.push(`${name}: string token must contain a string or an alias`);
    }
  }

  const resolving = new Set();
  const resolved = new Set();
  function resolve(name) {
    if (resolved.has(name)) return;
    if (resolving.has(name)) {
      errors.push(`${name}: alias cycle detected`);
      return;
    }
    resolving.add(name);
    const token = tokens.get(name);
    const alias = typeof token?.value === 'string' ? token.value.match(ALIAS_PATTERN) : null;
    if (alias && tokens.has(alias[1])) resolve(alias[1]);
    resolving.delete(name);
    resolved.add(name);
  }
  for (const name of tokens.keys()) resolve(name);

  return { errors, tokens };
}

export function resolveTokenValues(tokens) {
  const memo = new Map();
  function resolve(name) {
    if (memo.has(name)) return memo.get(name);
    const token = tokens.get(name);
    if (!token) throw new Error(`Unknown token ${name}`);
    const alias = typeof token.value === 'string' ? token.value.match(ALIAS_PATTERN) : null;
    const raw = alias ? resolve(alias[1]) : token.value;
    const value = token.type === 'dimension' && raw && typeof raw === 'object' ? raw.value : raw;
    memo.set(name, value);
    return value;
  }
  for (const name of tokens.keys()) resolve(name);
  return memo;
}

export function stableObjectFromValues(values) {
  const root = {};
  for (const [name, value] of [...values].sort(([a], [b]) => a.localeCompare(b))) {
    const parts = name.split('.');
    let cursor = root;
    for (const part of parts.slice(0, -1)) cursor = cursor[part] ??= {};
    cursor[parts.at(-1)] = value;
  }
  return root;
}
