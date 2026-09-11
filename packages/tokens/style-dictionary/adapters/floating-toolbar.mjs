import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function radius(get, shape) {
  return cssValue(get(`shape.${shape}`));
}

export function createFloatingToolbarCss(context) {
  const get = tokenReader(context, 'FloatingToolbar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  return [
    '.floating-toolbar {',
    line('--_floating-toolbar-container-size', get('component.toolbar.floating.containerHeight')),
    line('--_floating-toolbar-container-radius', radius(get, get('component.toolbar.floating.containerShape'))),
    line('--_floating-toolbar-content-padding', get('component.toolbar.floating.containerLeadingSpace')),
    line('--_floating-toolbar-screen-offset', get('component.toolbar.floating.containerExternalPadding')),
    line('--_floating-toolbar-fab-size', get('component.fab.size.medium.containerWidth')),
    line('--_floating-toolbar-fab-max-size', get('component.fab.size.medium.containerWidth')),
    line('--_floating-toolbar-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_floating-toolbar-motion-easing', get('motion.spring.fastSpatial.easing')),
    line('--_floating-toolbar-snap-duration', get('motion.spring.defaultEffects.duration')),
    line('--_floating-toolbar-snap-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '',
    ".floating-toolbar[data-variant='standard'] {",
    line('--_floating-toolbar-container-color', get('component.toolbar.floating.standardContainerColor')),
    line('--_floating-toolbar-content-color', get('color.role.onSurface')),
    '}',
    '',
    ".floating-toolbar[data-variant='vibrant'] {",
    line('--_floating-toolbar-container-color', get('component.toolbar.floating.vibrantContainerColor')),
    line('--_floating-toolbar-content-color', get('color.role.onPrimaryContainer')),
    '}',
    '',
    '.floating-toolbar[data-expanded] {',
    line('--_floating-toolbar-fab-size', get('component.fab.size.baseline.containerWidth')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('floating-toolbar', createFloatingToolbarCss);
