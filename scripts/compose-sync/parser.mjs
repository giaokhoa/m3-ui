function lowerCamel(value) {
  return value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);
}

function shapeName(value) {
  const withoutPrefix = value.startsWith('Corner')
    ? value.slice('Corner'.length)
    : value;
  return lowerCamel(withoutPrefix);
}

function numberLiteral(expression) {
  const match = expression.match(/^(-?\d+(?:\.\d+)?)(?:f)?$/);
  return match ? Number(match[1]) : null;
}

function scanTopLevel(value, callback) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth -= 1;
    if (depth === 0 && callback(index, char)) return index;
  }
  return -1;
}

function findTopLevelSequence(value, sequence) {
  return scanTopLevel(value, (index) => value.startsWith(sequence, index));
}

function splitTopLevel(value, delimiter = ',') {
  const items = [];
  let start = 0;
  while (start <= value.length) {
    const rest = value.slice(start);
    const relative = scanTopLevel(rest, (index) =>
      rest.startsWith(delimiter, index),
    );
    if (relative < 0) {
      const tail = rest.trim();
      if (tail) items.push(tail);
      break;
    }
    const item = rest.slice(0, relative).trim();
    if (item) items.push(item);
    start += relative + delimiter.length;
  }
  return items;
}

function parseCall(value, context) {
  const open = value.indexOf('(');
  if (open <= 0 || !value.endsWith(')')) return null;
  const callee = value.slice(0, open).trim();
  if (!/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(callee)) return null;

  const body = value.slice(open + 1, -1).trim();
  const positional = [];
  const named = {};
  for (const argument of splitTopLevel(body)) {
    const equals = findTopLevelSequence(argument, '=');
    if (equals > 0) {
      const name = argument.slice(0, equals).trim();
      if (!/^\w+$/.test(name)) {
        throw new Error(`Unsupported named argument in ${context}: ${argument}`);
      }
      named[name] = normalizeTokenExpression(
        argument.slice(equals + 1),
        context,
      );
    } else {
      positional.push(normalizeTokenExpression(argument, context));
    }
  }

  return {
    kind: 'call',
    callee,
    ...(positional.length ? { args: positional } : {}),
    ...(Object.keys(named).length ? { named } : {}),
  };
}

export function normalizeTokenExpression(expression, context = 'token') {
  const value = expression.trim().replace(/,$/, '').trim();
  const numeric = numberLiteral(value);
  if (numeric !== null) return numeric;

  const unit = value.match(/^(-?\d+(?:\.\d+)?)\.(dp|sp)$/);
  if (unit) {
    const amount = Number(unit[1]);
    return unit[2] === 'dp' ? amount : { kind: 'sp', value: amount };
  }

  if (value === 'true' || value === 'false') return value === 'true';
  if (value === 'null') return null;
  if (/^"(?:[^"\\]|\\.)*"$/.test(value)) return JSON.parse(value);

  const elvis = findTopLevelSequence(value, '?:');
  if (elvis >= 0) {
    return {
      kind: 'fallback',
      primary: normalizeTokenExpression(value.slice(0, elvis), context),
      fallback: normalizeTokenExpression(value.slice(elvis + 2), context),
    };
  }

  const color = value.match(/^ColorSchemeKeyTokens\.(\w+)$/);
  if (color) return { kind: 'color', value: lowerCamel(color[1]) };

  const elevation = value.match(/^ElevationTokens\.Level(\d+)$/);
  if (elevation) {
    return { kind: 'elevation', value: `level${elevation[1]}` };
  }

  const shape = value.match(/^ShapeKeyTokens\.(\w+)$/);
  if (shape) return { kind: 'shape', value: shapeName(shape[1]) };

  const typography = value.match(/^TypographyKeyTokens\.(\w+)$/);
  if (typography) {
    return { kind: 'typography', value: lowerCamel(typography[1]) };
  }

  const fontFamily = value.match(/^FontFamily\.(\w+)$/);
  if (fontFamily) {
    return { kind: 'fontFamily', value: lowerCamel(fontFamily[1]) };
  }

  const fontWeight = value.match(/^FontWeight\.(\w+)$/);
  if (fontWeight) {
    const weight =
      fontWeight[1] === 'Normal' ? 'regular' : lowerCamel(fontWeight[1]);
    return { kind: 'fontWeight', value: weight };
  }

  const ref = value.match(/^(\w+Tokens)\.(\w+)$/);
  if (ref) {
    return {
      kind: 'ref',
      set: lowerCamel(ref[1].slice(0, -'Tokens'.length)),
      token: lowerCamel(ref[2]),
    };
  }

  const call = parseCall(value, context);
  if (call) return call;

  if (/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(value)) {
    return { kind: 'symbol', value };
  }

  throw new Error(
    `Unsupported AndroidX token expression in ${context}: ${value}`,
  );
}

