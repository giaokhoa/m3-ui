import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) { return ['', `${selector} {`, ...declarations, '}']; }

export function createTabsCss(context) {
  const get = tokenReader(context, 'Tabs CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const tab = 'component.navigation.tab';
  const typography = (role) => [
    line('--_tabs-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_tabs-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_tabs-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_tabs-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_tabs-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
  ];
  const css = [
    '.tabs {',
    line('--_tabs-edge-padding', '52px'),
    line('--_tabs-min-tab-width', '90px'),
    line('--_tabs-horizontal-text-padding', '16px'),
    line('--_tabs-leading-gap', '8px'),
    line('--_tabs-stacked-gap', '4px'),
    line('--_tabs-tab-large-height', '72px'),
    line('--_tabs-motion-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_tabs-motion-easing', get('motion.spring.defaultSpatial.easing')),
    '}',
    ...rule(".tabs[data-variant='primary']", [
      line('--_tabs-container-color', get(`${tab}.primary.containerColor`)),
      line('--_tabs-indicator-color', get(`${tab}.primary.activeIndicatorColor`)),
      line('--_tabs-indicator-height', get(`${tab}.primary.activeIndicatorHeight`)),
      line('--_tabs-indicator-radius', get(`${tab}.primary.webActiveIndicatorShape`)),
    ]),
    ...rule(".tabs[data-variant='secondary']", [
      line('--_tabs-container-color', get(`${tab}.secondary.containerColor`)),
      line('--_tabs-indicator-color', get(`${tab}.secondary.activeIndicatorColor`)),
      line('--_tabs-indicator-height', '3px'),
      line('--_tabs-indicator-radius', '0px'),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab", [
      line('--_tabs-tab-height', get(`${tab}.primary.containerHeight`)),
      line('--_tabs-icon-size', get(`${tab}.primary.iconSize`)),
      line('--_tabs-icon-color', get(`${tab}.primary.inactiveIconColor`)),
      line('--_tabs-label-color', get(`${tab}.primary.inactiveLabelTextColor`)),
      line('--_tabs-content-opacity', 1),
      line('--_ripple-color', get(`${tab}.primary.inactiveHoverStateLayerColor`)),
      line('--_ripple-hover-opacity', get(`${tab}.primary.inactiveHoverStateLayerOpacity`)),
      line('--_ripple-focus-opacity', get(`${tab}.primary.inactiveFocusStateLayerOpacity`)),
      line('--_ripple-pressed-opacity', get(`${tab}.primary.inactivePressedStateLayerOpacity`)),
      ...typography(get(`${tab}.primary.labelTextTypography`)),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab[data-focus-visible]:not([data-selected])", [
      line('--_ripple-color', get(`${tab}.primary.inactiveFocusStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab[data-pressed]:not([data-selected])", [
      line('--_ripple-color', get(`${tab}.primary.inactivePressedStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab[data-selected]", [
      line('--_tabs-icon-color', get(`${tab}.primary.activeIconColor`)),
      line('--_tabs-label-color', get(`${tab}.primary.activeLabelTextColor`)),
      line('--_ripple-color', get(`${tab}.primary.activeHoverStateLayerColor`)),
      line('--_ripple-hover-opacity', get(`${tab}.primary.activeHoverStateLayerOpacity`)),
      line('--_ripple-focus-opacity', get(`${tab}.primary.activeFocusStateLayerOpacity`)),
      line('--_ripple-pressed-opacity', get(`${tab}.primary.activePressedStateLayerOpacity`)),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab[data-selected][data-focus-visible]", [
      line('--_ripple-color', get(`${tab}.primary.activeFocusStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='primary'] .tabs__tab[data-selected][data-pressed]", [
      line('--_ripple-color', get(`${tab}.primary.activePressedStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='secondary'] .tabs__tab", [
      line('--_tabs-tab-height', get(`${tab}.secondary.containerHeight`)),
      line('--_tabs-icon-size', get(`${tab}.secondary.iconSize`)),
      line('--_tabs-icon-color', get(`${tab}.secondary.inactiveIconColor`)),
      line('--_tabs-label-color', get(`${tab}.secondary.inactiveLabelTextColor`)),
      line('--_tabs-content-opacity', 1),
      line('--_ripple-color', get(`${tab}.secondary.hoverStateLayerColor`)),
      line('--_ripple-hover-opacity', get(`${tab}.secondary.hoverStateLayerOpacity`)),
      line('--_ripple-focus-opacity', get(`${tab}.secondary.focusStateLayerOpacity`)),
      line('--_ripple-pressed-opacity', get(`${tab}.secondary.pressedStateLayerOpacity`)),
      ...typography(get(`${tab}.secondary.labelTextTypography`)),
    ]),
    ...rule(".tabs[data-variant='secondary'] .tabs__tab[data-focus-visible]", [
      line('--_ripple-color', get(`${tab}.secondary.focusStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='secondary'] .tabs__tab[data-pressed]", [
      line('--_ripple-color', get(`${tab}.secondary.pressedStateLayerColor`)),
    ]),
    ...rule(".tabs[data-variant='secondary'] .tabs__tab[data-selected]", [
      line('--_tabs-icon-color', get(`${tab}.secondary.activeIconColor`)),
      line('--_tabs-label-color', get(`${tab}.secondary.activeLabelTextColor`)),
    ]),
    ...rule('.tabs__tab[data-disabled]', [line('--_tabs-content-opacity', 0.38)]),
    '',
  ];
  return css.join('\n');
}
export default defineCssAdapter('tabs', createTabsCss);
