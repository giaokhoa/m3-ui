import {
  cssValue,
  defineCssAdapter,
  percent,
  tokenReader,
} from '../adapter-helpers.mjs';

function rule(selector, declarations) {
  return ['', `${selector} {`, ...declarations, '}'];
}

export function createToggleButtonCss(context) {
  const get = tokenReader(context, 'ToggleButton CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (name) => get(`shape.${name}`);
  const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'];
  const root = 'component.toggleButton';

  const sizeRules = sizes.flatMap((size) => {
    const button = `component.button.size.${size}`;
    return rule(`.toggle-button[data-size='${size}']`, [
      line('--_toggle-button-normal-radius', shape(get(`${button}.containerShapeRound`))),
      line('--_toggle-button-selected-radius', shape(get(`${button}.containerShapeSquare`))),
      line('--_toggle-button-pressed-radius', shape(get(`${button}.pressedShape`))),
      line('--_toggle-button-outline-width', get(`${button}.outlineWidth`)),
    ]);
  });

  const variantRules = ['filled', 'elevated', 'filledTonal', 'outlined'].flatMap((variant) => {
    const tokenRoot = `${root}.variant.${variant}`;
    const className = variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const base = [
      line('--_button-container-color', get(`${tokenRoot}.unselectedContainerColor`)),
      line('--_button-content-color', get(`${tokenRoot}.unselectedContentColor`)),
      line('--_button-disabled-container-color', get(`${tokenRoot}.disabledContainerColor`)),
      line('--_button-outline-color', variant === 'outlined' ? get(`${tokenRoot}.outlineColor`) : 'transparent'),
      line('--_button-outline-width', variant === 'outlined' ? 'var(--_toggle-button-outline-width)' : '0px'),
    ];
    const selected = [
      line('--_button-container-color', get(`${tokenRoot}.selectedContainerColor`)),
      line('--_button-content-color', get(`${tokenRoot}.selectedContentColor`)),
      ...(variant === 'outlined' ? [line('--_button-outline-width', '0px')] : []),
    ];
    return [
      ...rule(`.toggle-button--${className}`, base),
      ...rule(`.toggle-button--${className}[data-selected]`, selected),
    ];
  });

  return [
    '.toggle-button {',
    line('--_toggle-button-normal-radius', shape(get('component.button.size.small.containerShapeRound'))),
    line('--_toggle-button-selected-radius', shape(get('component.button.size.small.containerShapeSquare'))),
    line('--_toggle-button-pressed-radius', shape(get('component.button.size.small.pressedShape'))),
    line('--_toggle-button-outline-width', get('component.button.size.small.outlineWidth')),
    line('--_button-container-radius', 'var(--_toggle-button-normal-radius)'),
    line('--_button-disabled-container-opacity', percent(get(`${root}.disabled.containerOpacity`))),
    line('--_button-disabled-content-color', get(`${root}.disabled.contentColor`)),
    line('--_button-disabled-content-opacity', percent(get(`${root}.disabled.contentOpacity`))),
    line('--_button-disabled-outline-opacity', percent(get(`${root}.disabled.outlineOpacity`))),
    line('--_toggle-button-effects-duration', get(`${root}.motion.effectsDuration`)),
    line('--_toggle-button-effects-easing', get(`${root}.motion.effectsEasing`)),
    '}',
    ...sizeRules,
    ...rule(".toggle-button[data-size='extraSmall']", [
      line('--_button-icon-spacing', get(`${root}.size.extraSmall.iconSpacing`)),
    ]),
    ...variantRules,
    ...rule('.toggle-button[data-selected]', [
      line('--_button-container-radius', 'var(--_toggle-button-selected-radius)'),
    ]),
    ...rule('.toggle-button[data-pressed]', [
      line('--_button-container-radius', 'var(--_toggle-button-pressed-radius)'),
    ]),
    '',
  ].join('\n');
}

export default defineCssAdapter('toggle-button', createToggleButtonCss);
