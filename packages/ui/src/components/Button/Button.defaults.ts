import type { ButtonSize, ButtonVariant } from '@m3/tokens/button';
import {
  elevationMotionTokens,
  type ElevationLevel,
} from '@m3/tokens/elevation';
import * as token from '@m3/tokens/generated';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow } from '../../internal/elevation';
import type { ButtonInteraction } from './Button.interactions';

export type ButtonStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ButtonShapeValue = string | number;

export interface ButtonShapes {
  readonly shape: ButtonShapeValue;
  readonly pressedShape: ButtonShapeValue;
}

export interface ButtonInteractionState {
  readonly isDisabled: boolean;
  readonly interaction: ButtonInteraction | null;
  readonly previousInteraction?: ButtonInteraction | null;
}

export interface ButtonStyleOptions {
  readonly size?: ButtonSize;
  readonly shapes?: ButtonShapes;
}

interface ButtonPaddingTokens {
  readonly block: string;
  readonly inlineStart: string;
  readonly inlineEnd: string;
}

interface TypographyStyleTokens {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

interface ButtonVariantTokens {
  readonly minWidth: string;
  readonly minHeight: string;
  readonly contentPadding: ButtonPaddingTokens;
  readonly iconContentPadding: ButtonPaddingTokens;
  readonly containerShape: keyof typeof shapeRadius;
  readonly containerColor: string;
  readonly contentColor: string;
  readonly disabledContainerColor: string;
  readonly disabledContainerOpacity: number;
  readonly disabledContentColor: string;
  readonly disabledContentOpacity: number;
  readonly outlineColor: string;
  readonly outlineWidth: string;
  readonly disabledOutlineOpacity: number;
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly iconSize: string;
  readonly iconSpacing: string;
  readonly labelTypography: TypographyStyleTokens;
}

interface ButtonSizeTokens {
  readonly minHeight: string;
  readonly contentPadding: ButtonPaddingTokens;
  readonly iconContentPadding: ButtonPaddingTokens;
  readonly iconSize: string;
  readonly iconSpacing: string;
  readonly typography: TypographyStyleTokens;
  readonly pressedShape: ButtonPressedShape;
}

const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ButtonPressedShape = keyof typeof shapeRadius;
type TypographyRole = keyof typeof typography;

const typography = {
  labelLarge: {
    fontFamily: token.TypographyLabelLargeFontFamily,
    fontSize: token.TypographyLabelLargeFontSize,
    lineHeight: token.TypographyLabelLargeLineHeight,
    fontWeight: token.TypographyLabelLargeFontWeight,
    letterSpacing: token.TypographyLabelLargeLetterSpacing,
  },
  titleMedium: {
    fontFamily: token.TypographyTitleMediumFontFamily,
    fontSize: token.TypographyTitleMediumFontSize,
    lineHeight: token.TypographyTitleMediumLineHeight,
    fontWeight: token.TypographyTitleMediumFontWeight,
    letterSpacing: token.TypographyTitleMediumLetterSpacing,
  },
  headlineSmall: {
    fontFamily: token.TypographyHeadlineSmallFontFamily,
    fontSize: token.TypographyHeadlineSmallFontSize,
    lineHeight: token.TypographyHeadlineSmallLineHeight,
    fontWeight: token.TypographyHeadlineSmallFontWeight,
    letterSpacing: token.TypographyHeadlineSmallLetterSpacing,
  },
  headlineLarge: {
    fontFamily: token.TypographyHeadlineLargeFontFamily,
    fontSize: token.TypographyHeadlineLargeFontSize,
    lineHeight: token.TypographyHeadlineLargeLineHeight,
    fontWeight: token.TypographyHeadlineLargeFontWeight,
    letterSpacing: token.TypographyHeadlineLargeLetterSpacing,
  },
} as const satisfies Record<string, TypographyStyleTokens>;

const commonButtonTokens = {
  minWidth: token.ComponentButtonBaselineMinWidth,
  minHeight: token.ComponentButtonBaselineMinHeight,
  containerShape: token.ComponentButtonBaselineContainerShape,
  disabledContainerOpacity: token.ComponentButtonBaselineDisabledContainerOpacity,
  disabledContentOpacity: token.ComponentButtonBaselineDisabledContentOpacity,
  outlineColor: token.ComponentButtonBaselineOutlineColor,
  outlineWidth: token.ComponentButtonBaselineOutlineWidth,
  disabledOutlineOpacity: token.ComponentButtonBaselineDisabledOutlineOpacity,
  iconSize: token.ComponentButtonBaselineIconSize,
  iconSpacing: token.ComponentButtonBaselineIconSpacing,
  labelTypography:
    typography[token.ComponentButtonBaselineLabelTypography as TypographyRole],
} as const;

const standardContentPadding = {
  block: token.ComponentButtonBaselinePaddingBlock,
  inlineStart: token.ComponentButtonBaselinePaddingInlineStart,
  inlineEnd: token.ComponentButtonBaselinePaddingInlineEnd,
} as const;

const standardIconContentPadding = {
  block: token.ComponentButtonBaselineIconPaddingBlock,
  inlineStart: token.ComponentButtonBaselineIconPaddingInlineStart,
  inlineEnd: token.ComponentButtonBaselineIconPaddingInlineEnd,
} as const;

export const filledButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: token.ComponentButtonVariantFilledContainerColor,
  contentColor: token.ComponentButtonVariantFilledContentColor,
  disabledContainerColor: token.ComponentButtonVariantFilledDisabledContainerColor,
  disabledContentColor: token.ComponentButtonVariantFilledDisabledContentColor,
  defaultElevation: token.ComponentButtonVariantFilledDefaultElevation,
  hoveredElevation: token.ComponentButtonVariantFilledHoveredElevation,
  focusedElevation: token.ComponentButtonVariantFilledFocusedElevation,
  pressedElevation: token.ComponentButtonVariantFilledPressedElevation,
  disabledElevation: token.ComponentButtonVariantFilledDisabledElevation,
} as const satisfies ButtonVariantTokens;

