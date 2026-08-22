import * as token from '@m3/tokens/generated';
import type { CSSProperties } from 'react';

export type SwitchStyle = CSSProperties & Record<`--${string}`, string | number>;

function px(value: string): number {
  return Number.parseFloat(value);
}

function compositeOverSurface(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${opacity * 100}%, var(--surface))`;
}

const trackWidth = px(token.ComponentSwitchTrackWidth);
const trackHeight = px(token.ComponentSwitchTrackHeight);
const trackOutlineWidth = px(token.ComponentSwitchTrackOutlineWidth);
const uncheckedThumbSize = px(token.ComponentSwitchHandleUnselectedSize);
const checkedThumbSize = px(token.ComponentSwitchHandleSelectedSize);

const uncheckedThumbOffset = (trackHeight - uncheckedThumbSize) / 2;
const contentThumbOffset = (trackHeight - checkedThumbSize) / 2;
const checkedThumbOffset = trackWidth - checkedThumbSize - contentThumbOffset;
const pressedUncheckedThumbOffset = trackOutlineWidth;
const pressedCheckedThumbOffset = checkedThumbOffset - trackOutlineWidth;

export const switchStateLayerRadius = px(token.ComponentSwitchStateLayerSize) / 2;
export const switchTrackFocusRingRadius = `${trackHeight / 2}px`;

export const switchBaseStyle: SwitchStyle = {
  '--_switch-track-width': token.ComponentSwitchTrackWidth,
  '--_switch-track-height': token.ComponentSwitchTrackHeight,
  '--_switch-track-outline-width': token.ComponentSwitchTrackOutlineWidth,
  '--_switch-min-interactive-size': token.ComponentSwitchMinimumInteractiveSize,
  '--_switch-state-layer-size': token.ComponentSwitchStateLayerSize,
  '--_switch-unchecked-thumb-size': token.ComponentSwitchHandleUnselectedSize,
  '--_switch-checked-thumb-size': token.ComponentSwitchHandleSelectedSize,
  '--_switch-pressed-thumb-size': token.ComponentSwitchHandlePressedSize,
  '--_switch-icon-size': token.ComponentSwitchHandleIconSize,
  '--_switch-unchecked-thumb-offset': `${uncheckedThumbOffset}px`,
  '--_switch-content-thumb-offset': `${contentThumbOffset}px`,
  '--_switch-checked-thumb-offset': `${checkedThumbOffset}px`,
  '--_switch-pressed-unchecked-thumb-offset': `${pressedUncheckedThumbOffset}px`,
  '--_switch-pressed-checked-thumb-offset': `${pressedCheckedThumbOffset}px`,
  '--_switch-checked-thumb-color': token.ComponentSwitchColorsCheckedThumb,
  '--_switch-checked-track-color': token.ComponentSwitchColorsCheckedTrack,
  '--_switch-checked-border-color': token.ComponentSwitchColorsCheckedBorder,
  '--_switch-checked-icon-color': token.ComponentSwitchColorsCheckedIcon,
  '--_switch-unchecked-thumb-color': token.ComponentSwitchColorsUncheckedThumb,
  '--_switch-unchecked-track-color': token.ComponentSwitchColorsUncheckedTrack,
  '--_switch-unchecked-border-color': token.ComponentSwitchColorsUncheckedBorder,
  '--_switch-unchecked-icon-color': token.ComponentSwitchColorsUncheckedIcon,
  '--_switch-disabled-checked-thumb-color':
    token.ComponentSwitchColorsDisabledCheckedThumb,
  '--_switch-disabled-checked-track-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledCheckedTrack,
    token.ComponentSwitchDisabledOpacityTrack,
  ),
  '--_switch-disabled-checked-border-color':
    token.ComponentSwitchColorsDisabledCheckedBorder,
  '--_switch-disabled-checked-icon-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledCheckedIcon,
    token.ComponentSwitchDisabledOpacityCheckedIcon,
  ),
  '--_switch-disabled-unchecked-thumb-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledUncheckedThumb,
    token.ComponentSwitchDisabledOpacityUncheckedThumb,
  ),
  '--_switch-disabled-unchecked-track-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledUncheckedTrack,
    token.ComponentSwitchDisabledOpacityTrack,
  ),
  '--_switch-disabled-unchecked-border-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledUncheckedBorder,
    token.ComponentSwitchDisabledOpacityTrack,
  ),
  '--_switch-disabled-unchecked-icon-color': compositeOverSurface(
    token.ComponentSwitchColorsDisabledUncheckedIcon,
    token.ComponentSwitchDisabledOpacityUncheckedIcon,
  ),
  '--_switch-geometry-duration': token.ComponentSwitchMotionGeometryDuration,
  '--_switch-geometry-easing': token.ComponentSwitchMotionGeometryEasing,
};
