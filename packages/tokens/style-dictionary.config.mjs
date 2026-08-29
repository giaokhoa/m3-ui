import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';

const BUTTON_VARIANTS = ['filled', 'elevated', 'filledTonal', 'outlined', 'text'];
const BUTTON_SIZES = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'];
const ELEVATION_LEVELS = ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'];
const ELEVATION_LAYERS = ['layer1', 'layer2', 'layer3'];

function cssValue(value) {
  return String(value);
}

function percent(value) {
  return `${Number(value) * 100}%`;
}

function tokenReader({ dictionary, options }, consumer) {
  const valueOf = (token) => options.usesDtcg ? token.$value : token.value;
  const tokens = new Map(
    dictionary.allTokens.map((token) => [token.path.join('.'), valueOf(token)]),
  );

  return (path) => {
    if (!tokens.has(path)) throw new Error(`Missing token for ${consumer}: ${path}`);
    const value = tokens.get(path);
    if (value === undefined) throw new Error(`Undefined token for ${consumer}: ${path}`);
    return value;
  };
}

function createButtonCss(context) {
  const get = tokenReader(context, 'Button CSS');
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

function createElevationCss(context) {
  const get = tokenReader(context, 'Elevation CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shadowLayer = (level, layer) => {
    const prefix = `elevation.shadow.${level}.${layer}`;
    return [
      get(`${prefix}.offsetX`),
      get(`${prefix}.offsetY`),
      get(`${prefix}.blurRadius`),
      get(`${prefix}.spreadRadius`),
      `color-mix(in srgb, var(--_elevation-shadow-color) ${percent(get(`${prefix}.opacity`))}, transparent)`,
    ].join(' ');
  };

  const levels = ELEVATION_LEVELS.flatMap((level) => [
    '',
    `.elevation[data-elevation='${level}'] {`,
    line(
      '--_elevation-box-shadow',
      ELEVATION_LAYERS.map((layer) => shadowLayer(level, layer)).join(', '),
    ),
    '}',
  ]);

  return [
    '.elevation {',
    line('--_elevation-shadow-color', 'var(--shadow)'),
    line('--_elevation-box-shadow', 'none'),
    '}',
    ...levels,
    '',
  ].join('\n');
}

function createRippleCss(context) {
  const get = tokenReader(context, 'Ripple CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.ripple {',
    line('--_ripple-radius-duration', get('ripple.radiusDuration')),
    line('--_ripple-hover-duration', get('ripple.hoverTransitionDuration')),
    line('--_ripple-focus-in-duration', get('ripple.focusInTransitionDuration')),
    line('--_ripple-fade-in-duration', get('ripple.fadeInDuration')),
    line('--_ripple-fade-out-duration', get('ripple.fadeOutDuration')),
    line('--_ripple-radius-easing', get('ripple.radiusEasing')),
    line('--_ripple-center-easing', get('ripple.centerEasing')),
    line('--_ripple-opacity-easing', get('ripple.opacityEasing')),
    line('--_ripple-hover-opacity', get('state.layer.opacity.hover')),
    line('--_ripple-focus-opacity', get('state.layer.opacity.focus')),
    line('--_ripple-pressed-opacity', get('state.layer.opacity.pressed')),
    line('--_ripple-focus-ring-outer-inset', get('ripple.focusRing.outerStrokeInset')),
    line('--_ripple-focus-ring-outer-width', get('ripple.focusRing.outerStrokeWidth')),
    line('--_ripple-focus-ring-inner-inset', get('ripple.focusRing.innerStrokeInset')),
    line('--_ripple-focus-ring-inner-width', get('ripple.focusRing.innerStrokeWidth')),
    line('--_ripple-focus-ring-outer-color', get('ripple.focusRing.outerStrokeColor')),
    line('--_ripple-focus-ring-inner-color', get('ripple.focusRing.innerStrokeColor')),
    line('--_ripple-focus-ring-in-duration', get('ripple.focusRing.focusIn.duration')),
    line('--_ripple-focus-ring-in-easing', get('ripple.focusRing.focusIn.easing')),
    line('--_ripple-focus-ring-out-duration', get('ripple.focusRing.focusOut.duration')),
    line('--_ripple-focus-ring-out-easing', get('ripple.focusRing.focusOut.easing')),
    '}',
    '',
  ].join('\n');
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
      'm3/elevation-css': createElevationCss,
      'm3/ripple-css': createRippleCss,
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
        {
          destination: 'elevation.css',
          format: 'm3/elevation-css',
        },
        {
          destination: 'ripple.css',
          format: 'm3/ripple-css',
        },
      ],
    },
  },
};
