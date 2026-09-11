import { cssValue, defineCssAdapter, percent, tokenReader } from '../adapter-helpers.mjs';

const sizes = [
  ['extraSmall', 'xSmall'],
  ['small', 'small'],
  ['medium', 'medium'],
  ['large', 'large'],
  ['extraLarge', 'xLarge'],
];

export function createSplitButtonCss(context) {
  const get = tokenReader(context, 'SplitButton CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const rules = [
    '.split-button {',
    line('--_split-button-outer-corner', get('shape.full')),
    line('--_split-button-min-interactive-size', get('component.splitButton.minimumInteractiveSize')),
    line('--_split-button-checked-state-layer-opacity', percent(get('component.splitButton.checkedStateLayerOpacity'))),
    '}',
  ];

  for (const [publicSize, size] of sizes) {
    const base = `component.splitButton.size.${size}`;
    rules.push(
      '',
      `.split-button[data-size='${publicSize}'] {`,
      line('--_split-button-spacing', get(`${base}.betweenSpace`)),
      line('--_split-button-container-height', get(`${base}.containerHeight`)),
      line('--_split-button-inner-corner', get(`${base}.innerCornerSize`)),
      line('--_split-button-inner-pressed-corner', get(`${base}.innerPressedCornerSize`)),
      line('--_split-button-leading-padding-start', get(`${base}.leadingButtonLeadingSpace`)),
      line('--_split-button-leading-padding-end', get(`${base}.leadingButtonTrailingSpace`)),
      line('--_split-button-trailing-padding-start', get(`${base}.trailingButtonLeadingSpace`)),
      line('--_split-button-trailing-padding-end', get(`${base}.trailingButtonTrailingSpace`)),
      line('--_split-button-trailing-icon-size', get(`${base}.trailingIconSize`)),
      '}',
    );
  }

  return [...rules, ''].join('\n');
}

export default defineCssAdapter('split-button', createSplitButtonCss);
