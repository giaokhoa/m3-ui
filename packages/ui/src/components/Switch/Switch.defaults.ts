import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type SwitchStyle = CSSProperties & Record<`--${string}`, string | number>;

function compositeOver(color: string, opacity: number, background: string): string {
  return `color-mix(in srgb, ${color} ${opacity * 100}%, ${background})`;
}

const trackWidth = pxNumber(token.ComponentSwitchTrackWidth);
const trackHeight = pxNumber(token.ComponentSwitchTrackHeight);
const trackOutlineWidth = pxNumber(token.ComponentSwitchTrackOutlineWidth);
const uncheckedThumbSize = pxNumber(token.ComponentSwitchHandleUnselectedSize);
const checkedThumbSize = pxNumber(token.ComponentSwitchHandleSelectedSize);
const uncheckedThumbOffset = (trackHeight - uncheckedThumbSize) / 2;
const contentThumbOffset = (trackHeight - checkedThumbSize) / 2;
const checkedThumbOffset = trackWidth - checkedThumbSize - contentThumbOffset;
const pressedUncheckedThumbOffset = trackOutlineWidth;
const pressedCheckedThumbOffset = checkedThumbOffset - trackOutlineWidth;
const disabledCompositeOver = token.ComponentSwitchDisabledCompositeOver;

export const switchStateLayerRadius = pxNumber(token.ComponentSwitchStateLayerSize) / 2;
export const switchTrackFocusRingRadius = `${trackHeight / 2}px`;

export const switchBaseStyle: SwitchStyle = {
  '--_switch-track-width': token.ComponentSwitchTrackWidth,
  '--_switch-track-height': token.ComponentSwitchTrackHeight,
  '--_switch-track-outline-width': token.ComponentSwitchTrackOutlineWidth,
  '--_switch-min-interactive-size': token.ComponentSwitchMinimumInteractiveSize,
  '--_switch-state-layer-size': token.ComponentSwitchStateLayerSize,
  '--_switch-label-gap': token.ComponentSwitchLabelGap,
  '--_switch-label-color': token.ComponentSwitchLabelColor,
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
  '--_switch-disabled-checked-thumb-color': token.ComponentSwitchColorsDisabledCheckedThumb,
  '--_switch-disabled-checked-track-color': compositeOver(token.ComponentSwitchColorsDisabledCheckedTrack, token.ComponentSwitchDisabledOpacityTrack, disabledCompositeOver),
  '--_switch-disabled-checked-border-color': token.ComponentSwitchColorsDisabledCheckedBorder,
  '--_switch-disabled-checked-icon-color': compositeOver(token.ComponentSwitchColorsDisabledCheckedIcon, token.ComponentSwitchDisabledOpacityCheckedIcon, disabledCompositeOver),
  '--_switch-disabled-unchecked-thumb-color': compositeOver(token.ComponentSwitchColorsDisabledUncheckedThumb, token.ComponentSwitchDisabledOpacityUncheckedThumb, disabledCompositeOver),
  '--_switch-disabled-unchecked-track-color': compositeOver(token.ComponentSwitchColorsDisabledUncheckedTrack, token.ComponentSwitchDisabledOpacityTrack, disabledCompositeOver),
  '--_switch-disabled-unchecked-border-color': compositeOver(token.ComponentSwitchColorsDisabledUncheckedBorder, token.ComponentSwitchDisabledOpacityTrack, disabledCompositeOver),
  '--_switch-disabled-unchecked-icon-color': compositeOver(token.ComponentSwitchColorsDisabledUncheckedIcon, token.ComponentSwitchDisabledOpacityUncheckedIcon, disabledCompositeOver),
  '--_switch-disabled-label-opacity': `${token.StateDisabledContentOpacity * 100}%`,
  '--_switch-geometry-duration': token.ComponentSwitchMotionGeometryDuration,
  '--_switch-geometry-easing': token.ComponentSwitchMotionGeometryEasing,
};
