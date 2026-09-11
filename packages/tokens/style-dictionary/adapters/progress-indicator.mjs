import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

function shapeRadius(get, value, label) {
  if (value === 'full') return get('shape.full');
  throw new Error(`Progress Indicator CSS: unsupported ${label} shape ${String(value)}`);
}

export function createProgressIndicatorCss(context) {
  const get = tokenReader(context, 'Progress Indicator CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const base = 'component.progressIndicator';

  return [
    '.progress-indicator {',
    line('--_progress-active-color', get(`${base}.base.activeIndicatorColor`)),
    line('--_progress-track-color', get(`${base}.base.trackColor`)),
    line('--_progress-stop-color', get(`${base}.base.stopColor`)),
    line('--_progress-active-radius', shapeRadius(get, get(`${base}.base.activeShape`), 'active')),
    line('--_progress-track-radius', shapeRadius(get, get(`${base}.base.trackShape`), 'track')),
    line('--_progress-stop-radius', shapeRadius(get, get(`${base}.base.stopShape`), 'stop')),
    line('--_progress-linear-active-thickness', get(`${base}.linear.activeThickness`)),
    line('--_progress-linear-track-thickness', get(`${base}.linear.trackThickness`)),
    line('--_progress-linear-gap', get(`${base}.linear.trackActiveSpace`)),
    line('--_progress-linear-stop-size', get(`${base}.linear.stopSize`)),
    line('--_progress-circular-active-thickness', get(`${base}.circular.activeThickness`)),
    line('--_progress-circular-track-thickness', get(`${base}.circular.trackThickness`)),
    line('--_progress-circular-gap', get(`${base}.circular.trackActiveSpace`)),
    line('--_progress-easing-standard', get('motion.easing.standard')),
    line('--_progress-easing-emphasized-accelerate', get('motion.easing.emphasizedAccelerate')),
    line('--_progress-easing-emphasized-decelerate', get('motion.easing.emphasizedDecelerate')),
    line('--_progress-four-color-1', get('color.role.primary')),
    line('--_progress-four-color-2', get('color.role.primaryContainer')),
    line('--_progress-four-color-3', get('color.role.tertiary')),
    line('--_progress-four-color-4', get('color.role.tertiaryContainer')),
    '}',
    '',
    '.progress-indicator--linear {',
    line('--_progress-linear-height', get(`${base}.linear.height`)),
    '}',
    '',
    '.progress-indicator--circular {',
    line('--_progress-circular-size', get(`${base}.circular.size`)),
    line('--_progress-determinate-easing', get('motion.easing.legacyDecelerate')),
    '}',
    '',
    '.progress-indicator--linear.progress-indicator--wavy {',
    line('--_progress-linear-height', get(`${base}.linear.waveHeight`)),
    '}',
    '',
    '.progress-indicator--circular.progress-indicator--wavy {',
    line('--_progress-circular-size', get(`${base}.circular.waveSize`)),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('progress-indicator', createProgressIndicatorCss);
