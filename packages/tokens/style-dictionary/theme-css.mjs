const COLOR_ROLES = [
  'background',
  'onBackground',
  'surface',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'inverseSurface',
  'inverseOnSurface',
  'outline',
  'outlineVariant',
  'shadow',
  'scrim',
  'surfaceTint',
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'inversePrimary',
  'primaryFixed',
  'primaryFixedDim',
  'onPrimaryFixed',
  'onPrimaryFixedVariant',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'secondaryFixed',
  'secondaryFixedDim',
  'onSecondaryFixed',
  'onSecondaryFixedVariant',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'tertiaryFixed',
  'tertiaryFixedDim',
  'onTertiaryFixed',
  'onTertiaryFixedVariant',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
];

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function tokenReader({ dictionary, options }) {
  const valueOf = (token) => (options.usesDtcg ? token.$value : token.value);
  const tokens = new Map(
    dictionary.allTokens.map((token) => [token.path.join('.'), valueOf(token)]),
  );

  return (path) => {
    if (!tokens.has(path)) throw new Error(`Missing token for Theme CSS: ${path}`);
    const value = tokens.get(path);
    if (value === undefined) throw new Error(`Undefined token for Theme CSS: ${path}`);
    return value;
  };
}

export function createThemeCss(context) {
  const get = tokenReader(context);
  const line = (name, value) => `  ${name}: ${String(value)};`;
  const scheme = (mode) => COLOR_ROLES.map((role) =>
    line(`--${camelToKebab(role)}`, get(`theme.baseline.${mode}.${role}`)),
  );

  const typography = [
    line('--font-family-plain', `'${get('typeface.plain')}', ${get('typeface.fallback')}`),
    line('--font-family-brand', `'${get('typeface.brand')}', ${get('typeface.fallback')}`),
    line('font-family', 'var(--font-family-plain)'),
  ];

  return [
    '[data-m3-theme] {',
    ...typography,
    '}',
    '',
    "[data-m3-theme][data-theme='light'] {",
    line('color-scheme', 'light'),
    ...scheme('light'),
    '}',
    '',
    "[data-m3-theme][data-theme='dark'] {",
    line('color-scheme', 'dark'),
    ...scheme('dark'),
    '}',
    '',
  ].join('\n');
}
