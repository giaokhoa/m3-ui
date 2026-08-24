import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';
import type { SliderSize } from './Slider.types';

export type SliderStyle = CSSProperties & Record<`--${string}`, string | number>;

interface SliderSizeTokens {
  readonly handleLength: number;
  readonly activeTrackThickness: number;
  readonly inactiveTrackThickness: number;
  readonly activeOuterRadius: number;
  readonly inactiveOuterRadius: number;
  readonly iconSize?: number;
  readonly iconPadding?: number;
}

export const sliderSizeTokens: Record<SliderSize, SliderSizeTokens> = {
  xSmall: {
    handleLength: pxNumber(token.ComponentSliderSizeXSmallActiveHandleHeight),
    activeTrackThickness: pxNumber(token.ComponentSliderSizeXSmallActiveTrackHeight),
    inactiveTrackThickness: pxNumber(token.ComponentSliderSizeXSmallInactiveTrackHeight),
    activeOuterRadius: pxNumber(token.ComponentSliderSizeXSmallActiveTrackShapeLeading),
    inactiveOuterRadius: pxNumber(token.ComponentSliderSizeXSmallInactiveTrackShapeTrailing),
  },
  small: {
    handleLength: pxNumber(token.ComponentSliderSizeSmallActiveHandleHeight),
    activeTrackThickness: pxNumber(token.ComponentSliderSizeSmallActiveTrackHeight),
    inactiveTrackThickness: pxNumber(token.ComponentSliderSizeSmallInactiveTrackHeight),
    activeOuterRadius: pxNumber(token.ComponentSliderSizeSmallActiveTrackShapeLeading),
    inactiveOuterRadius: pxNumber(token.ComponentSliderSizeSmallInactiveTrackShapeTrailing),
  },
  medium: {
    handleLength: pxNumber(token.ComponentSliderSizeMediumActiveHandleHeight),
    activeTrackThickness: pxNumber(token.ComponentSliderSizeMediumActiveTrackHeight),
    inactiveTrackThickness: pxNumber(token.ComponentSliderSizeMediumInactiveTrackHeight),
    activeOuterRadius: pxNumber(token.ComponentSliderSizeMediumActiveTrackShapeLeading),
    inactiveOuterRadius: pxNumber(token.ComponentSliderSizeMediumInactiveTrackShapeTrailing),
    iconSize: pxNumber(token.ComponentSliderSizeMediumIconSize),
    iconPadding: pxNumber(token.ComponentSliderSizeMediumIconPadding),
  },
  large: {
    handleLength: pxNumber(token.ComponentSliderSizeLargeActiveHandleHeight),
    activeTrackThickness: pxNumber(token.ComponentSliderSizeLargeActiveTrackHeight),
    inactiveTrackThickness: pxNumber(token.ComponentSliderSizeLargeInactiveTrackHeight),
    activeOuterRadius: pxNumber(token.ComponentSliderSizeLargeActiveTrackShapeLeading),
    inactiveOuterRadius: pxNumber(token.ComponentSliderSizeLargeInactiveTrackShapeTrailing),
    iconSize: pxNumber(token.ComponentSliderSizeLargeIconSize),
    iconPadding: pxNumber(token.ComponentSliderSizeLargeIconPadding),
  },
  xLarge: {
    handleLength: pxNumber(token.ComponentSliderSizeXLargeActiveHandleHeight),
    activeTrackThickness: pxNumber(token.ComponentSliderSizeXLargeActiveTrackHeight),
    inactiveTrackThickness: pxNumber(token.ComponentSliderSizeXLargeInactiveTrackHeight),
    activeOuterRadius: pxNumber(token.ComponentSliderSizeXLargeActiveTrackShapeLeading),
    inactiveOuterRadius: pxNumber(token.ComponentSliderSizeXLargeInactiveTrackShapeTrailing),
    iconSize: pxNumber(token.ComponentSliderSizeXLargeIconSize),
    iconPadding: pxNumber(token.ComponentSliderSizeXLargeIconPadding),
  },
};

