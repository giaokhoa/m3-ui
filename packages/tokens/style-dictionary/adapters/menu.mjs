import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) {
  return ['', `${selector} {`, ...declarations, '}'];
}

export function createMenuCss(context) {
  const get = tokenReader(context, 'Menu CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (path) => get(`shape.${get(path)}`);
  const standard = 'component.menu.standard';
  const vibrant = 'component.menu.vibrant';
  const segmented = 'component.menu.segmented';

  const css = [
    '.menu-popover, .exposed-menu, .exposed-dropdown-menu {',
    line('--_menu-container-color', get('component.menu.base.containerColor')),
    line('--_menu-color', get(`${standard}.itemLabelTextColor`)),
    line('--_menu-icon-color', get(`${standard}.itemLeadingIconColor`)),
    line('--_menu-supporting-color', get(`${standard}.itemSupportingTextColor`)),
    line('--_menu-disabled-color', get(`${standard}.itemDisabledLabelTextColor`)),
    line('--_menu-disabled-opacity', get(`${standard}.itemDisabledLabelTextOpacity`)),
    line('--_menu-selected-container-color', get(`${standard}.itemSelectedContainerColor`)),
    line('--_menu-selected-color', get(`${standard}.itemSelectedLabelTextColor`)),
    line('--_menu-selected-icon-color', get(`${standard}.itemSelectedLeadingIconColor`)),
    line('--_menu-selected-supporting-color', get(`${standard}.itemSelectedSupportingTextColor`)),
    line('--_menu-radius', shape('component.menu.base.containerShape')),
    line('--_menu-min-width', get('component.menu.web.minWidth')),
    line('--_menu-max-width', get('component.menu.web.maxWidth')),
    line('--_menu-item-min-height', get('component.menu.web.itemMinHeight')),
    line('--_menu-item-padding-inline', get('component.menu.web.itemPaddingInline')),
    line('--_menu-content-padding-block', get('component.menu.web.contentPaddingBlock')),
    line('--_menu-icon-size', get('component.menu.web.iconSize')),
    line('--_menu-icon-gap', get('component.menu.web.iconGap')),
    line('--_menu-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_menu-motion-easing', get('motion.spring.fastSpatial.easing')),
    line('--_menu-group-padding', get(`${segmented}.groupPadding`)),
    line('--_menu-group-gap', get(`${segmented}.segmentedGap`)),
    line('--_menu-group-outer-radius', shape(`${segmented}.containerShape`)),
    line('--_menu-group-inner-radius', shape(`${segmented}.groupShape`)),
    line('--_menu-item-outer-radius', shape(`${segmented}.itemFirstChildShape`)),
    line('--_menu-item-inner-radius', shape(`${segmented}.itemFirstChildInnerCornerCornerSize`)),
    line('--_menu-item-selected-radius', shape(`${segmented}.itemSelectedShape`)),
    '}',

    ...rule('.menu-item', [
      line('--_menu-item-container-color', 'transparent'),
      line('--_menu-item-label-color', get(`${standard}.itemLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${standard}.itemSupportingTextColor`)),
      line('--_menu-item-opacity', 1),
    ]),
    ...rule('.menu-item[data-hovered]:not([data-selected])', [
      line('--_menu-item-label-color', get(`${standard}.itemHoveredLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemHoveredLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemHoveredTrailingIconColor`)),
    ]),
    ...rule('.menu-item[data-focus-visible]:not([data-selected])', [
      line('--_menu-item-label-color', get(`${standard}.itemFocusedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemFocusedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemFocusedTrailingIconColor`)),
    ]),
    ...rule('.menu-item[data-pressed]:not([data-selected])', [
      line('--_menu-item-label-color', get(`${standard}.itemPressedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemPressedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemPressedTrailingIconColor`)),
    ]),
    ...rule('.menu-item[data-selected]', [
      line('--_menu-item-container-color', get(`${standard}.itemSelectedContainerColor`)),
      line('--_menu-item-label-color', get(`${standard}.itemSelectedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemSelectedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemSelectedTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${standard}.itemSelectedSupportingTextColor`)),
    ]),
    ...rule('.menu-item[data-disabled]:not([data-selected])', [
      line('--_menu-item-label-color', get(`${standard}.itemDisabledLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemDisabledLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemDisabledTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${standard}.itemDisabledSupportingTextColor`)),
      line('--_menu-item-opacity', get(`${standard}.itemDisabledLabelTextOpacity`)),
    ]),
    ...rule('.menu-item[data-selected][data-disabled]', [
      line('--_menu-item-container-color', get(`${standard}.itemSelectedDisabledContainerColor`)),
      line('--_menu-item-label-color', get(`${standard}.itemSelectedDisabledLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${standard}.itemSelectedDisabledLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${standard}.itemSelectedDisabledTrailingIconColor`)),
      line('--_menu-item-opacity', get(`${standard}.itemSelectedDisabledLabelTextOpacity`)),
    ]),

    ...rule('.menu-section--segmented', [
      line('--_menu-group-container-color', get(`${standard}.containerColor`)),
      line('--_menu-group-radius-top-start', 'var(--_menu-group-inner-radius)'),
      line('--_menu-group-radius-top-end', 'var(--_menu-group-inner-radius)'),
      line('--_menu-group-radius-bottom-start', 'var(--_menu-group-inner-radius)'),
      line('--_menu-group-radius-bottom-end', 'var(--_menu-group-inner-radius)'),
    ]),
    ...rule('.menu-section--segmented:only-of-type', [
      line('--_menu-group-radius-top-start', 'var(--_menu-group-outer-radius)'),
      line('--_menu-group-radius-top-end', 'var(--_menu-group-outer-radius)'),
      line('--_menu-group-radius-bottom-start', 'var(--_menu-group-outer-radius)'),
      line('--_menu-group-radius-bottom-end', 'var(--_menu-group-outer-radius)'),
    ]),
    ...rule('.menu-section--segmented:first-of-type:not(:last-of-type)', [
      line('--_menu-group-radius-top-start', 'var(--_menu-group-outer-radius)'),
      line('--_menu-group-radius-top-end', 'var(--_menu-group-outer-radius)'),
    ]),
    ...rule('.menu-section--segmented:last-of-type:not(:first-of-type)', [
      line('--_menu-group-radius-bottom-start', 'var(--_menu-group-outer-radius)'),
      line('--_menu-group-radius-bottom-end', 'var(--_menu-group-outer-radius)'),
    ]),
    ...rule('.menu-section--segmented .menu-item', [
      line('--_menu-item-container-color', get(`${standard}.itemContainerColor`)),
      line('--_menu-item-shape-top-start', 'var(--_menu-item-inner-radius)'),
      line('--_menu-item-shape-top-end', 'var(--_menu-item-inner-radius)'),
      line('--_menu-item-shape-bottom-start', 'var(--_menu-item-inner-radius)'),
      line('--_menu-item-shape-bottom-end', 'var(--_menu-item-inner-radius)'),
    ]),
    ...rule('.menu-section--segmented .menu-item:first-of-type:not(:last-of-type)', [
      line('--_menu-item-shape-top-start', 'var(--_menu-item-outer-radius)'),
      line('--_menu-item-shape-top-end', 'var(--_menu-item-outer-radius)'),
    ]),
    ...rule('.menu-section--segmented .menu-item:last-of-type:not(:first-of-type)', [
      line('--_menu-item-shape-bottom-start', 'var(--_menu-item-outer-radius)'),
      line('--_menu-item-shape-bottom-end', 'var(--_menu-item-outer-radius)'),
    ]),
    ...rule('.menu-section--segmented .menu-item[data-selected]', [
      line('--_menu-item-shape-top-start', 'var(--_menu-item-selected-radius)'),
      line('--_menu-item-shape-top-end', 'var(--_menu-item-selected-radius)'),
      line('--_menu-item-shape-bottom-start', 'var(--_menu-item-selected-radius)'),
      line('--_menu-item-shape-bottom-end', 'var(--_menu-item-selected-radius)'),
    ]),

    ...rule(".menu-section--segmented[data-tone='vibrant']", [
      line('--_menu-group-container-color', get(`${vibrant}.containerColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item", [
      line('--_menu-item-container-color', get(`${vibrant}.itemColor`)),
      line('--_menu-item-label-color', get(`${vibrant}.itemLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemSupportingTextColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-hovered]:not([data-selected])", [
      line('--_menu-item-label-color', get(`${vibrant}.itemHoveredLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemHoveredLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemHoveredTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemHoveredSupportingTextColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-focus-visible]:not([data-selected])", [
      line('--_menu-item-label-color', get(`${vibrant}.itemFocusedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemFocusedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemFocusedTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemFocusedSupportingTextColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-pressed]:not([data-selected])", [
      line('--_menu-item-label-color', get(`${vibrant}.itemPressedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemPressedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemPressedTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemPressedSupportingTextColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-selected]", [
      line('--_menu-item-container-color', get(`${vibrant}.itemSelectedContainerColor`)),
      line('--_menu-item-label-color', get(`${vibrant}.itemSelectedLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemSelectedLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemSelectedTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemSelectedSupportingTextColor`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-disabled]:not([data-selected])", [
      line('--_menu-item-label-color', get(`${vibrant}.itemDisabledLabelTextColor`)),
      line('--_menu-item-leading-color', get(`${vibrant}.itemDisabledLeadingIconColor`)),
      line('--_menu-item-trailing-color', get(`${vibrant}.itemDisabledTrailingIconColor`)),
      line('--_menu-item-supporting-color', get(`${vibrant}.itemDisabledSupportingTextColor`)),
      line('--_menu-item-opacity', get(`${vibrant}.itemDisabledLabelTextOpacity`)),
    ]),
    ...rule(".menu-section--segmented[data-tone='vibrant'] .menu-item[data-selected][data-disabled]", [
      line('--_menu-item-opacity', get(`${vibrant}.itemSelectedDisabledLabelTextOpacity`)),
    ]),
    '',
  ];

  return css.join('\n');
}

export default defineCssAdapter('menu', createMenuCss);
