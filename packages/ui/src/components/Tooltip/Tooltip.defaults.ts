import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type PlainTooltipStyle = CSSProperties &
  Record<`--${string}`, string | number>;
export type RichTooltipStyle = CSSProperties &
  Record<`--${string}`, string | number>;

type TooltipShape = keyof typeof shapeRadius;
type TooltipTypography = keyof typeof typography;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

const shapeRadius = {
  extraSmall: token.ShapeExtraSmall,
  medium: token.ShapeMedium,
} as const;

const typography = {
  bodySmall: {
    fontFamilyRole: token.TypographyBodySmallFontFamily,
    fontSize: token.TypographyBodySmallFontSize,
    lineHeight: token.TypographyBodySmallLineHeight,
    fontWeight: token.TypographyBodySmallFontWeight,
    letterSpacing: token.TypographyBodySmallLetterSpacing,
  },
  bodyMedium: {
    fontFamilyRole: token.TypographyBodyMediumFontFamily,
    fontSize: token.TypographyBodyMediumFontSize,
    lineHeight: token.TypographyBodyMediumLineHeight,
    fontWeight: token.TypographyBodyMediumFontWeight,
    letterSpacing: token.TypographyBodyMediumLetterSpacing,
  },
  labelLarge: {
    fontFamilyRole: token.TypographyLabelLargeFontFamily,
    fontSize: token.TypographyLabelLargeFontSize,
    lineHeight: token.TypographyLabelLargeLineHeight,
    fontWeight: token.TypographyLabelLargeFontWeight,
    letterSpacing: token.TypographyLabelLargeLetterSpacing,
  },
  titleSmall: {
    fontFamilyRole: token.TypographyTitleSmallFontFamily,
    fontSize: token.TypographyTitleSmallFontSize,
    lineHeight: token.TypographyTitleSmallLineHeight,
    fontWeight: token.TypographyTitleSmallFontWeight,
    letterSpacing: token.TypographyTitleSmallLetterSpacing,
  },
} as const;

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

export const plainTooltipTokens = {
  containerColor: token.ComponentTooltipPlainContainerColor,
  containerShape: token.ComponentTooltipPlainContainerShape as TooltipShape,
  supportingTextColor: token.ComponentTooltipPlainSupportingTextColor,
  supportingTextTypography:
    token.ComponentTooltipPlainSupportingTextTypography as TooltipTypography,
} as const;