export const sliderTokens = {
  handleWidth: pxNumber(token.ComponentSliderHandleWidth),
  hoverHandleWidth: pxNumber(token.ComponentSliderHoverHandleWidth),
  focusHandleWidth: pxNumber(token.ComponentSliderFocusHandleWidth),
  pressedHandleWidth: pxNumber(token.ComponentSliderPressedHandleWidth),
  disabledHandleWidth: pxNumber(token.ComponentSliderDisabledHandleWidth),
  handleColor: token.ComponentSliderHandleColor,
  activeTrackColor: token.ComponentSliderActiveTrackColor,
  inactiveTrackColor: token.ComponentSliderInactiveTrackColor,
  disabledHandleColor: token.ComponentSliderDisabledHandleColor,
  disabledHandleOpacity: token.ComponentSliderDisabledHandleOpacity,
  disabledActiveTrackColor: token.ComponentSliderDisabledActiveTrackColor,
  disabledActiveTrackOpacity: token.ComponentSliderDisabledActiveTrackOpacity,
  disabledInactiveTrackColor: token.ComponentSliderDisabledInactiveTrackColor,
  disabledInactiveTrackOpacity: token.ComponentSliderDisabledInactiveTrackOpacity,
  stopSize: pxNumber(token.ComponentSliderStopIndicatorSize),
  stopColor: token.ComponentSliderWebCurrentStopIndicatorColor,
  selectedStopColor: token.ComponentSliderWebCurrentStopIndicatorColorSelected,
  disabledActiveStopColor: token.ComponentSliderWebCurrentDisabledActiveStopIndicatorContainerColor,
  disabledInactiveStopColor: token.ComponentSliderWebCurrentDisabledInactiveStopIndicatorContainerColor,
  stopTrailingSpace: pxNumber(token.ComponentSliderWebCurrentStopIndicatorTrailingSpace),
  valueIndicatorBottomSpace: pxNumber(token.ComponentSliderValueIndicatorActiveBottomSpace),
  valueIndicatorContainerColor: token.ComponentSliderValueIndicatorContainerColor,
  valueIndicatorLabelColor: token.ComponentSliderValueIndicatorLabelTextColor,
  valueIndicatorTypography: {
    fontFamily: token.TypographyLabelLargeFontFamily,
    fontSize: token.TypographyLabelLargeFontSize,
    lineHeight: token.TypographyLabelLargeLineHeight,
    // Current Material Web 34.0.21 intentionally mixes BodyLarge weight/tracking here.
    fontWeight: token.ComponentSliderWebCurrentValueIndicatorLabelTextWeight,
    letterSpacing: token.ComponentSliderWebCurrentValueIndicatorLabelTextTracking,
  },
} as const;

// Source-level renderer mechanics, not additional design tokens.
export const sliderRuntime = {
  minimumInteractiveTarget: 48,
  webMinimumInlineSize: 200,
  trackInnerRadius: 2,
  baselineTrackGap: pxNumber(token.ComponentSliderActiveHandleLeadingSpace),
} as const;

export function getSliderStyle(size: SliderSize = 'xSmall'): SliderStyle {
  const sizeTokens = sliderSizeTokens[size];
  return {
    '--_slider-handle-length': `${sizeTokens.handleLength}px`,
    '--_slider-handle-width': `${sliderTokens.handleWidth}px`,
    '--_slider-hover-handle-width': `${sliderTokens.hoverHandleWidth}px`,
    '--_slider-focus-handle-width': `${sliderTokens.focusHandleWidth}px`,
    '--_slider-pressed-handle-width': `${sliderTokens.pressedHandleWidth}px`,
    '--_slider-disabled-handle-width': `${sliderTokens.disabledHandleWidth}px`,
    '--_slider-active-track-thickness': `${sizeTokens.activeTrackThickness}px`,
    '--_slider-inactive-track-thickness': `${sizeTokens.inactiveTrackThickness}px`,
    '--_slider-active-outer-radius': `${sizeTokens.activeOuterRadius}px`,
    '--_slider-inactive-outer-radius': `${sizeTokens.inactiveOuterRadius}px`,
    '--_slider-inner-radius': `${sliderRuntime.trackInnerRadius}px`,
    '--_slider-track-gap': `${sliderRuntime.baselineTrackGap}px`,
    '--_slider-min-target': `${sliderRuntime.minimumInteractiveTarget}px`,
    '--_slider-min-inline-size': `${sliderRuntime.webMinimumInlineSize}px`,
    '--_slider-handle-color': sliderTokens.handleColor,
    '--_slider-active-track-color': sliderTokens.activeTrackColor,
    '--_slider-inactive-track-color': sliderTokens.inactiveTrackColor,
    '--_slider-disabled-handle-color': sliderTokens.disabledHandleColor,
    '--_slider-disabled-handle-opacity': sliderTokens.disabledHandleOpacity,
    '--_slider-disabled-active-track-color': sliderTokens.disabledActiveTrackColor,
    '--_slider-disabled-active-track-opacity': sliderTokens.disabledActiveTrackOpacity,
    '--_slider-disabled-inactive-track-color': sliderTokens.disabledInactiveTrackColor,
    '--_slider-disabled-inactive-track-opacity': sliderTokens.disabledInactiveTrackOpacity,
    '--_slider-stop-size': `${sliderTokens.stopSize}px`,
    '--_slider-stop-trailing-space': `${sliderTokens.stopTrailingSpace}px`,
    '--_slider-stop-color': sliderTokens.stopColor,
    '--_slider-selected-stop-color': sliderTokens.selectedStopColor,
    '--_slider-disabled-active-stop-color': sliderTokens.disabledActiveStopColor,
    '--_slider-disabled-inactive-stop-color': sliderTokens.disabledInactiveStopColor,
    '--_slider-value-indicator-bottom-space': `${sliderTokens.valueIndicatorBottomSpace}px`,
    '--_slider-value-indicator-container-color': sliderTokens.valueIndicatorContainerColor,
    '--_slider-value-indicator-label-color': sliderTokens.valueIndicatorLabelColor,
    '--_slider-value-indicator-font-family': sliderTokens.valueIndicatorTypography.fontFamily,
    '--_slider-value-indicator-font-size': sliderTokens.valueIndicatorTypography.fontSize,
    '--_slider-value-indicator-line-height': sliderTokens.valueIndicatorTypography.lineHeight,
    '--_slider-value-indicator-font-weight': sliderTokens.valueIndicatorTypography.fontWeight,
    '--_slider-value-indicator-letter-spacing': sliderTokens.valueIndicatorTypography.letterSpacing,
  };
}
