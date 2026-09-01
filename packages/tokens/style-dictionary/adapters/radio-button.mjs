import {
  cssValue,
  defineCssAdapter,
  percent,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createRadioButtonCss(context) {
  const get = tokenReader(context, 'RadioButton CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.radio-button {',
    line('--_radio-icon-size', get('component.radioButton.iconSize')),
    line('--_radio-state-layer-size', get('component.radioButton.stateLayerSize')),
    line('--_radio-interactive-size', get('component.radioButton.minimumInteractiveSize')),
    line('--_radio-stroke-width', get('component.radioButton.strokeWidth')),
    line('--_radio-dot-size', get('component.radioButton.dotSize')),
    line('--_radio-label-color', get('color.role.onSurface')),
    line('--_radio-selected-color', get('component.radioButton.colors.selected')),
    line('--_radio-unselected-color', get('component.radioButton.colors.unselected')),
    line('--_radio-disabled-selected-color', get('component.radioButton.colors.disabledSelected')),
    line('--_radio-disabled-unselected-color', get('component.radioButton.colors.disabledUnselected')),
    line('--_radio-disabled-opacity', get('component.radioButton.disabledOpacity')),
    line('--_radio-disabled-label-opacity', percent(get('state.disabledContentOpacity'))),
    line('--_radio-color-duration', get('component.radioButton.motion.color.duration')),
    line('--_radio-color-easing', get('component.radioButton.motion.color.easing')),
    line('--_radio-dot-duration', get('component.radioButton.motion.dot.duration')),
    line('--_radio-dot-easing', get('component.radioButton.motion.dot.easing')),
    '}',
    '',
    '.radio-group {',
    line('--_radio-group-content-color', get('color.role.onSurface')),
    line('--_radio-group-error-color', get('color.role.error')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('radio-button', createRadioButtonCss);
