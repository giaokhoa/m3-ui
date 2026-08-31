function cssValue(value) {
  return String(value);
}

function percent(value) {
  return `${Number(value) * 100}%`;
}

function tokenReader({ dictionary, options }) {
  const valueOf = (token) => (options.usesDtcg ? token.$value : token.value);
  const tokens = new Map(
    dictionary.allTokens.map((token) => [token.path.join('.'), valueOf(token)]),
  );

  return (path) => {
    if (!tokens.has(path)) throw new Error(`Missing token for Card CSS: ${path}`);
    const value = tokens.get(path);
    if (value === undefined) throw new Error(`Undefined token for Card CSS: ${path}`);
    return value;
  };
}

function composite(color, opacity, over) {
  const numericOpacity = Number(opacity);
  if (numericOpacity <= 0) return over;
  if (numericOpacity >= 1) return color;
  return `color-mix(in srgb, ${color} ${percent(numericOpacity)}, ${over})`;
}

export function createCardCss(context) {
  const get = tokenReader(context);
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const base = 'component.card.base';

  const variantRule = (variant) => {
    const prefix = `component.card.variant.${variant}`;
    const declarations = [
      line('--_card-container-color', get(`${prefix}.containerColor`)),
      line('--_card-content-color', get(`${prefix}.contentColor`)),
      line(
        '--_card-disabled-container-color',
        composite(
          get(`${prefix}.disabledContainerColor`),
          get(`${prefix}.disabledContainerOpacity`),
          get(`${prefix}.disabledCompositeOver`),
        ),
      ),
    ];

    if (variant === 'outlined') {
      declarations.push(
        line('--_card-outline-width', get(`${prefix}.outline.width`)),
        line('--_card-outline-color', get(`${prefix}.outline.color`)),
        line(
          '--_card-disabled-outline-color',
          composite(
            get(`${prefix}.outline.disabledColor`),
            get(`${prefix}.outline.disabledOpacity`),
            get(`${prefix}.outline.disabledCompositeOver`),
          ),
        ),
      );
    }

    return ['', `.card--${variant} {`, ...declarations, '}'];
  };

  return [
    '.card {',
    line('--_card-container-radius', get(`${base}.shapeRadius`)),
    line('--_card-min-interactive-size', get(`${base}.minimumInteractiveSize`)),
    line(
      '--_card-disabled-content-color',
      composite(
        get(`${base}.disabledContentColor`),
        get(`${base}.disabledContentOpacity`),
        'transparent',
      ),
    ),
    '}',
    ...variantRule('filled'),
    ...variantRule('elevated'),
    ...variantRule('outlined'),
    '',
  ].join('\n');
}
