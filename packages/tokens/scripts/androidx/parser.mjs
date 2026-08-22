function lowerCamel(value) {
  return value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);
}

function shapeName(value) {
  const withoutPrefix = value.startsWith('Corner') ? value.slice('Corner'.length) : value;
  return lowerCamel(withoutPrefix);
}

function numberLiteral(expression) {
  const match = expression.match(/^(-?\d+(?:\.\d+)?)(?:f)?$/);
  return match ? Number(match[1]) : null;
}

export function normalizeTokenExpression(expression, context = 'token') {
  const value = expression.trim();
  const numeric = numberLiteral(value);
  if (numeric !== null) return numeric;
  const dp = value.match(/^(-?\d+(?:\.\d+)?)\.dp$/);
  if (dp) return Number(dp[1]);
  const color = value.match(/^ColorSchemeKeyTokens\.(\w+)$/);
  if (color) return { kind: 'color', value: lowerCamel(color[1]) };
  const elevation = value.match(/^ElevationTokens\.Level(\d+)$/);
  if (elevation) return { kind: 'elevation', value: `level${elevation[1]}` };
  const shape = value.match(/^ShapeKeyTokens\.(\w+)$/);
  if (shape) return { kind: 'shape', value: shapeName(shape[1]) };
  const typography = value.match(/^TypographyKeyTokens\.(\w+)$/);
  if (typography) return { kind: 'typography', value: lowerCamel(typography[1]) };
  const ref = value.match(/^(\w+Tokens)\.(\w+)$/);
  if (ref) return { kind: 'ref', set: lowerCamel(ref[1].slice(0, -'Tokens'.length)), token: lowerCamel(ref[2]) };
  throw new Error(`Unsupported AndroidX token expression in ${context}: ${value}`);
}

export function parseAndroidXTokenFile(source, sourcePath = '<source>') {
  const version = source.match(/^\/\/ VERSION:\s*(\S+)/m)?.[1];
  const objectName = source.match(/\binternal object\s+(\w+)/)?.[1];
  if (!version) throw new Error(`Missing token VERSION in ${sourcePath}`);
  if (!objectName) throw new Error(`Missing internal token object in ${sourcePath}`);
  const declarations = [];
  const patterns = [
    /\bconst val\s+(\w+)\s*=\s*([^\n]+)/g,
    /\binline val\s+(\w+)(?:\s*:\s*[^\n]+)?\s*\n\s*get\(\)\s*=\s*([^\n]+)/g,
  ];
  for (const regex of patterns) {
    for (const match of source.matchAll(regex)) declarations.push({ index: match.index ?? 0, name: match[1], expression: match[2].trim() });
  }
  declarations.sort((a, b) => a.index - b.index);
  const declaredNames = [...source.matchAll(/\b(?:const|inline) val\s+(\w+)/g)].map((match) => match[1]);
  const parsedNames = declarations.map((item) => item.name);
  const missing = declaredNames.filter((name) => !parsedNames.includes(name));
  if (missing.length > 0) throw new Error(`Unsupported declaration syntax in ${sourcePath}: ${missing.join(', ')}`);
  if (declarations.length === 0) throw new Error(`No token declarations found in ${sourcePath}`);
  const tokens = {};
  for (const declaration of declarations) tokens[lowerCamel(declaration.name)] = normalizeTokenExpression(declaration.expression, `${sourcePath}#${declaration.name}`);
  return { version, objectName, tokens };
}