export const elevatedButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: token.ComponentButtonVariantElevatedContainerColor,
  contentColor: token.ComponentButtonVariantElevatedContentColor,
  disabledContainerColor: token.ComponentButtonVariantElevatedDisabledContainerColor,
  disabledContentColor: token.ComponentButtonVariantElevatedDisabledContentColor,
  defaultElevation: token.ComponentButtonVariantElevatedDefaultElevation,
  hoveredElevation: token.ComponentButtonVariantElevatedHoveredElevation,
  focusedElevation: token.ComponentButtonVariantElevatedFocusedElevation,
  pressedElevation: token.ComponentButtonVariantElevatedPressedElevation,
  disabledElevation: token.ComponentButtonVariantElevatedDisabledElevation,
} as const satisfies ButtonVariantTokens;

export const filledTonalButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: token.ComponentButtonVariantFilledTonalContainerColor,
  contentColor: token.ComponentButtonVariantFilledTonalContentColor,
  disabledContainerColor:
    token.ComponentButtonVariantFilledTonalDisabledContainerColor,
  disabledContentColor: token.ComponentButtonVariantFilledTonalDisabledContentColor,
  defaultElevation: token.ComponentButtonVariantFilledTonalDefaultElevation,
  hoveredElevation: token.ComponentButtonVariantFilledTonalHoveredElevation,
  focusedElevation: token.ComponentButtonVariantFilledTonalFocusedElevation,
  pressedElevation: token.ComponentButtonVariantFilledTonalPressedElevation,
  disabledElevation: token.ComponentButtonVariantFilledTonalDisabledElevation,
} as const satisfies ButtonVariantTokens;

export const outlinedButtonTokens = {
  ...commonButtonTokens,
  contentPadding: standardContentPadding,
  iconContentPadding: standardIconContentPadding,
  containerColor: token.ComponentButtonVariantOutlinedContainerColor,
  contentColor: token.ComponentButtonVariantOutlinedContentColor,
  disabledContainerColor: token.ComponentButtonVariantOutlinedDisabledContainerColor,
  disabledContentColor: token.ComponentButtonVariantOutlinedDisabledContentColor,
  outlineColor: token.ComponentButtonVariantOutlinedOutlineColor,
  outlineWidth: token.ComponentButtonVariantOutlinedOutlineWidth,
  disabledOutlineOpacity: token.ComponentButtonVariantOutlinedDisabledOutlineOpacity,
  defaultElevation: token.ComponentButtonVariantOutlinedDefaultElevation,
  hoveredElevation: token.ComponentButtonVariantOutlinedHoveredElevation,
  focusedElevation: token.ComponentButtonVariantOutlinedFocusedElevation,
  pressedElevation: token.ComponentButtonVariantOutlinedPressedElevation,
  disabledElevation: token.ComponentButtonVariantOutlinedDisabledElevation,
} as const satisfies ButtonVariantTokens;

