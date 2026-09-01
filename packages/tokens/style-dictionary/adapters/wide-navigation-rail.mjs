import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) { return ['', `${selector} {`, ...declarations, '}']; }

export function createWideNavigationRailCss(context) {
  const get = tokenReader(context, 'WideNavigationRail CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const rail = 'component.navigation.rail';
  const color = `${rail}.color`;
  const type = (role) => [
    line('--_wide-navigation-rail-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_wide-navigation-rail-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_wide-navigation-rail-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_wide-navigation-rail-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_wide-navigation-rail-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
  ];
  const css = [
    '.wide-navigation-rail {',
    line('--_wide-navigation-rail-collapsed-width', get(`${rail}.collapsed.containerWidth`)),
    line('--_wide-navigation-rail-expanded-min-width', get(`${rail}.expanded.containerWidthMinimum`)),
    line('--_wide-navigation-rail-expanded-max-width', get(`${rail}.expanded.containerWidthMaximum`)),
    line('--_wide-navigation-rail-expanded-width', get(`${rail}.expanded.containerWidthMinimum`)),
    line('--_wide-navigation-rail-container-color', get(`${rail}.collapsed.containerColor`)),
    line('--_wide-navigation-rail-content-color', get('color.role.onSurface')),
    line('--_wide-navigation-rail-top-space', get(`${rail}.collapsed.topSpace`)),
    line('--_wide-navigation-rail-header-space', get(`${rail}.baselineItem.headerSpaceMinimum`)),
    line('--_wide-navigation-rail-collapsed-item-space', get(`${rail}.collapsed.itemVerticalSpace`)),
    line('--_wide-navigation-rail-spatial-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_wide-navigation-rail-spatial-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_wide-navigation-rail-effects-duration', get('motion.spring.defaultEffects.duration')),
    line('--_wide-navigation-rail-effects-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '.wide-navigation-rail-item {',
    line('--_wide-navigation-rail-item-collapsed-height', get(`${rail}.baselineItem.containerHeight`)),
    line('--_wide-navigation-rail-item-expanded-height', get(`${rail}.horizontalItem.activeIndicatorHeight`)),
    line('--_wide-navigation-rail-item-horizontal-padding', '20px'),
    line('--_wide-navigation-rail-indicator-width', get(`${rail}.verticalItem.activeIndicatorWidth`)),
    line('--_wide-navigation-rail-indicator-height', get(`${rail}.verticalItem.activeIndicatorHeight`)),
    line('--_wide-navigation-rail-indicator-collapsed-height', get(`${rail}.verticalItem.activeIndicatorHeight`)),
    line('--_wide-navigation-rail-indicator-expanded-height', get(`${rail}.horizontalItem.activeIndicatorHeight`)),
    line('--_wide-navigation-rail-indicator-leading-space', get(`${rail}.horizontalItem.fullWidthLeadingSpace`)),
    line('--_wide-navigation-rail-indicator-trailing-space', get(`${rail}.horizontalItem.fullWidthTrailingSpace`)),
    line('--_wide-navigation-rail-icon-size', get(`${rail}.baselineItem.iconSize`)),
    line('--_wide-navigation-rail-collapsed-icon-label-space', get(`${rail}.verticalItem.iconLabelSpace`)),
    line('--_wide-navigation-rail-expanded-icon-label-space', get(`${rail}.horizontalItem.iconLabelSpace`)),
    line('--_wide-navigation-rail-icon-color', `var(--_wide-navigation-rail-unselected-icon-override, ${get(`${color}.itemInactiveIcon`)})`),
    line('--_wide-navigation-rail-label-color', `var(--_wide-navigation-rail-unselected-label-override, ${get(`${color}.itemInactiveLabelText`)})`),
    line('--_wide-navigation-rail-indicator-color', `var(--_wide-navigation-rail-indicator-override, ${get(`${color}.itemActiveIndicator`)})`),
    line('--_wide-navigation-rail-content-opacity', 1),
    line('--_ripple-color', get(`${color}.itemInactiveHoveredStateLayer`)),
    line('--_ripple-hover-opacity', get(`${rail}.baselineItem.hoverStateLayerOpacity`)),
    line('--_ripple-focus-opacity', get(`${rail}.baselineItem.focusStateLayerOpacity`)),
    line('--_ripple-pressed-opacity', get(`${rail}.baselineItem.pressedStateLayerOpacity`)),
    ...type(get(`${rail}.verticalItem.labelTextTypography`)),
    '}',
    ...rule('.wide-navigation-rail-item:not([data-has-label])', [
      line('--_wide-navigation-rail-indicator-height', get(`${rail}.verticalItem.activeIndicatorWidth`)),
      line('--_wide-navigation-rail-indicator-collapsed-height', get(`${rail}.verticalItem.activeIndicatorWidth`)),
      line('--_wide-navigation-rail-indicator-expanded-height', get(`${rail}.verticalItem.activeIndicatorWidth`)),
    ]),
    ...rule('.wide-navigation-rail-item[data-expanded]', type(get(`${rail}.horizontalItem.labelTextTypography`))),
    ...rule('.wide-navigation-rail-item[data-expanded][data-has-label]', [line('--_wide-navigation-rail-indicator-height', get(`${rail}.horizontalItem.activeIndicatorHeight`))]),
    ...rule('.wide-navigation-rail-item[data-selected]', [
      line('--_wide-navigation-rail-icon-color', `var(--_wide-navigation-rail-selected-icon-override, ${get(`${color}.itemActiveIcon`)})`),
      line('--_wide-navigation-rail-label-color', `var(--_wide-navigation-rail-selected-top-label-override, ${get(`${color}.itemActiveLabelText`)})`),
      line('--_ripple-color', get(`${color}.itemActiveHoveredStateLayer`)),
    ]),
    ...rule('.wide-navigation-rail-item[data-selected][data-expanded]', [
      line('--_wide-navigation-rail-label-color', `var(--_wide-navigation-rail-selected-start-label-override, var(--_wide-navigation-rail-selected-icon-override, ${get(`${color}.itemActiveIcon`)}))`),
    ]),
    ...rule('.wide-navigation-rail-item[data-focus-visible]:not([data-selected])', [line('--_ripple-color', get(`${color}.itemInactiveFocusedStateLayer`))]),
    ...rule('.wide-navigation-rail-item[data-pressed]:not([data-selected])', [line('--_ripple-color', get(`${color}.itemInactivePressedStateLayer`))]),
    ...rule('.wide-navigation-rail-item[data-selected][data-focus-visible]', [line('--_ripple-color', get(`${color}.itemActiveFocusedStateLayer`))]),
    ...rule('.wide-navigation-rail-item[data-selected][data-pressed]', [line('--_ripple-color', get(`${color}.itemActivePressedStateLayer`))]),
    ...rule('.wide-navigation-rail-item[data-disabled]', [line('--_wide-navigation-rail-content-opacity', 0.38)]),
    '',
  ];
  return css.join('\n');
}
export default defineCssAdapter('wide-navigation-rail', createWideNavigationRailCss);
