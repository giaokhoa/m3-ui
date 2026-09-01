import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

export function createModalWideNavigationRailCss(context) {
  const get = tokenReader(context, 'ModalWideNavigationRail CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const rail = 'component.navigation.rail.expanded';
  return [
    '.modal-wide-navigation-rail {',
    line('--_modal-wide-navigation-rail-container-color', get(`${rail}.modalContainerColor`)),
    line('--_modal-wide-navigation-rail-content-color', get('color.role.onSurface')),
    line('--_modal-wide-navigation-rail-radius', get('shape.corner.large')),
    line('--_modal-wide-navigation-rail-width-duration', get('motion.spring.fastSpatial.duration')),
    line('--_modal-wide-navigation-rail-width-easing', get('motion.spring.fastSpatial.easing')),
    line('--_modal-wide-navigation-rail-slide-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_modal-wide-navigation-rail-slide-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_modal-wide-navigation-rail-effects-duration', get('motion.spring.defaultEffects.duration')),
    line('--_modal-wide-navigation-rail-effects-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '',
  ].join('\n');
}
export default defineCssAdapter('modal-wide-navigation-rail', createModalWideNavigationRailCss);
