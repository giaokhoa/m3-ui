import type { CSSProperties } from 'react';
import { radioButtonTokens } from './RadioButton.tokens';

export type RadioButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

export const radioButtonBaseStyle: RadioButtonStyle = {
  '--_radio-icon-size': `${radioButtonTokens.iconSize}px`,
  '--_radio-state-layer-size': `${radioButtonTokens.stateLayerSize}px`,
  '--_radio-interactive-size': `${radioButtonTokens.minimumInteractiveSize}px`,
  '--_radio-stroke-width': `${radioButtonTokens.strokeWidth}px`,
  '--_radio-dot-size': `${radioButtonTokens.dotSize}px`,
  '--_radio-selected-color': radioButtonTokens.colors.selected,
  '--_radio-unselected-color': radioButtonTokens.colors.unselected,
  '--_radio-disabled-selected-color': radioButtonTokens.colors.disabledSelected,
  '--_radio-disabled-unselected-color': radioButtonTokens.colors.disabledUnselected,
  '--_radio-disabled-opacity': radioButtonTokens.disabledOpacity,
  '--_radio-disabled-label-opacity': `${radioButtonTokens.disabledLabelOpacity * 100}%`,
  '--_radio-color-duration': `${radioButtonTokens.motion.color.durationMs}ms`,
  '--_radio-color-easing': radioButtonTokens.motion.color.easing,
  '--_radio-dot-duration': `${radioButtonTokens.motion.dot.durationMs}ms`,
  '--_radio-dot-easing': radioButtonTokens.motion.dot.easing,
};
