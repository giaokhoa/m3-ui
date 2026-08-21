import {
  radioButtonTokens,
  type RadioButtonColorRole,
} from '@m3/tokens/radio-button';
import type { CSSProperties } from 'react';

export type RadioButtonStyle = CSSProperties &
  Record<`--${string}`, string | number>;

function roleVariable(role: RadioButtonColorRole): string {
  return `var(--${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`;
}

export const radioButtonBaseStyle: RadioButtonStyle = {
  '--_radio-icon-size': `${radioButtonTokens.iconSize}px`,
  '--_radio-state-layer-size': `${radioButtonTokens.stateLayerSize}px`,
  '--_radio-interactive-size': `${radioButtonTokens.minimumInteractiveSize}px`,
  '--_radio-padding': `${radioButtonTokens.padding}px`,
  '--_radio-stroke-width': `${radioButtonTokens.strokeWidth}px`,
  '--_radio-dot-size': `${radioButtonTokens.dotSize}px`,
  '--_radio-selected-color': roleVariable(radioButtonTokens.colors.selected),
  '--_radio-unselected-color': roleVariable(radioButtonTokens.colors.unselected),
  '--_radio-disabled-selected-color': roleVariable(
    radioButtonTokens.colors.disabledSelected,
  ),
  '--_radio-disabled-unselected-color': roleVariable(
    radioButtonTokens.colors.disabledUnselected,
  ),
  '--_radio-selected-state-layer': roleVariable(
    radioButtonTokens.colors.selectedStateLayer,
  ),
  '--_radio-unselected-state-layer': roleVariable(
    radioButtonTokens.colors.unselectedStateLayer,
  ),
  '--_radio-disabled-opacity': radioButtonTokens.disabledOpacity,
  '--_radio-transition-duration': `${radioButtonTokens.motion.durationMs}ms`,
  '--_radio-transition-easing': radioButtonTokens.motion.easing,
};
