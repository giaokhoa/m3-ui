import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import { pxNumber } from '../../internal/tokenValues';

export type ProgressIndicatorStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface ProgressIndicatorStyleOptions {
  color?: CSSProperties['color'];
  trackColor?: CSSProperties['color'];
  isIndeterminate?: boolean;
  wavelength?: number;
  waveSpeed?: number;
}

const shapeRadius = {
  full: token.ShapeFull,
} as const;

type ShapeName = keyof typeof shapeRadius;

export const progressIndicatorTokens = {
  activeColor: token.ComponentProgressIndicatorBaseActiveIndicatorColor,
  activeShape: token.ComponentProgressIndicatorBaseActiveShape as ShapeName,
  stopColor: token.ComponentProgressIndicatorBaseStopColor,
  stopShape: token.ComponentProgressIndicatorBaseStopShape as ShapeName,
  trackColor: token.ComponentProgressIndicatorBaseTrackColor,
  trackShape: token.ComponentProgressIndicatorBaseTrackShape as ShapeName,
  circular: {
    activeThickness: pxNumber(token.ComponentProgressIndicatorCircularActiveThickness),
    waveAmplitude: pxNumber(token.ComponentProgressIndicatorCircularActiveWaveAmplitude),
    waveWavelength: pxNumber(token.ComponentProgressIndicatorCircularActiveWaveWavelength),
    size: pxNumber(token.ComponentProgressIndicatorCircularSize),
    trackActiveSpace: pxNumber(token.ComponentProgressIndicatorCircularTrackActiveSpace),
    trackThickness: pxNumber(token.ComponentProgressIndicatorCircularTrackThickness),
    waveSize: pxNumber(token.ComponentProgressIndicatorCircularWaveSize),
  },
  linear: {
    activeThickness: pxNumber(token.ComponentProgressIndicatorLinearActiveThickness),
    waveAmplitude: pxNumber(token.ComponentProgressIndicatorLinearActiveWaveAmplitude),
    waveWavelength: pxNumber(token.ComponentProgressIndicatorLinearActiveWaveWavelength),
    height: pxNumber(token.ComponentProgressIndicatorLinearHeight),
    indeterminateWaveWavelength: pxNumber(
      token.ComponentProgressIndicatorLinearIndeterminateActiveWaveWavelength,
    ),
    stopSize: pxNumber(token.ComponentProgressIndicatorLinearStopSize),
    stopTrailingSpace: pxNumber(token.ComponentProgressIndicatorLinearStopTrailingSpace),
    trackActiveSpace: pxNumber(token.ComponentProgressIndicatorLinearTrackActiveSpace),
    trackThickness: pxNumber(token.ComponentProgressIndicatorLinearTrackThickness),
    waveHeight: pxNumber(token.ComponentProgressIndicatorLinearWaveHeight),
  },
} as const;

// Runtime renderer constants from the pinned implementation references. They are
// intentionally not canonical DTCG tokens.
export const progressIndicatorRuntime = {
  linearWidth: 240,
  webLinearMinWidth: 80,
  webLinearDeterminateDuration: '250ms',
  webLinearDeterminateEasing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  webCircularDeterminateDuration: '500ms',
  webCircularDeterminateEasing: token.MotionEasingLegacyDecelerate,
  webCircularFourColorDuration: '5332ms',
  webLinearIndeterminateDuration: '2000ms',
  composeLinearIndeterminateDuration: '1750ms',
  composeCircularProgressDuration: '6000ms',
  composeCircularAdditionalRotationDelay: '1500ms',
  composeCircularAdditionalRotationDuration: '300ms',
  composeCircularMinProgress: 0.1,
  composeCircularMaxProgress: 0.87,
} as const;

export const progressIndicatorFourColors = [
  token.ColorRolePrimary,
  token.ColorRolePrimaryContainer,
  token.ColorRoleTertiary,
  token.ColorRoleTertiaryContainer,
] as const;

