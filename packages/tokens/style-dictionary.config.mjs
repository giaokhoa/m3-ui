import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';

const BUTTON_VARIANTS = ['filled', 'elevated', 'filledTonal', 'outlined', 'text'];
const BUTTON_SIZES = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'];

function cssValue(value) {
  return String(value);
}

function percent(value) {
  return `${Number(value) * 100}%`;
}

function createButtonCss({ dictionary, options }) {
  const valueOf = (token) => options.usesDtcg ? token.$value : token.value;
  const tokens = new Map(
    dictionary.allTokens.map((token) => [token.path.join('.'), valueOf(token)]),
  );
  const get = (path) => {
    if (!tokens.has(path)) throw new Error(`Missing token for Button CSS: ${path}`);
    const value = tokens.get(path);
    if (value === undefined) throw new Error(`Undefined token for Button CSS: ${path}`);
    return value;
  };
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const typography = (role) => [
    line('--_button-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_button-font-size', get(`typography.${role}.fontSize`)),
    line('--_button-line-height', get(`typography.${role}.lineHeight`)),
    line('--_button-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_button-letter-spacing', get(`typography.${role}.letterSpacing`)),
  ];

  const baselineTypography = get('component.button.baseline.labelTypography');
  const base = [
    '.button {',
    line('--_button-min-width', get('component.button.baseline.minWidth')),
    line('--_button-min-height', get('component.button.baseline.minHeight')),
    line('--_button-padding-block', get('component.button.baseline.padding.block')),
    line('--_button-padding-inline-start', get('component.button.baseline.padding.inlineStart')),
    line('--_button-padding-inline-end', get('component.button.baseline.padding.inlineEnd')),
    line('--_button-icon-padding-block', get('component.button.baseline.iconPadding.block')),
    line('--_button-icon-padding-inline-start', get('component.button.baseline.iconPadding.inlineStart')),
    line('--_button-icon-padding-inline-end', get('component.button.baseline.iconPadding.inlineEnd')),
    line('--_button-container-radius', get(`shape.${get('component.button.baseline.containerShape')}`)),
    line('--_button-disabled-container-opacity', percent(get('component.button.baseline.disabledContainerOpacity'))),
    line('--_button-disabled-content-opacity', percent(get('component.button.baseline.disabledContentOpacity'))),
    line('--_button-outline-color', get('component.button.baseline.outlineColor')),
    line('--_button-outline-width', get('component.button.baseline.outlineWidth')),
    line('--_button-disabled-outline-opacity', percent(get('component.button.baseline.disabledOutlineOpacity'))),
    line('--_button-icon-size', get('component.button.baseline.iconSize')),
    line('--_button-icon-spacing', get('component.button.baseline.iconSpacing')),
    ...typography(baselineTypography),
    '}',
  ];

  const variants = BUTTON_VARIANTS.flatMap((variant) => {
    const prefix = `component.button.variant.${variant}`;
    const declarations = [
      line('--_button-container-color', get(`${prefix}.containerColor`)),
      line('--_button-content-color', get(`${prefix}.contentColor`)),
      line('--_button-disabled-container-color', get(`${prefix}.disabledContainerColor`)),
      line('--_button-disabled-content-color', get(`${prefix}.disabledContentColor`)),
    ];
    if (variant === 'outlined') {
      declarations.push(
        line('--_button-outline-color', get(`${prefix}.outlineColor`)),
        line('--_button-outline-width', get(`${prefix}.outlineWidth`)),
        line('--_button-disabled-outline-opacity', percent(get(`${prefix}.disabledOutlineOpacity`))),
      );
    }
    if (variant === 'text') {
      declarations.push(
        line('--_button-padding-block', get(`${prefix}.padding.block`)),
        line('--_button-padding-inline-start', get(`${prefix}.padding.inlineStart`)),
        line('--_button-padding-inline-end', get(`${prefix}.padding.inlineEnd`)),
        line('--_button-icon-padding-block', get(`${prefix}.iconPadding.block`)),
        line('--_button-icon-padding-inline-start', get(`${prefix}.iconPadding.inlineStart`)),
        line('--_button-icon-padding-inline-end', get(`${prefix}.iconPadding.inlineEnd`)),
      );
    }
    const className = variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    return ['', `.button--${className} {`, ...declarations, '}'];
  });

  const sizes = BUTTON_SIZES.flatMap((size) => {
    const prefix = `component.button.size.${size}`;
    const role = get(`${prefix}.typography`);
    return [
      '',
      `.button[data-size='${size}'] {`,
      line('--_button-min-height', get(`${prefix}.height`)),
      line('--_button-padding-block', get(`${prefix}.padding.block`)),
      line('--_button-padding-inline-start', get(`${prefix}.padding.inlineStart`)),
      line('--_button-padding-inline-end', get(`${prefix}.padding.inlineEnd`)),
      line('--_button-icon-padding-block', get(`${prefix}.iconPadding.block`)),
      line('--_button-icon-padding-inline-start', get(`${prefix}.iconPadding.inlineStart`)),
      line('--_button-icon-padding-inline-end', get(`${prefix}.iconPadding.inlineEnd`)),
      line('--_button-icon-size', get(`${prefix}.iconSize`)),
      line('--_button-icon-spacing', get(`${prefix}.iconSpacing`)),
      ...typography(role),
      '}',
    ];
  });

  return [...base, ...variants, ...sizes, ''].join('\n');
}

export default {
  source: ['tokens/**/*.json'],

  log: {
    warnings: logWarningLevels.error,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw,
    },
  },

  hooks: {
    formats: {
      'm3/button-css': createButtonCss,
    },
  },

  platforms: {
    js: {
      transformGroup: transformGroups.js,
      buildPath: 'dist/generated/',
      options: {
        showFileHeader: false,
      },
      files: [
        {
          destination: 'tokens.js',
          format: formats.javascriptEs6,
        },
        {
          destination: 'tokens.d.ts',
          format: formats.typescriptEs6Declarations,
          options: {
            outputStringLiterals: true,
          },
        },
      ],
    },
    css: {
      transformGroup: transformGroups.css,
      buildPath: 'dist/generated/',
      options: {
        showFileHeader: false,
      },
      files: [
        {
          destination: 'button.css',
          format: 'm3/button-css',
        },
      ],
    },
  },
};