export const textButtonTokens = {
  ...commonButtonTokens,
  contentPadding: {
    block: token.ComponentButtonVariantTextPaddingBlock,
    inlineStart: token.ComponentButtonVariantTextPaddingInlineStart,
    inlineEnd: token.ComponentButtonVariantTextPaddingInlineEnd,
  },
  iconContentPadding: {
    block: token.ComponentButtonVariantTextIconPaddingBlock,
    inlineStart: token.ComponentButtonVariantTextIconPaddingInlineStart,
    inlineEnd: token.ComponentButtonVariantTextIconPaddingInlineEnd,
  },
  containerColor: token.ComponentButtonVariantTextContainerColor,
  contentColor: token.ComponentButtonVariantTextContentColor,
  disabledContainerColor: token.ComponentButtonVariantTextDisabledContainerColor,
  disabledContentColor: token.ComponentButtonVariantTextDisabledContentColor,
  defaultElevation: token.ComponentButtonVariantTextDefaultElevation,
  hoveredElevation: token.ComponentButtonVariantTextHoveredElevation,
  focusedElevation: token.ComponentButtonVariantTextFocusedElevation,
  pressedElevation: token.ComponentButtonVariantTextPressedElevation,
  disabledElevation: token.ComponentButtonVariantTextDisabledElevation,
} as const satisfies ButtonVariantTokens;

export const buttonVariantTokens = {
  filled: filledButtonTokens,
  elevated: elevatedButtonTokens,
  filledTonal: filledTonalButtonTokens,
  outlined: outlinedButtonTokens,
  text: textButtonTokens,
} as const satisfies Record<ButtonVariant, ButtonVariantTokens>;

function sizeTokens(
  minHeight: string,
  contentPadding: ButtonPaddingTokens,
  iconContentPadding: ButtonPaddingTokens,
  iconSize: string,
  iconSpacing: string,
  typographyRole: TypographyRole,
  pressedShape: ButtonPressedShape,
): ButtonSizeTokens {
  return {
    minHeight,
    contentPadding,
    iconContentPadding,
    iconSize,
    iconSpacing,
    typography: typography[typographyRole],
    pressedShape,
  };
}

