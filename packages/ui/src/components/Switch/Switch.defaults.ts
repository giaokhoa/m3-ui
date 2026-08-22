import { switchTokens, type SwitchColorRole } from '@m3/tokens/switch';
import type { CSSProperties } from 'react';

export type SwitchStyle = CSSProperties & Record<`--${string}`, string | number>;

function roleVariable(role: SwitchColorRole): string {
  return `var(--${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`;
}

function compositeOverSurface(role: SwitchColorRole, opacity: number): string {
  return `color-mix(in srgb, ${roleVariable(role)} ${opacity * 100}%, var(--surface))`;
}

export const switchBaseStyle: SwitchStyle = {
  '--_switch-track-width': `${switchTokens.trackWidth}px`,
  '--_switch-track-height': `${switchTokens.trackHeight}px`,
  '--_switch-track-outline-width': `${switchTokens.trackOutlineWidth}px`,
  '--_switch-min-interactive-size': `${switchTokens.minimumInteractiveSize}px`,
  '--_switch-state-layer-size': `${switchTokens.stateLayerSize}px`,
  '--_switch-unchecked-thumb-size': `${switchTokens.uncheckedThumbSize}px`,
  '--_switch-checked-thumb-size': `${switchTokens.checkedThumbSize}px`,
  '--_switch-pressed-thumb-size': `${switchTokens.pressedThumbSize}px`,
  '--_switch-icon-size': `${switchTokens.iconSize}px`,
  '--_switch-checked-thumb-color': roleVariable(switchTokens.colors.checkedThumb),
  '--_switch-checked-track-color': roleVariable(switchTokens.colors.checkedTrack),
  '--_switch-checked-border-color': 'transparent',
  '--_switch-checked-icon-color': roleVariable(switchTokens.colors.checkedIcon),
  '--_switch-unchecked-thumb-color': roleVariable(switchTokens.colors.uncheckedThumb),
  '--_switch-unchecked-track-color': roleVariable(switchTokens.colors.uncheckedTrack),
  '--_switch-unchecked-border-color': roleVariable(switchTokens.colors.uncheckedBorder),
  '--_switch-unchecked-icon-color': roleVariable(switchTokens.colors.uncheckedIcon),
  '--_switch-disabled-checked-thumb-color': roleVariable(
    switchTokens.colors.disabledCheckedThumb,
  ),
  '--_switch-disabled-checked-track-color': compositeOverSurface(
    switchTokens.colors.disabledCheckedTrack,
    switchTokens.disabledOpacity.track,
  ),
  '--_switch-disabled-checked-border-color': 'transparent',
  '--_switch-disabled-checked-icon-color': compositeOverSurface(
    switchTokens.colors.disabledCheckedIcon,
    switchTokens.disabledOpacity.checkedIcon,
  ),
  '--_switch-disabled-unchecked-thumb-color': compositeOverSurface(
    switchTokens.colors.disabledUncheckedThumb,
    switchTokens.disabledOpacity.uncheckedThumb,
  ),
  '--_switch-disabled-unchecked-track-color': compositeOverSurface(
    switchTokens.colors.disabledUncheckedTrack,
    switchTokens.disabledOpacity.track,
  ),
  '--_switch-disabled-unchecked-border-color': compositeOverSurface(
    switchTokens.colors.disabledUncheckedBorder,
    switchTokens.disabledOpacity.track,
  ),
  '--_switch-disabled-unchecked-icon-color': compositeOverSurface(
    switchTokens.colors.disabledUncheckedIcon,
    switchTokens.disabledOpacity.uncheckedIcon,
  ),
  '--_switch-geometry-duration': `${switchTokens.motion.geometry.durationMs}ms`,
  '--_switch-geometry-easing': switchTokens.motion.geometry.easing,
};
