import {
  cssValue,
  defineCssAdapter,
  percent,
  tokenReader,
} from '../adapter-helpers.mjs';

const variants = ['filled', 'elevated', 'filledTonal', 'outlined', 'text'];
const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'];

export function createButtonCss(context) {
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

  const variantRules = variants.flatMap((variant) => {
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

  const sizeRules = sizes.flatMap((size) => {
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

  return [...base, ...variantRules, ...sizeRules, ''].join('\n');
}

export default defineCssAdapter('button', createButtonCss);
