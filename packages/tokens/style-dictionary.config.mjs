import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  transformGroups,
} from 'style-dictionary/enums';

const BUTTON_VARIANTS = ['filled', 'elevated', 'filledTonal', 'outlined', 'text'];
const BUTTON_SIZES = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'];
const CHIP_ACTION_VARIANTS = ['assist', 'elevatedAssist', 'suggestion', 'elevatedSuggestion'];
const CHIP_SELECTABLE_VARIANTS = ['filter', 'elevatedFilter', 'input'];
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

function createChipCss(context) {
  const get = tokenReader(context, 'Chip CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const className = (variant) => variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const withOpacity = (color, opacity) => {
    const numericOpacity = Number(opacity);
    if (color === 'transparent' || numericOpacity <= 0) return 'transparent';
    if (numericOpacity >= 1) return color;
    return `color-mix(in srgb, ${color} ${percent(numericOpacity)}, transparent)`;
  };

  const actionBase = 'component.chip.action.base';
  const actionRules = CHIP_ACTION_VARIANTS.flatMap((variant) => {
    const prefix = `component.chip.variant.${variant}`;
    const selector = `.chip--${className(variant)} > .chip__visual`;
    return [
      '', `${selector} {`,
      line('--_chip-container-color', get(`${prefix}.containerColor`)),
      line('--_chip-label-color', get(`${prefix}.labelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.leadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.trailingIconColor`)),
      line('--_chip-outline-color', get(`${prefix}.outlineColor`)),
      line('--_chip-outline-width', get(`${prefix}.outlineWidth`)),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual {`,
      line('--_chip-container-color', withOpacity(get(`${prefix}.disabledContainerColor`), get(`${prefix}.disabledContainerOpacity`))),
      line('--_chip-label-color', withOpacity(get(`${actionBase}.disabledLabelColor`), get(`${actionBase}.disabledLabelOpacity`))),
      line('--_chip-leading-icon-color', withOpacity(get(`${actionBase}.disabledIconColor`), get(`${actionBase}.disabledIconOpacity`))),
      line('--_chip-trailing-icon-color', withOpacity(get(`${actionBase}.disabledIconColor`), get(`${actionBase}.disabledIconOpacity`))),
      line('--_chip-outline-color', withOpacity(get(`${prefix}.disabledOutlineColor`), get(`${prefix}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', get(`${prefix}.outlineWidth`)),
      '}',
    ];
  });

  const selectableBase = 'component.chip.selectable.base';
  const selectableRules = CHIP_SELECTABLE_VARIANTS.flatMap((variant) => {
    const prefix = `component.chip.variant.${variant}`;
    const selector = `.chip--${className(variant)} > .chip__visual`;
    const elevated = variant === 'elevatedFilter';
    const unselectedOutlineColor = elevated ? get(`${prefix}.unselectedOutlineColor`) : get(`${selectableBase}.unselectedOutlineColor`);
    const disabledUnselectedOutlineColor = elevated ? get(`${prefix}.disabledUnselectedOutlineColor`) : get(`${selectableBase}.disabledUnselectedOutlineColor`);
    const unselectedOutlineWidth = elevated ? get(`${prefix}.unselectedOutlineWidth`) : get(`${selectableBase}.unselectedOutlineWidth`);
    const disabledUnselectedContainerColor = elevated ? get(`${prefix}.disabledUnselectedContainerColor`) : get(`${selectableBase}.disabledUnselectedContainerColor`);

    return [
      '', `${selector} {`,
      line('--_chip-container-color', get(`${prefix}.unselectedContainerColor`)),
      line('--_chip-label-color', get(`${prefix}.unselectedLabelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.unselectedLeadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.unselectedTrailingIconColor`)),
      line('--_chip-outline-color', unselectedOutlineColor),
      line('--_chip-outline-width', unselectedOutlineWidth),
      '}', '', `${selector}[data-selected] {`,
      line('--_chip-container-color', get(`${prefix}.selectedContainerColor`)),
      line('--_chip-label-color', get(`${prefix}.selectedLabelColor`)),
      line('--_chip-leading-icon-color', get(`${prefix}.selectedLeadingIconColor`)),
      line('--_chip-trailing-icon-color', get(`${prefix}.selectedTrailingIconColor`)),
      line('--_chip-outline-color', get(`${selectableBase}.selectedOutlineColor`)),
      line('--_chip-outline-width', get(`${selectableBase}.selectedOutlineWidth`)),
      '}', '', `${selector}[data-expressive-shapes]:not([data-selected]) {`,
      line('--_chip-leading-icon-color', get(`${prefix}.expressiveUnselectedLeadingIconColor`)),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual {`,
      line('--_chip-container-color', withOpacity(disabledUnselectedContainerColor, get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-label-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-leading-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-trailing-icon-color', withOpacity(get(`${selectableBase}.disabledContentColor`), get(`${selectableBase}.disabledContentOpacity`))),
      line('--_chip-outline-color', withOpacity(disabledUnselectedOutlineColor, get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', unselectedOutlineWidth),
      '}', '', `.chip--${className(variant)}[data-disabled] > .chip__visual[data-selected] {`,
      line('--_chip-container-color', withOpacity(get(`${selectableBase}.disabledSelectedContainerColor`), get(`${selectableBase}.disabledContainerOpacity`))),
      line('--_chip-outline-color', withOpacity(get(`${selectableBase}.disabledSelectedOutlineColor`), get(`${selectableBase}.disabledOutlineOpacity`))),
      line('--_chip-outline-width', get(`${selectableBase}.selectedOutlineWidth`)),
      '}',
    ];
  });

  return [...actionRules, ...selectableRules, ''].join('\n');
}

function createTextFieldCss(context) {
  const get = tokenReader(context, 'TextField CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shared = 'component.textField.shared';
  const typography = (role) => [
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-family`, `var(--font-family-${get(`${shared}.typography.${role}.fontFamily`)})`),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-size`, get(`${shared}.typography.${role}.fontSize`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-line-height`, get(`${shared}.typography.${role}.lineHeight`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-font-weight`, get(`${shared}.typography.${role}.fontWeight`)),
    line(`--_text-field-${role === 'bodyLarge' ? 'body-large' : 'body-small'}-letter-spacing`, get(`${shared}.typography.${role}.letterSpacing`)),
  ];

  const base = [
    '.text-field {',
    line('--_text-field-min-width', get(`${shared}.minWidth`)),
    line('--_text-field-min-height', get(`${shared}.minHeight`)),
    line('--_text-field-input-min-line-height', get(`${shared}.lineHeight.inputMin`)),
    line('--_text-field-focused-label-min-line-height', get(`${shared}.lineHeight.focusedLabelMin`)),
    line('--_text-field-supporting-min-line-height', get(`${shared}.lineHeight.supportingMin`)),
    line('--_text-field-icon-size', get(`${shared}.iconSize`)),
    line('--_text-field-icon-slot-size', get(`${shared}.iconSlotSize`)),
    line('--_text-field-text-color', get(`${shared}.colors.text`)),
    line('--_text-field-disabled-text-color', get(`${shared}.colors.disabledText`)),
    line('--_text-field-cursor-color', get(`${shared}.colors.cursor`)),
    line('--_text-field-error-cursor-color', get(`${shared}.colors.errorCursor`)),
    line('--_text-field-label-color', get(`${shared}.colors.label`)),
    line('--_text-field-focused-label-color', get(`${shared}.colors.focusedLabel`)),
    line('--_text-field-disabled-label-color', get(`${shared}.colors.disabledLabel`)),
    line('--_text-field-error-label-color', get(`${shared}.colors.errorLabel`)),
    line('--_text-field-placeholder-color', get(`${shared}.colors.placeholder`)),
    line('--_text-field-disabled-placeholder-color', get(`${shared}.colors.disabledPlaceholder`)),
    line('--_text-field-supporting-color', get(`${shared}.colors.supporting`)),
    line('--_text-field-disabled-supporting-color', get(`${shared}.colors.disabledSupporting`)),
    line('--_text-field-error-supporting-color', get(`${shared}.colors.errorSupporting`)),
    line('--_text-field-leading-icon-color', get(`${shared}.colors.leadingIcon`)),
    line('--_text-field-trailing-icon-color', get(`${shared}.colors.trailingIcon`)),
    line('--_text-field-disabled-leading-icon-color', get(`${shared}.colors.disabledLeadingIcon`)),
    line('--_text-field-disabled-trailing-icon-color', get(`${shared}.colors.disabledTrailingIcon`)),
    line('--_text-field-error-leading-icon-color', get(`${shared}.colors.errorLeadingIcon`)),
    line('--_text-field-error-trailing-icon-color', get(`${shared}.colors.errorTrailingIcon`)),
    line('--_text-field-prefix-color', get(`${shared}.colors.prefix`)),
    line('--_text-field-suffix-color', get(`${shared}.colors.suffix`)),
    line('--_text-field-disabled-opacity', get(`${shared}.disabledOpacity`)),
    ...typography('bodyLarge'),
    ...typography('bodySmall'),
    line('--_text-field-fast-effects-duration', get(`${shared}.motion.fastEffects.duration`)),
    line('--_text-field-fast-effects-easing', get(`${shared}.motion.fastEffects.easing`)),
    line('--_text-field-fast-spatial-duration', get(`${shared}.motion.fastSpatial.duration`)),
    line('--_text-field-fast-spatial-easing', get(`${shared}.motion.fastSpatial.easing`)),
    '}',
  ];

  const filled = 'component.textField.filled';
  const filledRule = [
    '', '.text-field--filled {',
    line('--_text-field-padding-inline', get(`${filled}.contentPadding.inline`)),
    line('--_text-field-padding-with-label', get(`${filled}.contentPadding.blockWithLabel`)),
    line('--_text-field-padding-without-label', get(`${filled}.contentPadding.blockWithoutLabel`)),
    line('--_text-field-supporting-top', get(`${filled}.contentPadding.supportingTop`)),
    line('--_text-field-affix-padding', get(`${filled}.contentPadding.affix`)),
    line('--_text-field-after-icon-padding', get(`${filled}.contentPadding.afterIcon`)),
    line('--_text-field-radius-top-start', get(`${filled}.containerShape.topStartRadius`)),
    line('--_text-field-radius-top-end', get(`${filled}.containerShape.topEndRadius`)),
    line('--_text-field-radius-bottom-end', get(`${filled}.containerShape.bottomEndRadius`)),
    line('--_text-field-radius-bottom-start', get(`${filled}.containerShape.bottomStartRadius`)),
    line('--_text-field-indicator-width', get(`${filled}.indicator.unfocusedThickness`)),
    line('--_text-field-indicator-focused-width', get(`${filled}.indicator.focusedThickness`)),
    line('--_text-field-container-color', get(`${filled}.colors.container`)),
    line('--_text-field-indicator-color', get(`${filled}.colors.indicator`)),
    line('--_text-field-focused-indicator-color', get(`${filled}.colors.focusedIndicator`)),
    line('--_text-field-disabled-indicator-color', get(`${filled}.colors.disabledIndicator`)),
    line('--_text-field-error-indicator-color', get(`${filled}.colors.errorIndicator`)),
    '}',
  ];

  const outlined = 'component.textField.outlined';
  const outlinedRule = [
    '', '.text-field--outlined {',
    line('--_text-field-padding-inline', get(`${outlined}.contentPadding.inline`)),
    line('--_text-field-padding-with-label', get(`${outlined}.contentPadding.block`)),
    line('--_text-field-padding-without-label', get(`${outlined}.contentPadding.block`)),
    line('--_text-field-supporting-top', get(`${outlined}.contentPadding.supportingTop`)),
    line('--_text-field-affix-padding', get(`${outlined}.contentPadding.affix`)),
    line('--_text-field-after-icon-padding', get(`${outlined}.contentPadding.afterIcon`)),
    line('--_text-field-cutout-padding-inline', get(`${outlined}.contentPadding.cutoutInline`)),
    line('--_text-field-outlined-top-padding', get(`${outlined}.contentPadding.topPadding`)),
    line('--_text-field-radius-top-start', get(`${outlined}.containerShape.topStartRadius`)),
    line('--_text-field-radius-top-end', get(`${outlined}.containerShape.topEndRadius`)),
    line('--_text-field-radius-bottom-end', get(`${outlined}.containerShape.bottomEndRadius`)),
    line('--_text-field-radius-bottom-start', get(`${outlined}.containerShape.bottomStartRadius`)),
    line('--_text-field-container-color', get(`${outlined}.colors.container`)),
    line('--_text-field-outline-width', get(`${outlined}.outline.unfocusedThickness`)),
    line('--_text-field-outline-focused-width', get(`${outlined}.outline.focusedThickness`)),
    line('--_text-field-disabled-outline-opacity', get(`${outlined}.outline.disabledOpacity`)),
    line('--_text-field-outline-color', get(`${outlined}.colors.outline`)),
    line('--_text-field-focused-outline-color', get(`${outlined}.colors.focusedOutline`)),
    line('--_text-field-disabled-outline-color', get(`${outlined}.colors.disabledOutline`)),
    line('--_text-field-error-outline-color', get(`${outlined}.colors.errorOutline`)),
    '}',
  ];

  return [...base, ...filledRule, ...outlinedRule, ''].join('\n');
}

function createElevationCss(context) {
  const get = tokenReader(context, 'Elevation CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shadowLayer = (level, layer) => {
    const prefix = `elevation.shadow.${level}.${layer}`;
    return [
      get(`${prefix}.offsetX`), get(`${prefix}.offsetY`), get(`${prefix}.blurRadius`), get(`${prefix}.spreadRadius`),
      `color-mix(in srgb, var(--_elevation-shadow-color) ${percent(get(`${prefix}.opacity`))}, transparent)`,
    ].join(' ');
  };
  const shadow = (level) => level === 'level0'
    ? 'none'
    : ELEVATION_LAYERS.map((layer) => shadowLayer(level, layer)).join(', ');
  const levels = ELEVATION_LEVELS.flatMap((level) => ['', `.elevation[data-elevation='${level}'] {`, line('--_elevation-box-shadow', shadow(level)), '}']);
  return ['.elevation {', line('--_elevation-shadow-color', 'var(--shadow)'), line('--_elevation-box-shadow', 'none'), '}', ...levels, ''].join('\n');
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
    '}', '',
  ].join('\n');
}

export default {
  source: ['tokens/**/*.json'],
  log: { warnings: logWarningLevels.error, errors: { brokenReferences: logBrokenReferenceLevels.throw } },
  hooks: {
    formats: {
      'm3/button-css': createButtonCss,
      'm3/chip-css': createChipCss,
      'm3/text-field-css': createTextFieldCss,
      'm3/elevation-css': createElevationCss,
      'm3/ripple-css': createRippleCss,
    },
  },
  platforms: {
    js: {
      transformGroup: transformGroups.js,
      buildPath: 'dist/generated/',
      options: { showFileHeader: false },
      files: [
        { destination: 'tokens.js', format: formats.javascriptEs6 },
        { destination: 'tokens.d.ts', format: formats.typescriptEs6Declarations, options: { outputStringLiterals: true } },
      ],
    },
    css: {
      transformGroup: transformGroups.css,
      buildPath: 'dist/generated/',
      options: { showFileHeader: false },
      files: [
        { destination: 'button.css', format: 'm3/button-css' },
        { destination: 'chip.css', format: 'm3/chip-css' },
        { destination: 'text-field.css', format: 'm3/text-field-css' },
        { destination: 'elevation.css', format: 'm3/elevation-css' },
        { destination: 'ripple.css', format: 'm3/ripple-css' },
      ],
    },
  },
};
