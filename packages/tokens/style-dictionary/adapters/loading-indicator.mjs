import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

function shapeRadius(get, value, label) {
  if (value === 'full') return get('shape.full');
  throw new Error(`Loading Indicator CSS: unsupported ${label} shape ${String(value)}`);
}

export function createLoadingIndicatorCss(context) {
  const get = tokenReader(context, 'Loading Indicator CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const base = 'component.loadingIndicator';

  return [
    '.loading-indicator {',
    line('--_loading-width', get(`${base}.containerWidth`)),
    line('--_loading-height', get(`${base}.containerHeight`)),
    line('--_loading-active-size', get(`${base}.activeSize`)),
    line(
      '--_loading-container-radius',
      shapeRadius(get, get(`${base}.containerShape`), 'container'),
    ),
    line('--_loading-indicator-color', get(`${base}.activeIndicatorColor`)),
    line('--_loading-container-color', 'transparent'),
    '}',
    '',
    ".loading-indicator[data-contained='true'] {",
    line('--_loading-indicator-color', get(`${base}.containedActiveColor`)),
    line('--_loading-container-color', get(`${base}.containedContainerColor`)),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('loading-indicator', createLoadingIndicatorCss);
