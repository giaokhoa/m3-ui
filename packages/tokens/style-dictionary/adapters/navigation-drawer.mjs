import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function rule(selector, declarations) { return ['', `${selector} {`, ...declarations, '}']; }

export function createNavigationDrawerCss(context) {
  const get = tokenReader(context, 'NavigationDrawer CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const drawer = 'component.navigation.drawer';
  const role = get(`${drawer}.labelTextTypography`);
  const itemColors = (prefix, selected) => [
    line('--_navigation-drawer-item-icon-color', get(`${drawer}.${prefix}IconColor`)),
    line('--_navigation-drawer-item-label-color', get(`${drawer}.${prefix}LabelTextColor`)),
    line('--_ripple-color', get(`${drawer}.${selected ? 'active' : 'inactive'}${prefix.includes('Pressed') ? 'Pressed' : prefix.includes('Focus') ? 'Focus' : 'Hover'}StateLayerColor`)),
  ];
  const css = [
    '.navigation-drawer-sheet {',
    line('--_navigation-drawer-min-width', '240px'),
    line('--_navigation-drawer-width', get(`${drawer}.containerWidth`)),
    line('--_navigation-drawer-content-color', get('color.role.onSurface')),
    line('--_navigation-drawer-box-shadow', 'none'),
    '}',
    ...rule('.permanent-drawer-sheet, .dismissible-drawer-sheet', [
      line('--_navigation-drawer-container-color', get(`${drawer}.standardContainerColor`)),
      line('--_navigation-drawer-radius-start-start', get('shape.corner.none')),
      line('--_navigation-drawer-radius-start-end', get('shape.corner.none')),
      line('--_navigation-drawer-radius-end-end', get('shape.corner.none')),
      line('--_navigation-drawer-radius-end-start', get('shape.corner.none')),
    ]),
    ...rule('.modal-drawer-sheet', [
      line('--_navigation-drawer-container-color', get(`${drawer}.modalContainerColor`)),
      line('--_navigation-drawer-radius-start-start', get('shape.corner.largeEnd.topStart')),
      line('--_navigation-drawer-radius-start-end', get('shape.corner.largeEnd.topEnd')),
      line('--_navigation-drawer-radius-end-end', get('shape.corner.largeEnd.bottomEnd')),
      line('--_navigation-drawer-radius-end-start', get('shape.corner.largeEnd.bottomStart')),
    ]),
    '.navigation-drawer-item {',
    line('--_navigation-drawer-item-height', get(`${drawer}.activeIndicatorHeight`)),
    line('--_navigation-drawer-item-radius', get('shape.full')),
    line('--_navigation-drawer-item-outer-padding', `calc((${get(`${drawer}.containerWidth`)} - ${get(`${drawer}.activeIndicatorWidth`)}) / 2)`),
    line('--_navigation-drawer-item-padding-start', '16px'),
    line('--_navigation-drawer-item-padding-end', '24px'),
    line('--_navigation-drawer-item-icon-label-space', '12px'),
    line('--_navigation-drawer-item-label-badge-space', '12px'),
    line('--_navigation-drawer-item-icon-size', get(`${drawer}.iconSize`)),
    line('--_navigation-drawer-item-container-color', 'transparent'),
    line('--_navigation-drawer-item-icon-color', get(`${drawer}.inactiveIconColor`)),
    line('--_navigation-drawer-item-label-color', get(`${drawer}.inactiveLabelTextColor`)),
    line('--_navigation-drawer-item-badge-color', get(`${drawer}.largeBadgeLabelColor`)),
    line('--_navigation-drawer-focus-indicator-color', get(`${drawer}.focusIndicatorColor`)),
    line('--_ripple-color', get(`${drawer}.inactivePressedStateLayerColor`)),
    line('--_ripple-hover-opacity', get(`${drawer}.hoverStateLayerOpacity`)),
    line('--_ripple-focus-opacity', get(`${drawer}.focusStateLayerOpacity`)),
    line('--_ripple-pressed-opacity', get(`${drawer}.pressedStateLayerOpacity`)),
    line('--_navigation-drawer-item-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_navigation-drawer-item-font-size', get(`typography.${role}.fontSize`)),
    line('--_navigation-drawer-item-line-height', get(`typography.${role}.lineHeight`)),
    line('--_navigation-drawer-item-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_navigation-drawer-item-letter-spacing', get(`typography.${role}.letterSpacing`)),
    '}',
    ...rule('.navigation-drawer-item[data-selected]', [
      line('--_navigation-drawer-item-container-color', get(`${drawer}.activeIndicatorColor`)),
      line('--_navigation-drawer-item-icon-color', get(`${drawer}.activeIconColor`)),
      line('--_navigation-drawer-item-label-color', get(`${drawer}.activeLabelTextColor`)),
      line('--_navigation-drawer-item-badge-color', get(`${drawer}.activeLabelTextColor`)),
      line('--_ripple-color', get(`${drawer}.activePressedStateLayerColor`)),
    ]),
    ...rule('.navigation-drawer-item[data-hovered]:not([data-selected])', itemColors('inactiveHover', false)),
    ...rule('.navigation-drawer-item[data-focus-visible]:not([data-selected])', itemColors('inactiveFocus', false)),
    ...rule('.navigation-drawer-item[data-pressed]:not([data-selected])', itemColors('inactivePressed', false)),
    ...rule('.navigation-drawer-item[data-selected][data-hovered]', itemColors('activeHover', true)),
    ...rule('.navigation-drawer-item[data-selected][data-focus-visible]', itemColors('activeFocus', true)),
    ...rule('.navigation-drawer-item[data-selected][data-pressed]', itemColors('activePressed', true)),
    '.modal-navigation-drawer-overlay, .dismissible-navigation-drawer {',
    line('--_navigation-drawer-open-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_navigation-drawer-open-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_navigation-drawer-settle-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_navigation-drawer-settle-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_navigation-drawer-close-duration', get('motion.spring.fastEffects.duration')),
    line('--_navigation-drawer-close-easing', get('motion.spring.fastEffects.easing')),
    '}',
    '',
  ];
  return css.join('\n');
}
export default defineCssAdapter('navigation-drawer', createNavigationDrawerCss);
