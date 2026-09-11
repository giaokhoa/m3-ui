import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) { return ['', `${selector} {`, ...declarations, '}']; }

export function createNavigationRailCss(context) {
  const get = tokenReader(context, 'NavigationRail CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const rail = 'component.navigation.rail';
  const state = `${rail}.baseline`;
  const role = get(`${rail}.verticalItem.labelTextTypography`);
  const css = [
    '.navigation-rail {',
    line('--_navigation-rail-width', get(`${rail}.collapsed.narrowContainerWidth`)),
    line('--_navigation-rail-container-color', get(`${rail}.collapsed.containerColor`)),
    line('--_navigation-rail-content-color', get('color.role.onSurface')),
    line('--_navigation-rail-vertical-padding', '4px'),
    line('--_navigation-rail-item-spacing', '4px'),
    line('--_navigation-rail-header-spacer-height', '8px'),
    line('--_navigation-rail-box-shadow', 'none'),
    '}',
    '.navigation-rail-item {',
    line('--_navigation-rail-item-height', '56px'),
    line('--_navigation-rail-item-width', get(`${rail}.collapsed.narrowContainerWidth`)),
    line('--_navigation-rail-indicator-width', get(`${rail}.verticalItem.activeIndicatorWidth`)),
    line('--_navigation-rail-indicator-height', get(`${rail}.verticalItem.activeIndicatorHeight`)),
    line('--_navigation-rail-indicator-top', '0px'),
    line('--_navigation-rail-indicator-centered-top', `calc((56px - ${get(`${rail}.verticalItem.activeIndicatorHeight`)}) / 2)`),
    line('--_navigation-rail-indicator-radius', get('shape.full')),
    line('--_navigation-rail-icon-size', get(`${rail}.baselineItem.iconSize`)),
    line('--_navigation-rail-icon-label-space', get(`${rail}.verticalItem.iconLabelSpace`)),
    line('--_navigation-rail-icon-color', `var(--_navigation-rail-unselected-icon-override, ${get(`${rail}.color.itemInactiveIcon`)})`),
    line('--_navigation-rail-label-color', `var(--_navigation-rail-unselected-label-override, ${get(`${rail}.color.itemInactiveLabelText`)})`),
    line('--_navigation-rail-indicator-color', `var(--_navigation-rail-indicator-override, ${get(`${rail}.color.itemActiveIndicator`)})`),
    line('--_navigation-rail-content-opacity', 1),
    line('--_ripple-color', get(`${state}.inactiveHoverStateLayerColor`)),
    line('--_ripple-hover-opacity', get(`${state}.hoverStateLayerOpacity`)),
    line('--_ripple-focus-opacity', get(`${state}.focusStateLayerOpacity`)),
    line('--_ripple-pressed-opacity', get(`${state}.pressedStateLayerOpacity`)),
    line('--_navigation-rail-indicator-size-duration', get('motion.spring.fastSpatial.duration')),
    line('--_navigation-rail-indicator-size-easing', get('motion.spring.fastSpatial.easing')),
    line('--_navigation-rail-indicator-opacity-duration', get('motion.spring.defaultEffects.duration')),
    line('--_navigation-rail-indicator-opacity-easing', get('motion.spring.defaultEffects.easing')),
    line('--_navigation-rail-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_navigation-rail-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_navigation-rail-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_navigation-rail-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_navigation-rail-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
    '}',
    ...rule('.navigation-rail-item:not([data-has-label])', [
      line('--_navigation-rail-indicator-height', get(`${state}.noLabelActiveIndicatorHeight`)),
      line('--_navigation-rail-indicator-top', `calc((56px - ${get(`${state}.noLabelActiveIndicatorHeight`)}) / 2)`),
    ]),
    ...rule('.navigation-rail-item[data-selected]', [
      line('--_navigation-rail-icon-color', `var(--_navigation-rail-selected-icon-override, ${get(`${rail}.color.itemActiveIcon`)})`),
      line('--_navigation-rail-label-color', `var(--_navigation-rail-selected-label-override, ${get(`${rail}.color.itemActiveLabelText`)})`),
      line('--_ripple-color', get(`${state}.activeHoverStateLayerColor`)),
    ]),
    ...rule('.navigation-rail-item[data-focus-visible]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactiveFocusStateLayerColor`))]),
    ...rule('.navigation-rail-item[data-pressed]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactivePressedStateLayerColor`))]),
    ...rule('.navigation-rail-item[data-selected][data-focus-visible]', [line('--_ripple-color', get(`${state}.activeFocusStateLayerColor`))]),
    ...rule('.navigation-rail-item[data-selected][data-pressed]', [line('--_ripple-color', get(`${state}.activePressedStateLayerColor`))]),
    ...rule('.navigation-rail-item[data-disabled]', [line('--_navigation-rail-content-opacity', 0.38)]),
    '',
  ];
  return css.join('\n');
}
export default defineCssAdapter('navigation-rail', createNavigationRailCss);
