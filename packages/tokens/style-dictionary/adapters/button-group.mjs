import { cssValue, defineCssAdapter, percent, tokenReader } from '../adapter-helpers.mjs';

const sizes = [
  ['extraSmall', 'xSmall', 'connectedXSmall'],
  ['small', 'small', 'connectedSmall'],
  ['medium', 'medium', 'connectedMedium'],
  ['large', 'large', 'connectedLarge'],
  ['extraLarge', 'xLarge', 'connectedXLarge'],
];

export function createButtonGroupCss(context) {
  const get = tokenReader(context, 'ButtonGroup CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const rules = [
    '.button-group {',
    line('--_button-group-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_button-group-motion-easing', get('motion.spring.fastSpatial.easing')),
    line('--_button-group-full-corner', get('shape.full')),
    line('--_button-group-menu-container-color', get('component.menu.base.containerColor')),
    line('--_button-group-menu-container-radius', get('shape.extraSmall')),
    line('--_button-group-menu-item-color', get('component.menu.standard.itemLabelTextColor')),
    line('--_button-group-menu-item-container-color', get('component.menu.standard.itemContainerColor')),
    line('--_button-group-menu-item-disabled-color', get('component.menu.standard.itemDisabledLabelTextColor')),
    line('--_button-group-menu-item-disabled-opacity', percent(get('component.menu.standard.itemDisabledLabelTextOpacity')),
    line('--_button-group-menu-item-height', get('component.list.base.itemOneLineContainerHeight')),
    line('--_button-group-menu-item-padding-start', get('component.list.base.itemLeadingSpace')),
    line('--_button-group-menu-item-padding-end', get('component.list.base.itemTrailingSpace')),
    line('--_button-group-menu-item-gap', get('component.list.base.itemBetweenSpace')),
    line('--_button-group-menu-item-icon-size', get('component.list.base.itemLeadingIconSize')),
    '}',
    '',
    '.button-group--connected {',
    line('--_button-group-unselected-container', get('component.button.variant.filled.unselectedContainerColor')),
    line('--_button-group-unselected-content', get('component.button.variant.filled.unselectedLabelTextColor')),
    line('--_button-group-selected-container', get('component.button.variant.filled.selectedContainerColor')),
    line('--_button-group-selected-content', get('component.button.variant.filled.selectedLabelTextColor')),
    '}',
  ];

  for (const [publicSize, standard, connected] of sizes) {
    rules.push(
      '',
      `.button-group[data-size='${publicSize}'] {`,
      line('--_button-group-height', get(`component.buttonGroup.${standard}.containerHeight`)),
      line('--_button-group-gap', get(`component.buttonGroup.${standard}.betweenSpace`)),
      line('--_button-group-inner-corner', get(`component.buttonGroup.${connected}.innerCornerSize`)),
      line('--_button-group-pressed-inner-corner', get(`component.buttonGroup.${connected}.pressedInnerCornerSize`)),
      '}',
      '',
      `.button-group--connected[data-size='${publicSize}'] {`,
      line('--_button-group-gap', get(`component.buttonGroup.${connected}.betweenSpace`)),
      '}',
    );
  }

  return [...rules, ''].join('\n');
}

export default defineCssAdapter('button-group', createButtonGroupCss);
