import { checkboxTokens } from './Checkbox.tokens';
import type { CSSProperties } from 'react';

export type CheckboxStyle = CSSProperties & Record<`--${string}`, string | number>;

function percent(value: number): string {
  return `${value * 100}%`;
}

export const checkboxBaseStyle: CheckboxStyle = {
  '--_checkbox-container-size': `${checkboxTokens.containerSize}px`,
  '--_checkbox-container-radius': `${checkboxTokens.containerRadius}px`,
  '--_checkbox-state-layer-size': `${checkboxTokens.stateLayerSize}px`,
  '--_checkbox-interactive-size': `${checkboxTokens.minimumInteractiveSize}px`,
  '--_checkbox-stroke-width': `${checkboxTokens.strokeWidth}px`,
  '--_checkbox-selected-container': checkboxTokens.selectedContainerColor,
  '--_checkbox-selected-icon': checkboxTokens.selectedIconColor,
  '--_checkbox-unselected-outline': checkboxTokens.unselectedOutlineColor,
  '--_checkbox-disabled-selected-container': checkboxTokens.selectedDisabledContainerColor,
  '--_checkbox-disabled-selected-container-opacity': percent(
    checkboxTokens.selectedDisabledContainerOpacity,
  ),
  '--_checkbox-disabled-selected-icon': checkboxTokens.selectedDisabledIconColor,
  '--_checkbox-disabled-unselected-outline': checkboxTokens.unselectedDisabledOutlineColor,
  '--_checkbox-disabled-unselected-outline-opacity': percent(
    checkboxTokens.unselectedDisabledOutlineOpacity,
  ),
  '--_checkbox-disabled-label-opacity': percent(checkboxTokens.disabledLabelOpacity),
  '--_checkbox-box-in-duration': `${checkboxTokens.motion.defaultEffects.durationMs}ms`,
  '--_checkbox-box-in-easing': checkboxTokens.motion.defaultEffects.easing,
  '--_checkbox-box-out-duration': `${checkboxTokens.motion.fastEffects.durationMs}ms`,
  '--_checkbox-box-out-easing': checkboxTokens.motion.fastEffects.easing,
  '--_checkbox-mark-duration': `${checkboxTokens.motion.defaultSpatial.durationMs}ms`,
  '--_checkbox-mark-easing': checkboxTokens.motion.defaultSpatial.easing,
  '--_checkbox-mark-out-delay': `${checkboxTokens.motion.snapDelayMs}ms`,
};
