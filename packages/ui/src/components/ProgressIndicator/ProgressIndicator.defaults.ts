import * as token from '@m3-ui/tokens';
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

// Numeric canonical geometry stays in TypeScript only where SVG/path arithmetic
// requires live numbers. Paint, shapes and default CSS sizing are generated.
export const progressIndicatorTokens = {
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

// Renderer mechanics from the pinned implementation references. They are
// intentionally not canonical DTCG tokens.
export const progressIndicatorRuntime = {
  linearWidth: 240,
  webLinearMinWidth: 80,
  webLinearDeterminateDuration: '250ms',
  webLinearDeterminateEasing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  webCircularDeterminateDuration: '500ms',
  webCircularFourColorDuration: '5332ms',
  webLinearIndeterminateDuration: '2000ms',
  composeLinearIndeterminateDuration: '1750ms',
  composeCircularProgressDuration: '6000ms',
  composeCircularAdditionalRotationDelay: '1500ms',
  composeCircularAdditionalRotationDuration: '300ms',
  composeCircularMinProgress: 0.1,
  composeCircularMaxProgress: 0.87,
} as const;

function waveDuration(wavelength: number, waveSpeed: number): string {
  if (wavelength <= 0 || waveSpeed <= 0) return '0s';
  return `${wavelength / waveSpeed}s`;
}

export function getProgressIndicatorStyle(
  kind: 'linear' | 'circular',
  _wavy: boolean,
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
  const style: ProgressIndicatorStyle = {
    '--_progress-linear-width': `${progressIndicatorRuntime.linearWidth}px`,
    '--_progress-linear-min-width': `${progressIndicatorRuntime.webLinearMinWidth}px`,
    '--_progress-wave-wavelength': `${wavelength}px`,
    '--_progress-wave-duration': waveDuration(wavelength, speed),
    '--_progress-determinate-duration':
      kind === 'linear'
        ? progressIndicatorRuntime.webLinearDeterminateDuration
        : progressIndicatorRuntime.webCircularDeterminateDuration,
    '--_progress-circular-four-color-duration':
      progressIndicatorRuntime.webCircularFourColorDuration,
    '--_progress-linear-indeterminate-duration':
      progressIndicatorRuntime.webLinearIndeterminateDuration,
    '--_progress-circular-duration':
      progressIndicatorRuntime.composeCircularProgressDuration,
  };

  if (kind === 'linear') {
    style['--_progress-determinate-easing'] =
      progressIndicatorRuntime.webLinearDeterminateEasing;
  }
  if (options.color !== undefined) {
    style['--_progress-active-color'] = options.color;
  }
  if (options.trackColor !== undefined) {
    style['--_progress-track-color'] = options.trackColor;
  }

  return style;
}
