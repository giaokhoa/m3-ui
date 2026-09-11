import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

export function createBottomAppBarCss(context) {
  const get = tokenReader(context, 'BottomAppBar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  return [
    '.bottom-app-bar {',
    line('--_bottom-app-bar-content-color', get('color.role.onSurface')),
    line('--_bottom-app-bar-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_bottom-app-bar-motion-easing', get('motion.spring.fastSpatial.easing')),
    '}',
    '',
    ".bottom-app-bar[data-variant='flexible'] {",
    line('--_bottom-app-bar-flexible-leading-space', get('component.toolbar.docked.containerLeadingSpace')),
    line('--_bottom-app-bar-flexible-trailing-space', get('component.toolbar.docked.containerTrailingSpace')),
    line('--_bottom-app-bar-flexible-min-spacing', get('component.toolbar.docked.containerMinSpacing')),
    line('--_bottom-app-bar-flexible-max-spacing', get('component.toolbar.docked.containerMaxSpacing')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('bottom-app-bar', createBottomAppBarCss);
