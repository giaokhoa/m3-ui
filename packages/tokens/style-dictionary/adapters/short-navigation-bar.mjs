import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) { return ['', `${selector} {`, ...declarations, '}']; }

export function createShortNavigationBarCss(context) {
  const get = tokenReader(context, 'ShortNavigationBar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const bar = 'component.navigation.bar';
  const state = `${bar}.baseline`;
  const role = get(`${bar}.labelTextTypography`);
  const css = [
    '.short-navigation-bar {',
    line('--_short-navigation-bar-min-height', get(`${bar}.containerHeight`)),
    line('--_short-navigation-bar-container-color', get(`${bar}.containerColor`)),
    line('--_short-navigation-bar-content-color', get('color.role.onSurface')),
    '}',
    '.short-navigation-bar-item {',
    line('--_short-navigation-bar-top-item-padding', get(`${bar}.verticalItem.containerBetweenSpace`)),
    line('--_short-navigation-bar-indicator-color', `var(--_short-navigation-bar-indicator-override, ${get(`${bar}.itemActiveIndicatorColor`)})`),
    line('--_short-navigation-bar-content-opacity', 1),
    line('--_short-navigation-bar-icon-color', `var(--_short-navigation-bar-unselected-icon-override, ${get(`${bar}.itemInactiveIconColor`)})`),
    line('--_short-navigation-bar-label-color', `var(--_short-navigation-bar-unselected-label-override, ${get(`${bar}.itemInactiveLabelTextColor`)})`),
    line('--_ripple-color', get(`${state}.inactiveHoverStateLayerColor`)),
    line('--_ripple-hover-opacity', get(`${state}.hoverStateLayerOpacity`)),
    line('--_ripple-focus-opacity', get(`${state}.focusStateLayerOpacity`)),
    line('--_ripple-pressed-opacity', get(`${state}.pressedStateLayerOpacity`)),
    line('--_short-navigation-bar-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_short-navigation-bar-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_short-navigation-bar-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_short-navigation-bar-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_short-navigation-bar-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
    '}',
    ...rule(".short-navigation-bar-item[data-icon-position='top']", [
      line('--_short-navigation-bar-icon-size', get(`${bar}.verticalItem.iconSize`)),
      line('--_short-navigation-bar-indicator-height', get(`${bar}.verticalItem.activeIndicatorHeight`)),
      line('--_short-navigation-bar-indicator-width', get(`${bar}.verticalItem.activeIndicatorWidth`)),
      line('--_short-navigation-bar-indicator-horizontal-padding', `calc((${get(`${bar}.verticalItem.activeIndicatorWidth`)} - ${get(`${bar}.verticalItem.iconSize`)}) / 2)`),
      line('--_short-navigation-bar-indicator-vertical-padding', `calc((${get(`${bar}.verticalItem.activeIndicatorHeight`)} - ${get(`${bar}.verticalItem.iconSize`)}) / 2)`),
      line('--_short-navigation-bar-icon-label-space', '4px'),
    ]),
    ...rule(".short-navigation-bar-item[data-icon-position='start']", [
      line('--_short-navigation-bar-icon-size', get(`${bar}.horizontalItem.iconSize`)),
      line('--_short-navigation-bar-indicator-height', get(`${bar}.horizontalItem.activeIndicatorHeight`)),
      line('--_short-navigation-bar-indicator-width', 'auto'),
      line('--_short-navigation-bar-indicator-horizontal-padding', get(`${bar}.horizontalItem.activeIndicatorLeadingSpace`)),
      line('--_short-navigation-bar-indicator-vertical-padding', `calc((${get(`${bar}.horizontalItem.activeIndicatorHeight`)} - ${get(`${bar}.horizontalItem.iconSize`)}) / 2)`),
      line('--_short-navigation-bar-icon-label-space', get(`${bar}.itemActiveIndicatorIconLabelSpace`)),
    ]),
    ...rule('.short-navigation-bar-item[data-selected]', [
      line('--_short-navigation-bar-icon-color', `var(--_short-navigation-bar-selected-icon-override, ${get(`${bar}.itemActiveIconColor`)})`),
      line('--_short-navigation-bar-label-color', `var(--_short-navigation-bar-selected-label-override, ${get(`${bar}.itemActiveLabelTextColor`)})`),
      line('--_ripple-color', get(`${state}.activeHoverStateLayerColor`)),
    ]),
    ...rule(".short-navigation-bar-item[data-selected][data-icon-position='start']", [
      line('--_short-navigation-bar-label-color', `var(--_short-navigation-bar-selected-start-label-override, var(--_short-navigation-bar-selected-icon-override, ${get(`${bar}.itemActiveIconColor`)}))`),
    ]),
    ...rule('.short-navigation-bar-item[data-focus-visible]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactiveFocusStateLayerColor`))]),
    ...rule('.short-navigation-bar-item[data-pressed]:not([data-selected])', [line('--_ripple-color', get(`${state}.inactivePressedStateLayerColor`))]),
    ...rule('.short-navigation-bar-item[data-selected][data-focus-visible]', [line('--_ripple-color', get(`${state}.activeFocusStateLayerColor`))]),
    ...rule('.short-navigation-bar-item[data-selected][data-pressed]', [line('--_ripple-color', get(`${state}.activePressedStateLayerColor`))]),
    ...rule('.short-navigation-bar-item[data-disabled]', [line('--_short-navigation-bar-content-opacity', 0.38)]),
    '',
  ];
  return css.join('\n');
}
export default defineCssAdapter('short-navigation-bar', createShortNavigationBarCss);
