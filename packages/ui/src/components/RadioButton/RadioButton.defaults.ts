import type { CSSProperties } from 'react';
import { radioButtonTokens } from './RadioButton.tokens';

export type RadioButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

function roleVariable(role: string): string {
  return `var(--${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`;
}

export const radioButtonBaseStyle: RadioButtonStyle = {
  '--_radio-icon-size': `${radioButtonTokens.iconSize}px`,
  '--_radio-state-layer-size': `${radioButtonTokens.stateLayerSize}px`,
  '--_radio-interactive-size': `${radioButtonTokens.minimumInteractiveSize}px`,
  '--_radio-stroke-width': `${radioButtonTokens.strokeWidth}px`,
  '--_radio-dot-size': `${radioButtonTokens.dotSize}px`,
  '--_radio-selected-color': roleVariable(radioButtonTokens.colors.selected),
  '--_radio-unselected-color': roleVariable(radioButtonTokens.colors.unselected),
  '--_radio-disabled-selected-color': roleVariable(radioButtonTokens.colors.disabledSelected),
  '--_radio-disabled-unselected-color': roleVariable(radioButtonTokens.colors.disabledUnselected),
  '--_radio-disabled-opacity': radioButtonTokens.disabledOpacity,
  '--_radio-color-duration': `${radioButtonTokens.motion.color.durationMs}ms`,
  '--_radio-color-easing': radioButtonTokens.motion.color.easing,
  '--_radio-dot-duration': `${radioButtonTokens.motion.dot.durationMs}ms`,
  '--_radio-dot-easing': radioButtonTokens.motion.dot.easing,
};
