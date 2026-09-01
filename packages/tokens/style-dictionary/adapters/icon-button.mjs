import {
  cssValue,
  defineCssAdapter,
  tokenReader,
  withOpacity,
} from '../adapter-helpers.mjs';

function rule(selector, declarations) {
  return ['', `${selector} {`, ...declarations, '}'];
}

export function createIconButtonCss(context) {
  const get = tokenReader(context, 'IconButton CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (name) => get(`shape.${name}`);
  const sizeRoot = 'component.iconButton.size';

  const sizes = [
    ['extraSmall', 'xSmall', 'defaultLeadingSpace'],
    ['small', 'small', 'defaultLeadingSpace'],
    ['medium', 'medium', 'defaultLeadingSpace'],
    ['large', 'large', 'uniformLeadingSpace'],
    ['extraLarge', 'xLarge', 'defaultLeadingSpace'],
  ];

  const sizeRules = sizes.flatMap(([attribute, tokenSize, defaultSpace]) => {
    const root = `${sizeRoot}.${tokenSize}`;
    return rule(`.icon-button[data-size='${attribute}']`, [
      line('--_icon-button-container-height', get(`${root}.containerHeight`)),
      line('--_icon-button-icon-size', get(`${root}.iconSize`)),
      line('--_icon-button-outline-width', get(`${root}.outlinedOutlineWidth`)),
      line('--_icon-button-narrow-space', get(`${root}.narrowLeadingSpace`)),
      line('--_icon-button-default-space', get(`${root}.${defaultSpace}`)),
      line('--_icon-button-wide-space', get(`${root}.wideLeadingSpace`)),
      line('--_icon-button-round-radius', shape(get(`${root}.containerShapeRound`))),
      line('--_icon-button-square-radius', shape(get(`${root}.containerShapeSquare`))),
    ]);
  });

  const variant = (name) => `component.iconButton.variant.${name}`;
  const paint = (container, content, outline = 'transparent') => [
    line('--_icon-button-container-color', container),
    line('--_icon-button-content-color', content),
    line('--_icon-button-outline-color', outline),
  ];
  const transparent = 'transparent';
  const standard = 'component.iconButton.standard';
  const filled = variant('filled');
  const tonal = variant('filledTonal');
  const outlined = variant('outlined');

  return [
    '.icon-button {',
    line('--_icon-button-container-height', get(`${sizeRoot}.small.containerHeight`)),
    line('--_icon-button-icon-size', get(`${sizeRoot}.small.iconSize`)),
    line('--_icon-button-outline-width', get(`${sizeRoot}.small.outlinedOutlineWidth`)),
    line('--_icon-button-narrow-space', get(`${sizeRoot}.small.narrowLeadingSpace`)),
    line('--_icon-button-default-space', get(`${sizeRoot}.small.defaultLeadingSpace`)),
    line('--_icon-button-wide-space', get(`${sizeRoot}.small.wideLeadingSpace`)),
    line('--_icon-button-round-radius', shape(get(`${sizeRoot}.small.containerShapeRound`))),
    line('--_icon-button-square-radius', shape(get(`${sizeRoot}.small.containerShapeSquare`))),
    line('--_icon-button-inline-space', 'var(--_icon-button-default-space)'),
    line('--_icon-button-container-radius', 'var(--_icon-button-round-radius)'),
    line('--_icon-button-shape-duration', get('motion.spring.fastSpatial.duration')),
    line('--_icon-button-shape-easing', get('motion.spring.fastSpatial.easing')),
    '}',
    ...sizeRules,
    ...rule(".icon-button[data-width='narrow']", [
      line('--_icon-button-inline-space', 'var(--_icon-button-narrow-space)'),
    ]),
    ...rule(".icon-button[data-width='default']", [
      line('--_icon-button-inline-space', 'var(--_icon-button-default-space)'),
    ]),
    ...rule(".icon-button[data-width='wide']", [
      line('--_icon-button-inline-space', 'var(--_icon-button-wide-space)'),
    ]),
    ...rule(".icon-button[data-shape='round']", [
      line('--_icon-button-container-radius', 'var(--_icon-button-round-radius)'),
    ]),
    ...rule(".icon-button[data-shape='square']", [
      line('--_icon-button-container-radius', 'var(--_icon-button-square-radius)'),
    ]),
    ...rule('.icon-button--standard', paint(transparent, get(`${standard}.color`))),
    ...rule('.icon-button--standard[data-toggle]', paint(transparent, get(`${standard}.unselectedColor`))),
    ...rule('.icon-button--standard[data-toggle][data-selected]', paint(transparent, get(`${standard}.selectedColor`))),
    ...rule('.icon-button--filled', paint(get(`${filled}.containerColor`), get(`${filled}.color`))),
    ...rule('.icon-button--filled[data-toggle]', paint(get(`${filled}.unselectedContainerColor`), get(`${filled}.unselectedColor`))),
    ...rule('.icon-button--filled[data-toggle][data-selected]', paint(get(`${filled}.selectedContainerColor`), get(`${filled}.selectedColor`))),
    ...rule('.icon-button--filled-tonal', paint(get(`${tonal}.containerColor`), get(`${tonal}.color`))),
    ...rule('.icon-button--filled-tonal[data-toggle]', paint(get(`${tonal}.unselectedContainerColor`), get(`${tonal}.unselectedColor`))),
    ...rule('.icon-button--filled-tonal[data-toggle][data-selected]', paint(get(`${tonal}.selectedContainerColor`), get(`${tonal}.selectedColor`))),
    ...rule('.icon-button--outlined', paint(transparent, get(`${outlined}.color`), get(`${outlined}.outlineColor`))),
    ...rule('.icon-button--outlined[data-toggle]', paint(transparent, get(`${outlined}.unselectedColor`), get(`${outlined}.unselectedOutlineColor`))),
    ...rule('.icon-button--outlined[data-toggle][data-selected]', paint(get(`${outlined}.selectedContainerColor`), get(`${outlined}.selectedColor`), transparent)),
    ...rule('.icon-button--standard[data-disabled]', paint(
      transparent,
      withOpacity(get(`${standard}.disabledColor`), get(`${standard}.disabledOpacity`)),
    )),
    ...rule('.icon-button--filled[data-disabled]', paint(
      withOpacity(get(`${filled}.disabledContainerColor`), get(`${filled}.disabledContainerOpacity`)),
      withOpacity(get(`${filled}.disabledColor`), get(`${filled}.disabledOpacity`)),
    )),
    ...rule('.icon-button--filled-tonal[data-disabled]', paint(
      withOpacity(get(`${tonal}.disabledContainerColor`), get(`${tonal}.disabledContainerOpacity`)),
      withOpacity(get(`${tonal}.disabledColor`), get(`${tonal}.disabledOpacity`)),
    )),
    ...rule('.icon-button--outlined[data-disabled]', paint(
      transparent,
      withOpacity(get(`${outlined}.disabledColor`), get(`${outlined}.disabledOpacity`)),
      get(`${outlined}.disabledOutlineColor`),
    )),
    ...rule('.icon-button--outlined[data-toggle][data-selected][data-disabled]', paint(
      withOpacity(
        get(`${outlined}.selectedDisabledContainerColor`),
        get(`${outlined}.selectedDisabledContainerOpacity`),
      ),
      withOpacity(get(`${outlined}.disabledColor`), get(`${outlined}.disabledOpacity`)),
      transparent,
    )),
    '',
  ].join('\n');
}

export default defineCssAdapter('icon-button', createIconButtonCss);
