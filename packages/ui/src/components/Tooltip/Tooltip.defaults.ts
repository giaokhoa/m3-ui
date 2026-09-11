import '@m3-ui/tokens/tooltip.css';
import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import type { ElevationLevel } from '../../internal/elevation';

export type PlainTooltipStyle = CSSProperties & Record<`--${string}`, string | number>;
export type RichTooltipStyle = CSSProperties & Record<`--${string}`, string | number>;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

export interface PlainTooltipStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  maxWidth?: CSSProperties['maxWidth'];
}

export interface RichTooltipStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  titleColor?: CSSProperties['color'];
  actionColor?: CSSProperties['color'];
  shadowColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  maxWidth?: CSSProperties['maxWidth'];
}

type RichTooltipSurfaceStyleOptions = Omit<RichTooltipStyleOptions, 'shadowColor'>;

// These values feed the runtime Elevation primitive; all visual CSS defaults are generated.
export const richTooltipTokens = {
  containerElevation: token.ComponentTooltipRichContainerElevation as ElevationLevel,
  containerShadowColor: token.ComponentTooltipRichContainerShadowColor,
} as const;

// RAC placement requires a numeric runtime offset.
export const plainTooltipRuntime = { spacingBetweenTooltipAndAnchor: 4 } as const;
export const richTooltipRuntime = { spacingBetweenTooltipAndAnchor: 4 } as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function getPlainTooltipStyle(options: PlainTooltipStyleOptions = {}): PlainTooltipStyle {
  return {
    ...(options.containerColor === undefined ? {} : { '--_plain-tooltip-container-color': options.containerColor }),
    ...(options.contentColor === undefined ? {} : { '--_plain-tooltip-content-color': options.contentColor }),
    ...(options.shape === undefined ? {} : { '--_plain-tooltip-radius': cssLength(options.shape as CssLength) }),
    ...(options.maxWidth === undefined ? {} : { '--_plain-tooltip-max-width': cssLength(options.maxWidth as CssLength) }),
  };
}

export function getRichTooltipStyle(options: RichTooltipSurfaceStyleOptions = {}): RichTooltipStyle {
  const style: RichTooltipStyle = {};
  if (options.containerColor !== undefined) style['--_rich-tooltip-container-color'] = options.containerColor;
  if (options.contentColor !== undefined) style['--_rich-tooltip-content-color'] = options.contentColor;
  if (options.titleColor !== undefined) style['--_rich-tooltip-title-color'] = options.titleColor;
  if (options.actionColor !== undefined) {
    style['--_rich-tooltip-action-color'] = options.actionColor;
    style['--_rich-tooltip-action-focus-label-color'] = options.actionColor;
    style['--_rich-tooltip-action-hover-label-color'] = options.actionColor;
    style['--_rich-tooltip-action-pressed-label-color'] = options.actionColor;
    style['--_rich-tooltip-action-focus-state-layer-color'] = options.actionColor;
    style['--_rich-tooltip-action-hover-state-layer-color'] = options.actionColor;
    style['--_rich-tooltip-action-pressed-state-layer-color'] = options.actionColor;
  }
  if (options.shape !== undefined) style['--_rich-tooltip-radius'] = cssLength(options.shape as CssLength);
  if (options.maxWidth !== undefined) style['--_rich-tooltip-max-width'] = cssLength(options.maxWidth as CssLength);
  return style;
}
