import { readFile } from 'node:fs/promises';

export const ALIAS_PATTERN = /^\{([A-Za-z0-9_.-]+)\}$/;

export async function readCanonical(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export function collectTokens(root) {
  const tokens = new Map();

  function visit(node, path = [], inheritedType) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    const type = node.$type ?? inheritedType;

    if (Object.hasOwn(node, '$value')) {
      const name = path.join('.');
      if (!name) throw new Error('Root cannot be a token');
      tokens.set(name, { path, type, value: node.$value, node });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      visit(value, [...path, key], type);
    }
  }

  visit(root);
  return tokens;
}

export function validateCanonical(root) {
  const errors = [];
  const metadata = root?.$extensions?.['m3-ui'];
  if (metadata?.authority !== 'canonical') {
    errors.push('root $extensions.m3-ui.authority must be "canonical"');
  }
  if (metadata?.policy !== 'manual-review') {
    errors.push('root $extensions.m3-ui.policy must be "manual-review"');
  }

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
