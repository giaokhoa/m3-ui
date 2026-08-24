import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';

export type PlainTooltipStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type PlainTooltipShape = keyof typeof shapeRadius;
type PlainTooltipTypography = keyof typeof typography;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

const shapeRadius = {
  extraSmall: token.ShapeExtraSmall,
} as const;

const typography = {
  bodySmall: {
    fontFamilyRole: token.TypographyBodySmallFontFamily,
    fontSize: token.TypographyBodySmallFontSize,
    lineHeight: token.TypographyBodySmallLineHeight,
    fontWeight: token.TypographyBodySmallFontWeight,
    letterSpacing: token.TypographyBodySmallLetterSpacing,
  },
} as const;

export interface PlainTooltipStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  maxWidth?: CSSProperties['maxWidth'];
}

export const plainTooltipTokens = {
  containerColor: token.ComponentTooltipPlainContainerColor,
  containerShape: token.ComponentTooltipPlainContainerShape as PlainTooltipShape,
  supportingTextColor: token.ComponentTooltipPlainSupportingTextColor,
  supportingTextTypography:
    token.ComponentTooltipPlainSupportingTextTypography as PlainTooltipTypography,
} as const;

// AndroidX Tooltip.kt owns these layout and transition mechanics rather than
// PlainTooltipTokens.kt. Keep them beside the renderer instead of promoting
// implementation constants into the canonical DTCG component token graph.
export const plainTooltipRuntime = {
  minimumWidth: 40,
  minimumHeight: 24,
  maximumWidth: 200,
  paddingInline: 8,
  paddingBlock: 4,
  spacingBetweenTooltipAndAnchor: 4,
  hiddenScale: 0.8,
  motion: {
    scale: {
      duration: token.MotionSpringFastSpatialDuration,
      easing: token.MotionSpringFastSpatialEasing,
    },
    opacity: {
      duration: token.MotionSpringFastEffectsDuration,
      easing: token.MotionSpringFastEffectsEasing,
    },
  },
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

export function getPlainTooltipStyle(
  options: PlainTooltipStyleOptions = {},
): PlainTooltipStyle {
  const text = typography[plainTooltipTokens.supportingTextTypography];
  const shape = options.shape ?? shapeRadius[plainTooltipTokens.containerShape];
  return {
    '--_plain-tooltip-container-color':
      options.containerColor ?? plainTooltipTokens.containerColor,
    '--_plain-tooltip-content-color':
      options.contentColor ?? plainTooltipTokens.supportingTextColor,
    '--_plain-tooltip-radius': cssLength(shape as CssLength),
    '--_plain-tooltip-min-width': `${plainTooltipRuntime.minimumWidth}px`,
    '--_plain-tooltip-min-height': `${plainTooltipRuntime.minimumHeight}px`,
    '--_plain-tooltip-max-width': cssLength(
      (options.maxWidth ?? plainTooltipRuntime.maximumWidth) as CssLength,
    ),
    '--_plain-tooltip-padding-inline': `${plainTooltipRuntime.paddingInline}px`,
    '--_plain-tooltip-padding-block': `${plainTooltipRuntime.paddingBlock}px`,
    '--_plain-tooltip-font-family': typefaceRoleVariable(text.fontFamilyRole),
    '--_plain-tooltip-font-size': text.fontSize,
    '--_plain-tooltip-line-height': text.lineHeight,
    '--_plain-tooltip-font-weight': text.fontWeight,
    '--_plain-tooltip-letter-spacing': text.letterSpacing,
    '--_plain-tooltip-hidden-scale': plainTooltipRuntime.hiddenScale,
    '--_plain-tooltip-scale-duration': plainTooltipRuntime.motion.scale.duration,
    '--_plain-tooltip-scale-easing': plainTooltipRuntime.motion.scale.easing,
    '--_plain-tooltip-opacity-duration': plainTooltipRuntime.motion.opacity.duration,
    '--_plain-tooltip-opacity-easing': plainTooltipRuntime.motion.opacity.easing,
  };
}
