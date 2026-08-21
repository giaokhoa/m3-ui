import { checkboxTokens, type CheckboxColorRole } from '@m3/tokens/checkbox';
import type { CSSProperties } from 'react';

export type CheckboxStyle = CSSProperties & Record<`--${string}`, string | number>;

function percent(value: number): string {
  return `${value * 100}%`;
}

function colorRoleVariable(role: CheckboxColorRole): string {
  const name = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return `var(--${name})`;
}

export const checkboxBaseStyle: CheckboxStyle = {
  '--_checkbox-container-size': `${checkboxTokens.containerSize}px`,
  '--_checkbox-container-radius': `${checkboxTokens.containerRadius}px`,
  '--_checkbox-state-layer-size': `${checkboxTokens.stateLayerSize}px`,
  '--_checkbox-interactive-size': `${checkboxTokens.minimumInteractiveSize}px`,
  '--_checkbox-stroke-width': `${checkboxTokens.strokeWidth}px`,
  '--_checkbox-selected-container': colorRoleVariable(
    checkboxTokens.selectedContainerColor,
  ),
  '--_checkbox-selected-icon': colorRoleVariable(checkboxTokens.selectedIconColor),
  '--_checkbox-unselected-outline': colorRoleVariable(
    checkboxTokens.unselectedOutlineColor,
  ),
  '--_checkbox-disabled-selected-container': colorRoleVariable(
    checkboxTokens.selectedDisabledContainerColor,
  ),
  '--_checkbox-disabled-selected-container-opacity': percent(
    checkboxTokens.selectedDisabledContainerOpacity,
  ),
  '--_checkbox-disabled-selected-icon': colorRoleVariable(
    checkboxTokens.selectedDisabledIconColor,
  ),
  '--_checkbox-disabled-unselected-outline': colorRoleVariable(
    checkboxTokens.unselectedDisabledOutlineColor,
  ),
  '--_checkbox-disabled-unselected-outline-opacity': percent(
    checkboxTokens.unselectedDisabledOutlineOpacity,
  ),
  '--_checkbox-box-in-duration': `${checkboxTokens.motion.defaultEffects.durationMs}ms`,
  '--_checkbox-box-in-easing': checkboxTokens.motion.defaultEffects.easing,
  '--_checkbox-box-out-duration': `${checkboxTokens.motion.fastEffects.durationMs}ms`,
  '--_checkbox-box-out-easing': checkboxTokens.motion.fastEffects.easing,
  '--_checkbox-mark-duration': `${checkboxTokens.motion.defaultSpatial.durationMs}ms`,
  '--_checkbox-mark-easing': checkboxTokens.motion.defaultSpatial.easing,
  '--_checkbox-mark-out-delay': `${checkboxTokens.motion.snapDelayMs}ms`,
};
