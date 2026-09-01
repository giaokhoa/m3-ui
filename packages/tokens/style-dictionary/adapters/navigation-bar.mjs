import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) {
  return ['', `${selector} {`, ...declarations, '}'];
}

export function createNavigationBarCss(context) {
  const get = tokenReader(context, 'NavigationBar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const bar = 'component.navigation.bar';
  const state = `${bar}.baseline`;
  const role = get(`${bar}.labelTextTypography`);
  const css = [
    '.navigation-bar {',
    line('--_navigation-bar-height', get(`${bar}.tallContainerHeight`)),
    line('--_navigation-bar-container-color', get(`${bar}.containerColor`)),
    line('--_navigation-bar-content-color', get('color.role.onSurface')),
    line('--_navigation-bar-item-spacing', '8px'),
    line('--_navigation-bar-box-shadow', 'none'),
    '}',
    '.navigation-bar-item {',
    line('--_navigation-bar-item-height', get(`${bar}.tallContainerHeight`)),
    line('--_navigation-bar-item-min-width', `calc(${get(`${bar}.verticalItem.iconSize`)} + 88px)`),
    line('--_navigation-bar-indicator-width', get(`${bar}.verticalItem.activeIndicatorWidth`)),
    line('--_navigation-bar-indicator-height', get(`${bar}.verticalItem.activeIndicatorHeight`)),
    line('--_navigation-bar-indicator-top', '12px'),
    line('--_navigation-bar-indicator-centered-top', `calc((${get(`${bar}.tallContainerHeight`)} - ${get(`${bar}.verticalItem.activeIndicatorHeight`)}) / 2)`),
    line('--_navigation-bar-indicator-radius', get('shape.full')),
    line('--_navigation-bar-icon-size', get(`${bar}.verticalItem.iconSize`)),
    line('--_navigation-bar-icon-label-space', get(`${bar}.itemActiveIndicatorIconLabelSpace`)),
    line('--_navigation-bar-icon-color', `var(--_navigation-bar-unselected-icon-override, ${get(`${bar}.itemInactiveIconColor`)})`),
    line('--_navigation-bar-label-color', `var(--_navigation-bar-unselected-label-override, ${get(`${bar}.itemInactiveLabelTextColor`)})`),
    line('--_navigation-bar-indicator-color', `var(--_navigation-bar-indicator-override, ${get(`${bar}.itemActiveIndicatorColor`)})`),
    line('--_navigation-bar-content-opacity', 1),
    line('--_ripple-color', get(`${state}.inactiveHoverStateLayerColor`)),
    line('--_ripple-hover-opacity', get(`${state}.hoverStateLayerOpacity`)),
    line('--_ripple-focus-opacity', get(`${state}.focusStateLayerOpacity`)),
    line('--_ripple-pressed-opacity', get(`${state}.pressedStateLayerOpacity`)),
    line('--_navigation-bar-indicator-size-duration', get('motion.spring.fastSpatial.duration')),
    line('--_navigation-bar-indicator-size-easing', get('motion.spring.fastSpatial.easing')),
    line('--_navigation-bar-indicator-opacity-duration', get('motion.spring.defaultEffects.duration')),
    line('--_navigation-bar-indicator-opacity-easing', get('motion.spring.defaultEffects.easing')),
    line('--_navigation-bar-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_navigation-bar-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_navigation-bar-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_navigation-bar-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_navigation-bar-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
    '}',
    ...rule('.navigation-bar-item[data-selected]', [
      line('--_navigation-bar-icon-color', `var(--_navigation-bar-selected-icon-override, ${get(`${bar}.itemActiveIconColor`)})`),
      line('--_navigation-bar-label-color', `var(--_navigation-bar-selected-label-override, ${get(`${bar}.itemActiveLabelTextColor`)})`),
      line('--_ripple-color', get(`${state}.activeHoverStateLayerColor`)),
    ]),
    ...rule('.navigation-bar-item[data-focus-visible]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactiveFocusStateLayerColor`))]),
    ...rule('.navigation-bar-item[data-pressed]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactivePressedStateLayerColor`))]),
    ...rule('.navigation-bar-item[data-selected][data-focus-visible]', [line('--_ripple-color', get(`${state}.activeFocusStateLayerColor`))]),
    ...rule('.navigation-bar-item[data-selected][data-pressed]', [line('--_ripple-color', get(`${state}.activePressedStateLayerColor`))]),
    ...rule('.navigation-bar-item[data-disabled]', [line('--_navigation-bar-content-opacity', 0.38)]),
    '',
  ];
  return css.join('\n');
}

export default defineCssAdapter('navigation-bar', createNavigationBarCss);
