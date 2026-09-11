import {
  cssValue,
  defineCssAdapter,
  tokenReader,
  withOpacity,
} from '../adapter-helpers.mjs';

export function createCheckboxCss(context) {
  const get = tokenReader(context, 'Checkbox CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.checkbox {',
    line('--_checkbox-container-size', get('component.checkbox.containerSize')),
    line('--_checkbox-container-radius', get('component.checkbox.containerRadius')),
    line('--_checkbox-state-layer-size', get('component.checkbox.stateLayerSize')),
    line('--_checkbox-interactive-size', get('component.checkbox.minimumInteractiveSize')),
    line('--_checkbox-stroke-width', get('component.checkbox.strokeWidth')),
    line('--_checkbox-label-color', get('component.checkbox.labelColor')),
    line('--_checkbox-selected-container', get('component.checkbox.colors.selectedContainer')),
    line('--_checkbox-selected-icon', get('component.checkbox.colors.selectedIcon')),
    line('--_checkbox-unselected-outline', get('component.checkbox.colors.unselectedOutline')),
    line(
      '--_checkbox-disabled-selected-container-color',
      withOpacity(
        get('component.checkbox.colors.disabledSelectedContainer'),
        get('component.checkbox.disabledOpacity.selectedContainer'),
      ),
    ),
    line('--_checkbox-disabled-selected-icon-color', get('component.checkbox.colors.disabledSelectedIcon')),
    line(
      '--_checkbox-disabled-unselected-outline-color',
      withOpacity(
        get('component.checkbox.colors.disabledUnselectedOutline'),
        get('component.checkbox.disabledOpacity.unselectedOutline'),
      ),
    ),
    line(
      '--_checkbox-disabled-label-color',
      withOpacity(get('component.checkbox.labelColor'), get('state.disabled.contentOpacity')),
    ),
    line('--_checkbox-box-in-duration', get('component.checkbox.motion.boxIn.duration')),
    line('--_checkbox-box-in-easing', get('component.checkbox.motion.boxIn.easing')),
    line('--_checkbox-box-out-duration', get('component.checkbox.motion.boxOut.duration')),
    line('--_checkbox-box-out-easing', get('component.checkbox.motion.boxOut.easing')),
    line('--_checkbox-mark-duration', get('component.checkbox.motion.mark.duration')),
    line('--_checkbox-mark-easing', get('component.checkbox.motion.mark.easing')),
    line('--_checkbox-mark-out-delay', get('component.checkbox.motion.mark.outDelay')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('checkbox', createCheckboxCss);
