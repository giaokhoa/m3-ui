import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createRippleCss(context) {
  const get = tokenReader(context, 'Ripple CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  return [
    '.ripple {',
    line('--_ripple-radius-duration', get('ripple.radiusDuration')),
    line('--_ripple-hover-duration', get('ripple.hoverTransitionDuration')),
    line('--_ripple-focus-in-duration', get('ripple.focusInTransitionDuration')),
    line('--_ripple-fade-in-duration', get('ripple.fadeInDuration')),
    line('--_ripple-fade-out-duration', get('ripple.fadeOutDuration')),
    line('--_ripple-radius-easing', get('ripple.radiusEasing')),
    line('--_ripple-center-easing', get('ripple.centerEasing')),
    line('--_ripple-opacity-easing', get('ripple.opacityEasing')),
    line('--_ripple-hover-opacity', get('state.layer.opacity.hover')),
    line('--_ripple-focus-opacity', get('state.layer.opacity.focus')),
    line('--_ripple-pressed-opacity', get('state.layer.opacity.pressed')),
    line('--_ripple-focus-ring-outer-inset', get('ripple.focusRing.outerStrokeInset')),
    line('--_ripple-focus-ring-outer-width', get('ripple.focusRing.outerStrokeWidth')),
    line('--_ripple-focus-ring-inner-inset', get('ripple.focusRing.innerStrokeInset')),
    line('--_ripple-focus-ring-inner-width', get('ripple.focusRing.innerStrokeWidth')),
    line('--_ripple-focus-ring-outer-color', get('ripple.focusRing.outerStrokeColor')),
    line('--_ripple-focus-ring-inner-color', get('ripple.focusRing.innerStrokeColor')),
    line('--_ripple-focus-ring-in-duration', get('ripple.focusRing.focusIn.duration')),
    line('--_ripple-focus-ring-in-easing', get('ripple.focusRing.focusIn.easing')),
    line('--_ripple-focus-ring-out-duration', get('ripple.focusRing.focusOut.duration')),
    line('--_ripple-focus-ring-out-easing', get('ripple.focusRing.focusOut.easing')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('ripple', createRippleCss);
