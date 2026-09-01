import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

export function createMenuCss(context) {
  const get = tokenReader(context, 'Menu CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = get('component.menu.base.containerShape');

  return [
    '.menu-popover, .exposed-menu {',
    line('--_menu-container-color', get('component.menu.base.containerColor')),
    line('--_menu-color', get('component.menu.standard.itemLabelTextColor')),
    line('--_menu-icon-color', get('component.menu.standard.itemLeadingIconColor')),
    line('--_menu-disabled-color', get('component.menu.standard.itemDisabledLabelTextColor')),
    line('--_menu-disabled-opacity', get('component.menu.standard.itemDisabledLabelTextOpacity')),
    line('--_menu-selected-container-color', get('component.menu.standard.itemSelectedContainerColor')),
    line('--_menu-selected-color', get('component.menu.standard.itemSelectedLabelTextColor')),
    line('--_menu-segmented-container-color', get('component.menu.segmented.groupContainerColor')),
    line('--_menu-radius', get(`shape.${shape}`)),
    line('--_menu-min-width', get('component.menu.web.minWidth')),
    line('--_menu-max-width', get('component.menu.web.maxWidth')),
    line('--_menu-item-min-height', get('component.menu.web.itemMinHeight')),
    line('--_menu-item-padding-inline', get('component.menu.web.itemPaddingInline')),
    line('--_menu-content-padding-block', get('component.menu.web.contentPaddingBlock')),
    line('--_menu-icon-size', get('component.menu.web.iconSize')),
    line('--_menu-icon-gap', get('component.menu.web.iconGap')),
    line('--_menu-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_menu-motion-easing', get('motion.spring.fastSpatial.easing')),
    line('--_menu-segmented-padding', get('component.menu.segmented.groupPadding')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('menu', createMenuCss);