export const richTooltipTokens = {
  actionFocusLabelTextColor: token.ComponentTooltipRichActionFocusLabelTextColor,
  actionFocusStateLayerColor: token.ComponentTooltipRichActionFocusStateLayerColor,
  actionFocusStateLayerOpacity: token.ComponentTooltipRichActionFocusStateLayerOpacity,
  actionHoverLabelTextColor: token.ComponentTooltipRichActionHoverLabelTextColor,
  actionHoverStateLayerColor: token.ComponentTooltipRichActionHoverStateLayerColor,
  actionHoverStateLayerOpacity: token.ComponentTooltipRichActionHoverStateLayerOpacity,
  actionLabelTextColor: token.ComponentTooltipRichActionLabelTextColor,
  actionLabelTextTypography:
    token.ComponentTooltipRichActionLabelTextTypography as TooltipTypography,
  actionPressedLabelTextColor: token.ComponentTooltipRichActionPressedLabelTextColor,
  actionPressedStateLayerColor: token.ComponentTooltipRichActionPressedStateLayerColor,
  actionPressedStateLayerOpacity: token.ComponentTooltipRichActionPressedStateLayerOpacity,
  containerColor: token.ComponentTooltipRichContainerColor,
  containerElevation: token.ComponentTooltipRichContainerElevation as ElevationLevel,
  containerShadowColor: token.ComponentTooltipRichContainerShadowColor,
  containerShape: token.ComponentTooltipRichContainerShape as TooltipShape,
  subheadColor: token.ComponentTooltipRichSubheadColor,
  subheadTypography: token.ComponentTooltipRichSubheadTypography as TooltipTypography,
  supportingTextColor: token.ComponentTooltipRichSupportingTextColor,
  supportingTextTypography:
    token.ComponentTooltipRichSupportingTextTypography as TooltipTypography,
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

// RichTooltip uses the same Compose TooltipBox size floor, anchor spacing and
// motion engine as PlainTooltip, while its Column renderer owns the richer
// baseline/padding geometry below.
export const richTooltipRuntime = {
  minimumWidth: plainTooltipRuntime.minimumWidth,
  minimumHeight: plainTooltipRuntime.minimumHeight,
  maximumWidth: 320,
  paddingInline: 16,
  titleFirstBaseline: 28,
  textFirstBaseline: 24,
  textBottomPadding: 16,
  actionMinimumHeight: 36,
  actionBottomPadding: 8,
  textOnlyPaddingBlock: plainTooltipRuntime.paddingBlock,
  spacingBetweenTooltipAndAnchor: plainTooltipRuntime.spacingBetweenTooltipAndAnchor,
  hiddenScale: plainTooltipRuntime.hiddenScale,
  motion: plainTooltipRuntime.motion,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function typographyVariables(prefix: string, role: TooltipTypography) {
  const text = typography[role];
  return {
    [`--_${prefix}-font-family`]: typefaceRoleVariable(text.fontFamilyRole),
    [`--_${prefix}-font-size`]: text.fontSize,
    [`--_${prefix}-line-height`]: text.lineHeight,
    [`--_${prefix}-font-weight`]: text.fontWeight,
    [`--_${prefix}-letter-spacing`]: text.letterSpacing,
  } as Record<`--${string}`, string | number>;
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

export function getRichTooltipStyle(
  options: RichTooltipStyleOptions = {},
): RichTooltipStyle {
  const shape = options.shape ?? shapeRadius[richTooltipTokens.containerShape];
  const shadowColor = options.shadowColor ?? richTooltipTokens.containerShadowColor;
  return {
    '--_rich-tooltip-container-color':
      options.containerColor ?? richTooltipTokens.containerColor,
    '--_rich-tooltip-content-color':
      options.contentColor ?? richTooltipTokens.supportingTextColor,
    '--_rich-tooltip-title-color': options.titleColor ?? richTooltipTokens.subheadColor,
    '--_rich-tooltip-action-color':
      options.actionColor ?? richTooltipTokens.actionLabelTextColor,
    '--_rich-tooltip-radius': cssLength(shape as CssLength),
    '--_rich-tooltip-box-shadow': getElevationBoxShadow(
      richTooltipTokens.containerElevation,
      shadowColor as string,
    ),
    '--_rich-tooltip-min-width': `${richTooltipRuntime.minimumWidth}px`,
    '--_rich-tooltip-min-height': `${richTooltipRuntime.minimumHeight}px`,
    '--_rich-tooltip-max-width': cssLength(
      (options.maxWidth ?? richTooltipRuntime.maximumWidth) as CssLength,
    ),
    '--_rich-tooltip-padding-inline': `${richTooltipRuntime.paddingInline}px`,
    '--_rich-tooltip-title-first-baseline': `${richTooltipRuntime.titleFirstBaseline}px`,
    '--_rich-tooltip-text-first-baseline': `${richTooltipRuntime.textFirstBaseline}px`,
    '--_rich-tooltip-text-bottom-padding': `${richTooltipRuntime.textBottomPadding}px`,
    '--_rich-tooltip-action-min-height': `${richTooltipRuntime.actionMinimumHeight}px`,
    '--_rich-tooltip-action-bottom-padding': `${richTooltipRuntime.actionBottomPadding}px`,
    '--_rich-tooltip-text-only-padding-block': `${richTooltipRuntime.textOnlyPaddingBlock}px`,
    '--_rich-tooltip-hidden-scale': richTooltipRuntime.hiddenScale,
    '--_rich-tooltip-scale-duration': richTooltipRuntime.motion.scale.duration,
    '--_rich-tooltip-scale-easing': richTooltipRuntime.motion.scale.easing,
    '--_rich-tooltip-opacity-duration': richTooltipRuntime.motion.opacity.duration,
    '--_rich-tooltip-opacity-easing': richTooltipRuntime.motion.opacity.easing,
    '--_rich-tooltip-action-focus-label-color': richTooltipTokens.actionFocusLabelTextColor,
    '--_rich-tooltip-action-hover-label-color': richTooltipTokens.actionHoverLabelTextColor,
    '--_rich-tooltip-action-pressed-label-color': richTooltipTokens.actionPressedLabelTextColor,
    '--_rich-tooltip-action-focus-state-layer-color': richTooltipTokens.actionFocusStateLayerColor,
    '--_rich-tooltip-action-focus-state-layer-opacity': richTooltipTokens.actionFocusStateLayerOpacity,
    '--_rich-tooltip-action-hover-state-layer-color': richTooltipTokens.actionHoverStateLayerColor,
    '--_rich-tooltip-action-hover-state-layer-opacity': richTooltipTokens.actionHoverStateLayerOpacity,
    '--_rich-tooltip-action-pressed-state-layer-color': richTooltipTokens.actionPressedStateLayerColor,
    '--_rich-tooltip-action-pressed-state-layer-opacity': richTooltipTokens.actionPressedStateLayerOpacity,
    ...typographyVariables('rich-tooltip-title', richTooltipTokens.subheadTypography),
    ...typographyVariables('rich-tooltip-text', richTooltipTokens.supportingTextTypography),
    ...typographyVariables('rich-tooltip-action', richTooltipTokens.actionLabelTextTypography),
  };
}