function waveDuration(wavelength: number, waveSpeed: number): string {
  if (wavelength <= 0 || waveSpeed <= 0) return '0s';
  return `${wavelength / waveSpeed}s`;
}

export function getProgressIndicatorStyle(
  kind: 'linear' | 'circular',
  wavy: boolean,
  options: ProgressIndicatorStyleOptions = {},
): ProgressIndicatorStyle {
  const isIndeterminate = options.isIndeterminate ?? false;
  const defaultWavelength =
    kind === 'linear'
      ? isIndeterminate
        ? progressIndicatorTokens.linear.indeterminateWaveWavelength
        : progressIndicatorTokens.linear.waveWavelength
      : progressIndicatorTokens.circular.waveWavelength;
  const wavelength = options.wavelength ?? defaultWavelength;
  const speed = options.waveSpeed ?? wavelength;

  return {
    '--_progress-active-color':
      options.color ?? progressIndicatorTokens.activeColor,
    '--_progress-track-color':
      options.trackColor ?? progressIndicatorTokens.trackColor,
    '--_progress-stop-color': progressIndicatorTokens.stopColor,
    '--_progress-active-radius': shapeRadius[progressIndicatorTokens.activeShape],
    '--_progress-track-radius': shapeRadius[progressIndicatorTokens.trackShape],
    '--_progress-stop-radius': shapeRadius[progressIndicatorTokens.stopShape],
    '--_progress-linear-width': `${progressIndicatorRuntime.linearWidth}px`,
    '--_progress-linear-min-width': `${progressIndicatorRuntime.webLinearMinWidth}px`,
    '--_progress-linear-height': `${
      wavy
        ? progressIndicatorTokens.linear.waveHeight
        : progressIndicatorTokens.linear.height
    }px`,
    '--_progress-linear-active-thickness': `${progressIndicatorTokens.linear.activeThickness}px`,
    '--_progress-linear-track-thickness': `${progressIndicatorTokens.linear.trackThickness}px`,
    '--_progress-linear-gap': `${progressIndicatorTokens.linear.trackActiveSpace}px`,
    '--_progress-linear-stop-size': `${progressIndicatorTokens.linear.stopSize}px`,
    '--_progress-circular-size': `${
      wavy
        ? progressIndicatorTokens.circular.waveSize
        : progressIndicatorTokens.circular.size
    }px`,
    '--_progress-circular-active-thickness': `${progressIndicatorTokens.circular.activeThickness}px`,
    '--_progress-circular-track-thickness': `${progressIndicatorTokens.circular.trackThickness}px`,
    '--_progress-circular-gap': `${progressIndicatorTokens.circular.trackActiveSpace}px`,
    '--_progress-wave-wavelength': `${wavelength}px`,
    '--_progress-wave-duration': waveDuration(wavelength, speed),
    '--_progress-determinate-duration':
      kind === 'linear'
        ? progressIndicatorRuntime.webLinearDeterminateDuration
        : progressIndicatorRuntime.webCircularDeterminateDuration,
    '--_progress-determinate-easing':
      kind === 'linear'
        ? progressIndicatorRuntime.webLinearDeterminateEasing
        : progressIndicatorRuntime.webCircularDeterminateEasing,
    '--_progress-circular-four-color-duration':
      progressIndicatorRuntime.webCircularFourColorDuration,
    '--_progress-linear-indeterminate-duration':
      progressIndicatorRuntime.webLinearIndeterminateDuration,
    '--_progress-circular-duration':
      progressIndicatorRuntime.composeCircularProgressDuration,
    '--_progress-easing-standard': token.MotionEasingStandard,
    '--_progress-easing-emphasized-accelerate':
      token.MotionEasingEmphasizedAccelerate,
    '--_progress-easing-emphasized-decelerate':
      token.MotionEasingEmphasizedDecelerate,
    '--_progress-four-color-1': progressIndicatorFourColors[0],
    '--_progress-four-color-2': progressIndicatorFourColors[1],
    '--_progress-four-color-3': progressIndicatorFourColors[2],
    '--_progress-four-color-4': progressIndicatorFourColors[3],
  };
}
