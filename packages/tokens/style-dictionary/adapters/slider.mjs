import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

const sizes = ['xSmall', 'small', 'medium', 'large', 'xLarge'];

function dimensionNumber(value, label) {
  const number = Number.parseFloat(String(value));
  if (!Number.isFinite(number)) {
    throw new TypeError(
      `Slider CSS: expected ${label} to be a CSS dimension, received ${String(value)}`,
    );
  }
  return number;
}

function px(value) {
  return `${value}px`;
}

export function createSliderCss(context) {
  const get = tokenReader(context, 'Slider CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const handleWidth = dimensionNumber(get('component.slider.handleWidth'), 'handle width');
  const focusHandleWidth = dimensionNumber(
    get('component.slider.focusHandleWidth'),
    'focus handle width',
  );
  const pressedHandleWidth = dimensionNumber(
    get('component.slider.pressedHandleWidth'),
    'pressed handle width',
  );
  const disabledHandleWidth = dimensionNumber(
    get('component.slider.disabledHandleWidth'),
    'disabled handle width',
  );
  const baselineTrackGap = dimensionNumber(
    get('component.slider.activeHandleLeadingSpace'),
    'active handle leading space',
  );
  const stopSize = dimensionNumber(
    get('component.slider.stopIndicatorSize'),
    'stop indicator size',
  );
  const stopTrailingSpace = dimensionNumber(
    get('component.slider.webCurrent.stopIndicatorTrailingSpace'),
    'web stop indicator trailing space',
  );
  const thumbTrackGap = (width) => px(baselineTrackGap + width / 2);
  const typographyRole = get('component.slider.valueIndicatorLabelTextFont');
  const fontFamilyRole = get(`typography.${typographyRole}.fontFamily`);

  const base = [
    '.slider {',
    line('--_slider-handle-width', get('component.slider.handleWidth')),
    line('--_slider-hover-handle-width', get('component.slider.hoverHandleWidth')),
    line('--_slider-focus-handle-width', get('component.slider.focusHandleWidth')),
    line('--_slider-pressed-handle-width', get('component.slider.pressedHandleWidth')),
    line('--_slider-disabled-handle-width', get('component.slider.disabledHandleWidth')),
    line('--_slider-default-thumb-track-gap', thumbTrackGap(handleWidth)),
    line('--_slider-focus-thumb-track-gap', thumbTrackGap(focusHandleWidth)),
    line('--_slider-pressed-thumb-track-gap', thumbTrackGap(pressedHandleWidth)),
    line('--_slider-disabled-thumb-track-gap', thumbTrackGap(disabledHandleWidth)),
    line('--_slider-handle-color', get('component.slider.handleColor')),
    line('--_slider-active-track-color', get('component.slider.activeTrackColor')),
    line('--_slider-inactive-track-color', get('component.slider.inactiveTrackColor')),
    line('--_slider-disabled-handle-color', get('component.slider.disabledHandleColor')),
    line('--_slider-disabled-handle-opacity', get('component.slider.disabledHandleOpacity')),
    line(
      '--_slider-disabled-active-track-color',
      get('component.slider.disabledActiveTrackColor'),
    ),
    line(
      '--_slider-disabled-active-track-opacity',
      get('component.slider.disabledActiveTrackOpacity'),
    ),
    line(
      '--_slider-disabled-inactive-track-color',
      get('component.slider.disabledInactiveTrackColor'),
    ),
    line(
      '--_slider-disabled-inactive-track-opacity',
      get('component.slider.disabledInactiveTrackOpacity'),
    ),
    line('--_slider-stop-size', get('component.slider.stopIndicatorSize')),
    line(
      '--_slider-stop-trailing-space',
      get('component.slider.webCurrent.stopIndicatorTrailingSpace'),
    ),
    line('--_slider-stop-center-inset', px(stopTrailingSpace + stopSize / 2)),
    line('--_slider-stop-color', get('component.slider.webCurrent.stopIndicatorColor')),
    line(
      '--_slider-selected-stop-color',
      get('component.slider.webCurrent.stopIndicatorColorSelected'),
    ),
    line(
      '--_slider-disabled-active-stop-color',
      get('component.slider.webCurrent.disabledActiveStopIndicatorContainerColor'),
    ),
    line(
      '--_slider-disabled-inactive-stop-color',
      get('component.slider.webCurrent.disabledInactiveStopIndicatorContainerColor'),
    ),
    line(
      '--_slider-value-indicator-bottom-space',
      get('component.slider.valueIndicatorActiveBottomSpace'),
    ),
    line(
      '--_slider-value-indicator-container-color',
      get('component.slider.valueIndicatorContainerColor'),
    ),
    line(
      '--_slider-value-indicator-label-color',
      get('component.slider.valueIndicatorLabelTextColor'),
    ),
    line('--_slider-value-indicator-font-family', `var(--font-family-${fontFamilyRole})`),
    line(
      '--_slider-value-indicator-font-size',
      get(`typography.${typographyRole}.fontSize`),
    ),
    line(
      '--_slider-value-indicator-line-height',
      get(`typography.${typographyRole}.lineHeight`),
    ),
    line(
      '--_slider-value-indicator-font-weight',
      get('component.slider.webCurrent.valueIndicatorLabelTextWeight'),
    ),
    line(
      '--_slider-value-indicator-letter-spacing',
      get('component.slider.webCurrent.valueIndicatorLabelTextTracking'),
    ),
    '}',
  ];

  const sizeRules = sizes.flatMap((size) => {
    const prefix = `component.slider.size.${size}`;
    return [
      '',
      `.slider[data-size='${size}'] {`,
      line('--_slider-handle-length', get(`${prefix}.activeHandleHeight`)),
      line('--_slider-active-track-thickness', get(`${prefix}.activeTrackHeight`)),
      line('--_slider-inactive-track-thickness', get(`${prefix}.inactiveTrackHeight`)),
      line('--_slider-active-outer-radius', get(`${prefix}.activeTrackShapeLeading`)),
      line('--_slider-inactive-outer-radius', get(`${prefix}.inactiveTrackShapeTrailing`)),
      '}',
    ];
  });

  return [...base, ...sizeRules, ''].join('\n');
}

export default defineCssAdapter('slider', createSliderCss);
