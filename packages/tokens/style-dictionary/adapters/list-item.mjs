import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

function rule(selector, declarations) {
  return ['', `${selector} {`, ...declarations, '}'];
}

export function createListItemCss(context) {
  const get = tokenReader(context, 'ListItem CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const base = 'component.list.base';
  const shape = (path) => get(`shape.${get(path)}`);
  const typography = (slot, role) => [
    line(`--_list-item-${slot}-font-family`, `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line(`--_list-item-${slot}-font-size`, get(`typography.${role}.fontSize`)),
    line(`--_list-item-${slot}-line-height`, get(`typography.${role}.lineHeight`)),
    line(`--_list-item-${slot}-font-weight`, get(`typography.${role}.fontWeight`)),
    line(`--_list-item-${slot}-letter-spacing`, get(`typography.${role}.letterSpacing`)),
  ];
  const content = ({ label, leading, trailing, overline, supporting, opacity = 1 }) => [
    line('--_list-item-label-color', get(`${base}.${label}`)),
    line('--_list-item-label-opacity', opacity),
    line('--_list-item-leading-color', get(`${base}.${leading}`)),
    line('--_list-item-leading-opacity', opacity),
    line('--_list-item-trailing-color', get(`${base}.${trailing}`)),
    line('--_list-item-trailing-opacity', opacity),
    line('--_list-item-overline-color', get(`${base}.${overline}`)),
    line('--_list-item-overline-opacity', opacity),
    line('--_list-item-supporting-color', get(`${base}.${supporting}`)),
    line('--_list-item-supporting-opacity', opacity),
  ];
  const interactiveSelectedContent = (prefix) => [
    line('--_list-item-label-color', get(`${base}.itemSelected${prefix}LabelTextColor`)),
    line('--_list-item-leading-color', get(`${base}.itemSelected${prefix}LeadingIconColor`)),
    line('--_list-item-trailing-color', get(`${base}.itemSelected${prefix}TrailingIconColor`)),
    line('--_ripple-color', get(`${base}.itemSelected${prefix}LabelTextColor`)),
  ];

  const headlineRole = get(`${base}.itemLabelTextFont`);
  const supportingRole = get(`${base}.itemSupportingTextFont`);
  const metaRole = get(`${base}.itemOverlineFont`);

  const css = [
    '.list-item {',
    line('--_list-item-padding-inline-start', get(`${base}.itemLeadingSpace`)),
    line('--_list-item-padding-inline-end', get(`${base}.itemTrailingSpace`)),
    line('--_list-item-padding-block-start', get(`${base}.itemTopSpace`)),
    line('--_list-item-padding-block-end', get(`${base}.itemBottomSpace`)),
    line('--_list-item-container-color', get(`${base}.itemContainerColor`)),
    line('--_list-item-container-opacity', 1),
    line('--_list-item-shape', shape(`${base}.itemContainerShape`)),
    line('--_list-item-focus-indicator-color', get(`${base}.focusIndicatorColor`)),
    line('--_list-item-focus-indicator-thickness', get(`${base}.focusIndicatorThickness`)),
    line('--_list-item-focus-indicator-outline-offset', get(`${base}.focusIndicatorOutlineOffset`)),
    ...content({
      label: 'itemLabelTextColor',
      leading: 'itemLeadingIconColor',
      trailing: 'itemTrailingIconColor',
      overline: 'itemOverlineColor',
      supporting: 'itemSupportingTextColor',
    }),
    ...typography('headline', headlineRole),
    ...typography('supporting', supportingRole),
    ...typography('meta', metaRole),
    line('--_list-item-shape-duration', get('motion.spring.fastSpatial.duration')),
    line('--_list-item-shape-easing', get('motion.spring.fastSpatial.easing')),
    line('--_ripple-color', get(`${base}.itemLabelTextColor`)),
    line('--_ripple-hover-opacity', get('state.layer.opacity.hover')),
    line('--_ripple-focus-opacity', get('state.layer.opacity.focus')),
    line('--_ripple-pressed-opacity', get('state.layer.opacity.pressed')),
    '}',
    ...rule(".list-item[data-lines='1']", [
      line('--_list-item-min-height', get(`${base}.itemOneLineContainerHeight`)),
    ]),
    ...rule(".list-item[data-lines='2']", [
      line('--_list-item-min-height', get(`${base}.itemTwoLineContainerHeight`)),
    ]),
    ...rule(".list-item[data-lines='3']", [
      line('--_list-item-min-height', get(`${base}.itemThreeLineContainerHeight`)),
    ]),
    ...rule('.list-item[data-hovered]:not([data-selected])', [
      line('--_list-item-shape', shape(`${base}.itemHoveredContainerExpressiveShape`)),
    ]),
    ...rule('.list-item[data-focus-visible]:not([data-selected])', [
      line('--_list-item-shape', shape(`${base}.itemFocusedContainerExpressiveShape`)),
    ]),
    ...rule('.list-item[data-pressed]:not([data-selected])', [
      line('--_list-item-shape', shape(`${base}.itemPressedContainerExpressiveShape`)),
    ]),
    ...rule('.list-item[data-dragged]:not([data-selected])', [
      line('--_list-item-shape', shape(`${base}.itemDraggedContainerExpressiveShape`)),
      line('--_list-item-label-color', get(`${base}.itemDraggedLabelTextColor`)),
      line('--_list-item-leading-color', get(`${base}.itemDraggedLeadingIconIconColor`)),
      line('--_list-item-trailing-color', get(`${base}.itemDraggedTrailingIconIconColor`)),
      line('--_ripple-color', get(`${base}.itemDraggedLabelTextColor`)),
    ]),
    ...rule('.list-item[data-selected]', [
      line('--_list-item-container-color', get(`${base}.itemSelectedContainerColor`)),
      line('--_list-item-container-opacity', 1),
      line('--_list-item-shape', shape(`${base}.itemSelectedContainerShape`)),
      ...content({
        label: 'itemSelectedLabelTextColor',
        leading: 'itemSelectedLeadingIconColor',
        trailing: 'itemSelectedTrailingIconColor',
        overline: 'itemSelectedOverlineColor',
        supporting: 'itemSelectedSupportingTextColor',
      }),
      line('--_ripple-color', get(`${base}.itemSelectedLabelTextColor`)),
    ]),
    ...rule('.list-item[data-selected][data-hovered]', interactiveSelectedContent('Hover')),
    ...rule('.list-item[data-selected][data-focus-visible]', interactiveSelectedContent('Focus')),
    ...rule('.list-item[data-selected][data-pressed]', interactiveSelectedContent('Pressed')),
    ...rule('.list-item[data-selected][data-dragged]', interactiveSelectedContent('Dragged')),
    ...rule('.list-item[data-disabled]:not([data-selected])', [
      ...content({
        label: 'itemDisabledLabelTextColor',
        leading: 'itemDisabledLeadingIconColor',
        trailing: 'itemDisabledTrailingIconColor',
        overline: 'itemDisabledOverlineColor',
        supporting: 'itemDisabledSupportingTextColor',
        opacity: get(`${base}.itemDisabledLabelTextOpacity`),
      }),
      line('--_list-item-leading-opacity', get(`${base}.itemDisabledLeadingIconOpacity`)),
      line('--_list-item-trailing-opacity', get(`${base}.itemDisabledTrailingIconOpacity`)),
      line('--_list-item-overline-opacity', get(`${base}.itemDisabledOverlineOpacity`)),
      line('--_list-item-supporting-opacity', get(`${base}.itemDisabledSupportingTextOpacity`)),
      line('--_ripple-color', get(`${base}.itemDisabledLabelTextColor`)),
    ]),
    ...rule('.list-item[data-selected][data-disabled]', [
      line('--_list-item-container-color', get(`${base}.itemSelectedDisabledContainerColor`)),
      line('--_list-item-container-opacity', get(`${base}.itemSelectedDisabledContainerOpacity`)),
      ...content({
        label: 'itemSelectedDisabledLabelTextColor',
        leading: 'itemSelectedDisabledLeadingIconColor',
        trailing: 'itemSelectedDisabledTrailingIconColor',
        overline: 'itemSelectedDisabledOverlineColor',
        supporting: 'itemSelectedDisabledSupportingTextColor',
        opacity: get(`${base}.itemSelectedDisabledLabelTextOpacity`),
      }),
      line('--_list-item-leading-opacity', get(`${base}.itemSelectedDisabledLeadingIconOpacity`)),
      line('--_list-item-trailing-opacity', get(`${base}.itemSelectedDisabledTrailingIconOpacity`)),
      line('--_list-item-overline-opacity', get(`${base}.itemSelectedDisabledOverlineOpacity`)),
      line('--_list-item-supporting-opacity', get(`${base}.itemSelectedDisabledSupportingTextOpacity`)),
      line('--_ripple-color', get(`${base}.itemSelectedDisabledLabelTextColor`)),
    ]),
    '',
  ];

  return css.join('\n');
}

export default defineCssAdapter('list-item', createListItemCss);