export const buttonSizeTokens = {
  extraSmall: sizeTokens(
    token.ComponentButtonSizeExtraSmallHeight,
    {
      block: token.ComponentButtonSizeExtraSmallPaddingBlock,
      inlineStart: token.ComponentButtonSizeExtraSmallPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeExtraSmallPaddingInlineEnd,
    },
    {
      block: token.ComponentButtonSizeExtraSmallIconPaddingBlock,
      inlineStart: token.ComponentButtonSizeExtraSmallIconPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeExtraSmallIconPaddingInlineEnd,
    },
    token.ComponentButtonSizeExtraSmallIconSize,
    token.ComponentButtonSizeExtraSmallIconSpacing,
    token.ComponentButtonSizeExtraSmallTypography as TypographyRole,
    token.ComponentButtonSizeExtraSmallPressedShape as ButtonPressedShape,
  ),
  small: sizeTokens(
    token.ComponentButtonSizeSmallHeight,
    {
      block: token.ComponentButtonSizeSmallPaddingBlock,
      inlineStart: token.ComponentButtonSizeSmallPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeSmallPaddingInlineEnd,
    },
    {
      block: token.ComponentButtonSizeSmallIconPaddingBlock,
      inlineStart: token.ComponentButtonSizeSmallIconPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeSmallIconPaddingInlineEnd,
    },
    token.ComponentButtonSizeSmallIconSize,
    token.ComponentButtonSizeSmallIconSpacing,
    token.ComponentButtonSizeSmallTypography as TypographyRole,
    token.ComponentButtonSizeSmallPressedShape as ButtonPressedShape,
  ),
  medium: sizeTokens(
    token.ComponentButtonSizeMediumHeight,
    {
      block: token.ComponentButtonSizeMediumPaddingBlock,
      inlineStart: token.ComponentButtonSizeMediumPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeMediumPaddingInlineEnd,
    },
    {
      block: token.ComponentButtonSizeMediumIconPaddingBlock,
      inlineStart: token.ComponentButtonSizeMediumIconPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeMediumIconPaddingInlineEnd,
    },
    token.ComponentButtonSizeMediumIconSize,
    token.ComponentButtonSizeMediumIconSpacing,
    token.ComponentButtonSizeMediumTypography as TypographyRole,
    token.ComponentButtonSizeMediumPressedShape as ButtonPressedShape,
  ),
  large: sizeTokens(
    token.ComponentButtonSizeLargeHeight,
    {
      block: token.ComponentButtonSizeLargePaddingBlock,
      inlineStart: token.ComponentButtonSizeLargePaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeLargePaddingInlineEnd,
    },
    {
      block: token.ComponentButtonSizeLargeIconPaddingBlock,
      inlineStart: token.ComponentButtonSizeLargeIconPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeLargeIconPaddingInlineEnd,
    },
    token.ComponentButtonSizeLargeIconSize,
    token.ComponentButtonSizeLargeIconSpacing,
    token.ComponentButtonSizeLargeTypography as TypographyRole,
    token.ComponentButtonSizeLargePressedShape as ButtonPressedShape,
  ),
  extraLarge: sizeTokens(
    token.ComponentButtonSizeExtraLargeHeight,
    {
      block: token.ComponentButtonSizeExtraLargePaddingBlock,
      inlineStart: token.ComponentButtonSizeExtraLargePaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeExtraLargePaddingInlineEnd,
    },
    {
      block: token.ComponentButtonSizeExtraLargeIconPaddingBlock,
      inlineStart: token.ComponentButtonSizeExtraLargeIconPaddingInlineStart,
      inlineEnd: token.ComponentButtonSizeExtraLargeIconPaddingInlineEnd,
    },
    token.ComponentButtonSizeExtraLargeIconSize,
    token.ComponentButtonSizeExtraLargeIconSpacing,
    token.ComponentButtonSizeExtraLargeTypography as TypographyRole,
    token.ComponentButtonSizeExtraLargePressedShape as ButtonPressedShape,
  ),
} as const satisfies Record<ButtonSize, ButtonSizeTokens>;

// AndroidX animates ButtonShapes with MotionSchemeKeyTokens.DefaultEffects.
const buttonShapeTransition =
  `border-radius ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`;