function findTypeBody(source, sourcePath) {
  const typeMatch = /\binternal\s+(object|class)\s+(\w+)/.exec(source);
  if (!typeMatch) {
    throw new Error(`Missing internal token object/class in ${sourcePath}`);
  }

  const open = source.indexOf('{', typeMatch.index + typeMatch[0].length);
  if (open < 0) throw new Error(`Missing token body in ${sourcePath}`);

  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          declarationKind: typeMatch[1],
          objectName: typeMatch[2],
          body: source.slice(open + 1, index),
        };
      }
    }
  }
  throw new Error(`Unterminated token body in ${sourcePath}`);
}

function readExpression(body, start) {
  let index = start;
  while (/\s/.test(body[index] ?? '')) index += 1;
  const expressionStart = index;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (; index < body.length; index += 1) {
    const char = body[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth -= 1;
    if (depth === 0 && char === '\n') break;
  }

  return {
    expression: body.slice(expressionStart, index).trim(),
    end: index,
  };
}

function parseDeclarations(body, sourcePath) {
  const declarations = [];
  const header =
    /(?:^|\n)[ \t]*(?:(const|inline)\s+)?val\s+(\w+)(?:\s*:\s*([^\n=]+))?[ \t]*(=?)/g;
  let match;

  while ((match = header.exec(body))) {
    const name = match[2];
    let cursor = header.lastIndex;

    if (match[4] !== '=') {
      const getter = /[ \t\r\n]*(?:inline\s+)?get\(\)[ \t]*=/y;
      getter.lastIndex = cursor;
      const getterMatch = getter.exec(body);
      if (!getterMatch) {
        throw new Error(
          `Token declaration ${sourcePath}#${name} has no initializer/getter`,
        );
      }
      cursor = getter.lastIndex;
    }

    const { expression, end } = readExpression(body, cursor);
    if (!expression) {
      throw new Error(`Empty token expression in ${sourcePath}#${name}`);
    }
    declarations.push({
      index: match.index,
      name,
      expression,
    });
    header.lastIndex = end;
  }

  if (declarations.length === 0) {
    throw new Error(`No token declarations found in ${sourcePath}`);
  }
  return declarations;
}

export function parseAndroidXTokenFile(source, sourcePath = '<source>') {
  const version = source.match(/^\/\/ VERSION:\s*(\S+)/m)?.[1] ?? null;
  const { declarationKind, objectName, body } = findTypeBody(
    source,
    sourcePath,
  );
  const declarations = parseDeclarations(body, sourcePath);

  const tokens = {};
  for (const declaration of declarations) {
    tokens[lowerCamel(declaration.name)] = normalizeTokenExpression(
      declaration.expression,
      `${sourcePath}#${declaration.name}`,
    );
  }

  return { version, declarationKind, objectName, tokens };
}

function renderValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(renderValue).join(', ')}]`;
  const entries = Object.entries(value).map(
    ([key, item]) => `${key}: ${renderValue(item)}`,
  );
  return `{ ${entries.join(', ')} }`;
}

export function renderGeneratedTokenModule({
  revision,
  sourcePath,
  blobSha,
  exportName,
  parsed,
}) {
  const sourceExportName = exportName.replace(/Generated$/, 'Source');
  const tokenLines = Object.entries(parsed.tokens).map(
    ([key, value]) => `  ${key}: ${renderValue(value)},`,
  );

  return (
    '// Generated by scripts/compose-sync. DO NOT EDIT.\n' +
    `// Source: https://github.com/androidx/androidx/blob/${revision}/${sourcePath}\n\n` +
    `export const ${sourceExportName} = {\n` +
    "  repository: 'androidx/androidx',\n" +
    `  revision: '${revision}',\n` +
    `  path: '${sourcePath}',\n` +
    `  blobSha: '${blobSha}',\n` +
    `  version: ${parsed.version === null ? 'null' : `'${parsed.version}'`},\n` +
    `  declaration: '${parsed.declarationKind}',\n` +
    `  object: '${parsed.objectName}',\n` +
    '} as const;\n\n' +
    `export const ${exportName} = {\n${tokenLines.join('\n')}\n} as const;\n`
  );
}
