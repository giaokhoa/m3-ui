import {
  composite,
  cssValue,
  defineCssAdapter,
  percent,
  tokenReader,
} from '../adapter-helpers.mjs';

function dimensionNumber(value, label) {
  const number = Number.parseFloat(String(value));
  if (!Number.isFinite(number)) {
    throw new TypeError(`Switch CSS: expected ${label} to be a CSS dimension, received ${String(value)}`);
  }
  return number;
}

function px(value) {
  return `${value}px`;
}

export function createSwitchCss(context) {
  const get = tokenReader(context, 'Switch CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const trackWidth = dimensionNumber(get('component.switch.track.width'), 'track width');
  const trackHeight = dimensionNumber(get('component.switch.track.height'), 'track height');
  const trackOutlineWidth = dimensionNumber(
    get('component.switch.track.outlineWidth'),
    'track outline width',
  );
  const uncheckedThumbSize = dimensionNumber(
    get('component.switch.handle.unselectedSize'),
    'unchecked thumb size',
  );
  const checkedThumbSize = dimensionNumber(
    get('component.switch.handle.selectedSize'),
    'checked thumb size',
  );
  const uncheckedThumbOffset = (trackHeight - uncheckedThumbSize) / 2;
  const contentThumbOffset = (trackHeight - checkedThumbSize) / 2;
  const checkedThumbOffset = trackWidth - checkedThumbSize - contentThumbOffset;
  const surface = get('color.role.surface');

  return [
    '.switch {',
    line('--_switch-track-width', get('component.switch.track.width')),
    line('--_switch-track-height', get('component.switch.track.height')),
    line('--_switch-track-outline-width', get('component.switch.track.outlineWidth')),
    line('--_switch-min-interactive-size', get('component.switch.minimumInteractiveSize')),
    line('--_switch-state-layer-size', get('component.switch.stateLayerSize')),
    line('--_switch-label-color', get('color.role.onSurface')),
    line('--_switch-unchecked-thumb-size', get('component.switch.handle.unselectedSize')),
    line('--_switch-checked-thumb-size', get('component.switch.handle.selectedSize')),
    line('--_switch-pressed-thumb-size', get('component.switch.handle.pressedSize')),
    line('--_switch-icon-size', get('component.switch.handle.iconSize')),
    line('--_switch-unchecked-thumb-offset', px(uncheckedThumbOffset)),
    line('--_switch-content-thumb-offset', px(contentThumbOffset)),
    line('--_switch-checked-thumb-offset', px(checkedThumbOffset)),
    line('--_switch-pressed-unchecked-thumb-offset', px(trackOutlineWidth)),
    line('--_switch-pressed-checked-thumb-offset', px(checkedThumbOffset - trackOutlineWidth)),
    line('--_switch-checked-thumb-color', get('component.switch.colors.checkedThumb')),
    line('--_switch-checked-track-color', get('component.switch.colors.checkedTrack')),
    line('--_switch-checked-border-color', get('component.switch.colors.checkedBorder')),
    line('--_switch-checked-icon-color', get('component.switch.colors.checkedIcon')),
    line('--_switch-unchecked-thumb-color', get('component.switch.colors.uncheckedThumb')),
    line('--_switch-unchecked-track-color', get('component.switch.colors.uncheckedTrack')),
    line('--_switch-unchecked-border-color', get('component.switch.colors.uncheckedBorder')),
    line('--_switch-unchecked-icon-color', get('component.switch.colors.uncheckedIcon')),
    line('--_switch-disabled-checked-thumb-color', get('component.switch.colors.disabledCheckedThumb')),
    line(
      '--_switch-disabled-checked-track-color',
      composite(
        get('component.switch.colors.disabledCheckedTrack'),
        get('component.switch.disabledOpacity.track'),
        surface,
      ),
    ),
    line('--_switch-disabled-checked-border-color', get('component.switch.colors.disabledCheckedBorder')),
    line(
      '--_switch-disabled-checked-icon-color',
      composite(
        get('component.switch.colors.disabledCheckedIcon'),
        get('component.switch.disabledOpacity.checkedIcon'),
        surface,
      ),
    ),
    line(
      '--_switch-disabled-unchecked-thumb-color',
      composite(
        get('component.switch.colors.disabledUncheckedThumb'),
        get('component.switch.disabledOpacity.uncheckedThumb'),
        surface,
      ),
    ),
    line(
      '--_switch-disabled-unchecked-track-color',
      composite(
        get('component.switch.colors.disabledUncheckedTrack'),
        get('component.switch.disabledOpacity.track'),
        surface,
      ),
    ),
    line(
      '--_switch-disabled-unchecked-border-color',
      composite(
        get('component.switch.colors.disabledUncheckedBorder'),
        get('component.switch.disabledOpacity.track'),
        surface,
      ),
    ),
    line(
      '--_switch-disabled-unchecked-icon-color',
      composite(
        get('component.switch.colors.disabledUncheckedIcon'),
        get('component.switch.disabledOpacity.uncheckedIcon'),
        surface,
      ),
    ),
    line('--_switch-disabled-label-opacity', percent(get('state.disabled.contentOpacity'))),
    line('--_switch-geometry-duration', get('component.switch.motion.geometry.duration')),
    line('--_switch-geometry-easing', get('component.switch.motion.geometry.easing')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('switch', createSwitchCss);