function percent(value: number): string {
  return `${value * 100}%`;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function normalizeShapeValue(value: ButtonShapeValue): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

export function buttonShapesForSize(size: ButtonSize): ButtonShapes {
  return {
    shape: shapeRadius[commonButtonTokens.containerShape],
    pressedShape: shapeRadius[buttonSizeTokens[size].pressedShape],
  };
}

export function getButtonBaseStyle(tokens: ButtonVariantTokens): ButtonStyle {
  return {
    '--_button-min-width': tokens.minWidth,
    '--_button-min-height': tokens.minHeight,
    '--_button-padding-block': tokens.contentPadding.block,
    '--_button-padding-inline-start': tokens.contentPadding.inlineStart,
    '--_button-padding-inline-end': tokens.contentPadding.inlineEnd,
    '--_button-icon-padding-block': tokens.iconContentPadding.block,
    '--_button-icon-padding-inline-start': tokens.iconContentPadding.inlineStart,
    '--_button-icon-padding-inline-end': tokens.iconContentPadding.inlineEnd,
    '--_button-container-radius': shapeRadius[tokens.containerShape],
    '--_button-container-color': tokens.containerColor,
    '--_button-content-color': tokens.contentColor,
    '--_button-disabled-container-color': tokens.disabledContainerColor,
    '--_button-disabled-container-opacity': percent(tokens.disabledContainerOpacity),
    '--_button-disabled-content-color': tokens.disabledContentColor,
    '--_button-disabled-content-opacity': percent(tokens.disabledContentOpacity),
    '--_button-outline-color': tokens.outlineColor,
    '--_button-outline-width': tokens.outlineWidth,
    '--_button-disabled-outline-opacity': percent(tokens.disabledOutlineOpacity),
    '--_button-font-family': typefaceRoleVariable(tokens.labelTypography.fontFamily),
    '--_button-font-size': tokens.labelTypography.fontSize,
    '--_button-line-height': tokens.labelTypography.lineHeight,
    '--_button-font-weight': tokens.labelTypography.fontWeight,
    '--_button-letter-spacing': tokens.labelTypography.letterSpacing,
    '--_button-icon-size': tokens.iconSize,
    '--_button-icon-spacing': tokens.iconSpacing,
  };
}

export function getButtonSizeStyle(size: ButtonSize): ButtonStyle {
  const tokens = buttonSizeTokens[size];
  return {
    '--_button-min-height': tokens.minHeight,
    '--_button-padding-block': tokens.contentPadding.block,
    '--_button-padding-inline-start': tokens.contentPadding.inlineStart,
    '--_button-padding-inline-end': tokens.contentPadding.inlineEnd,
    '--_button-icon-padding-block': tokens.iconContentPadding.block,
    '--_button-icon-padding-inline-start': tokens.iconContentPadding.inlineStart,
    '--_button-icon-padding-inline-end': tokens.iconContentPadding.inlineEnd,
    '--_button-font-family': typefaceRoleVariable(tokens.typography.fontFamily),
    '--_button-font-size': tokens.typography.fontSize,
    '--_button-line-height': tokens.typography.lineHeight,
    '--_button-font-weight': tokens.typography.fontWeight,
    '--_button-letter-spacing': tokens.typography.letterSpacing,
    '--_button-icon-size': tokens.iconSize,
    '--_button-icon-spacing': tokens.iconSpacing,
  };
}

export function resolveButtonElevation(
  tokens: ButtonVariantTokens,
  { isDisabled, interaction }: ButtonInteractionState,
): ElevationLevel {
  if (isDisabled) return tokens.disabledElevation;
  switch (interaction) {
    case 'press': return tokens.pressedElevation;
    case 'hover': return tokens.hoveredElevation;
    case 'focus': return tokens.focusedElevation;
    default: return tokens.defaultElevation;
  }
}

export function resolveButtonElevationTransition({
  isDisabled,
  interaction,
  previousInteraction = null,
}: ButtonInteractionState): string {
  if (isDisabled) return 'none';
  if (interaction !== null) {
    const { durationMs, easing } = elevationMotionTokens.incoming;
    return `box-shadow ${durationMs}ms ${easing}`;
  }
  if (previousInteraction === null) return 'none';
  const spec = previousInteraction === 'hover'
    ? elevationMotionTokens.hoveredOutgoing
    : elevationMotionTokens.outgoing;
  return `box-shadow ${spec.durationMs}ms ${spec.easing}`;
}

function resolveButtonTransition(
  state: ButtonInteractionState,
  hasAnimatedShape: boolean,
): string {
  const elevationTransition = resolveButtonElevationTransition(state);
  const transitions = [
    elevationTransition === 'none' ? null : elevationTransition,
    hasAnimatedShape && !state.isDisabled ? buttonShapeTransition : null,
  ].filter((value): value is string => value !== null);
  return transitions.length > 0 ? transitions.join(', ') : 'none';
}

export function getButtonStyle(
  variant: ButtonVariant,
  state: ButtonInteractionState,
  options: ButtonStyleOptions = {},
): ButtonStyle {
  const tokens = buttonVariantTokens[variant];
  const sizeStyle = options.size ? getButtonSizeStyle(options.size) : null;
  const activeShape = options.shapes
    ? state.interaction === 'press'
      ? options.shapes.pressedShape
      : options.shapes.shape
    : null;
  return {
    ...getButtonBaseStyle(tokens),
    ...(sizeStyle ?? {}),
    ...(activeShape === null ? {} : { '--_button-container-radius': normalizeShapeValue(activeShape) }),
    boxShadow: getElevationBoxShadow(resolveButtonElevation(tokens, state)),
    transition: resolveButtonTransition(state, options.shapes !== undefined),
  };
}

export const filledButtonBaseStyle = getButtonBaseStyle(buttonVariantTokens.filled);

export function getFilledButtonStyle(state: ButtonInteractionState): ButtonStyle {
  return getButtonStyle('filled', state);
}
