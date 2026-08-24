import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';

export type SnackbarStyle = CSSProperties &
  Record<`--${string}`, string | number>;
type SnackbarShape = keyof typeof shapeRadius;
type SnackbarTypography = keyof typeof typography;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

const shapeRadius = {
  extraSmall: token.ShapeExtraSmall,
} as const;

const typography = {
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
} as const;

export interface SnackbarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  actionColor?: CSSProperties['color'];
  iconColor?: CSSProperties['color'];
  shadowColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  maxWidth?: CSSProperties['maxWidth'];
}

export interface SnackbarInteractionState {
  isFocusVisible?: boolean;
  isHovered?: boolean;
  isPressed?: boolean;
}

export const snackbarTokens = {
  actionLabelTextColor: token.ComponentSnackbarActionLabelTextColor,
  actionFocusLabelTextColor: token.ComponentSnackbarActionFocusLabelTextColor,
  actionHoverLabelTextColor: token.ComponentSnackbarActionHoverLabelTextColor,
  actionPressedLabelTextColor: token.ComponentSnackbarActionPressedLabelTextColor,
  actionLabelTypography:
    token.ComponentSnackbarActionLabelTypography as SnackbarTypography,
  actionFocusStateLayerColor: token.ComponentSnackbarActionFocusStateLayerColor,
  actionFocusStateLayerOpacity: token.ComponentSnackbarActionFocusStateLayerOpacity,
  actionHoverStateLayerColor: token.ComponentSnackbarActionHoverStateLayerColor,
  actionHoverStateLayerOpacity: token.ComponentSnackbarActionHoverStateLayerOpacity,
  actionPressedStateLayerColor: token.ComponentSnackbarActionPressedStateLayerColor,
  actionPressedStateLayerOpacity: token.ComponentSnackbarActionPressedStateLayerOpacity,
  containerColor: token.ComponentSnackbarContainerColor,
  containerElevation: token.ComponentSnackbarContainerElevation as ElevationLevel,
  containerShape: token.ComponentSnackbarContainerShape as SnackbarShape,
  containerSingleLineHeight: token.ComponentSnackbarContainerSingleLineHeight,
  containerTwoLinesHeight: token.ComponentSnackbarContainerTwoLinesHeight,
  containerShadowColor: token.ComponentSnackbarContainerShadowColor,
  iconColor: token.ComponentSnackbarIconColor,
  iconFocusColor: token.ComponentSnackbarIconFocusColor,
  iconHoverColor: token.ComponentSnackbarIconHoverColor,
  iconPressedColor: token.ComponentSnackbarIconPressedColor,
  iconSize: token.ComponentSnackbarIconSize,
  iconFocusStateLayerColor: token.ComponentSnackbarIconFocusStateLayerColor,
  iconFocusStateLayerOpacity: token.ComponentSnackbarIconFocusStateLayerOpacity,
  iconHoverStateLayerColor: token.ComponentSnackbarIconHoverStateLayerColor,
  iconHoverStateLayerOpacity: token.ComponentSnackbarIconHoverStateLayerOpacity,
  iconPressedStateLayerColor: token.ComponentSnackbarIconPressedStateLayerColor,
  iconPressedStateLayerOpacity: token.ComponentSnackbarIconPressedStateLayerOpacity,
  supportingTextColor: token.ComponentSnackbarSupportingTextColor,
  supportingTextTypography:
    token.ComponentSnackbarSupportingTextTypography as SnackbarTypography,
} as const;

// AndroidX Snackbar.kt owns these renderer mechanics rather than
// SnackbarTokens.kt. Keep them beside the web renderer rather than promoting
// implementation constants into the canonical DTCG graph.
export const snackbarRuntime = {
  maximumWidth: 600,
  horizontalSpacing: 16,
  horizontalSpacingButtonSide: 8,
  textEndExtraSpacing: 8,
  verticalPadding: 14,
  actionButtonBottomPadding: 4,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function typographyVariables(prefix: string, role: SnackbarTypography) {
  const text = typography[role];
  return {
    [`--_${prefix}-font-family`]: typefaceRoleVariable(text.fontFamilyRole),
    [`--_${prefix}-font-size`]: text.fontSize,
    [`--_${prefix}-line-height`]: text.lineHeight,
    [`--_${prefix}-font-weight`]: text.fontWeight,
    [`--_${prefix}-letter-spacing`]: text.letterSpacing,
  } as Record<`--${string}`, string | number>;
}

export function getSnackbarStyle(
  options: SnackbarStyleOptions = {},
): SnackbarStyle {
  const shape = options.shape ?? shapeRadius[snackbarTokens.containerShape];
  const actionColor = options.actionColor ?? snackbarTokens.actionLabelTextColor;
  const iconColor = options.iconColor ?? snackbarTokens.iconColor;
  const shadowColor = options.shadowColor ?? snackbarTokens.containerShadowColor;

  return {
    '--_snackbar-container-color':
      options.containerColor ?? snackbarTokens.containerColor,
    '--_snackbar-content-color':
      options.contentColor ?? snackbarTokens.supportingTextColor,
    '--_snackbar-action-color': actionColor,
    '--_snackbar-action-focus-color':
      options.actionColor ?? snackbarTokens.actionFocusLabelTextColor,
    '--_snackbar-action-hover-color':
      options.actionColor ?? snackbarTokens.actionHoverLabelTextColor,
    '--_snackbar-action-pressed-color':
      options.actionColor ?? snackbarTokens.actionPressedLabelTextColor,
    '--_snackbar-action-focus-state-layer-color':
      options.actionColor ?? snackbarTokens.actionFocusStateLayerColor,
    '--_snackbar-action-hover-state-layer-color':
      options.actionColor ?? snackbarTokens.actionHoverStateLayerColor,
    '--_snackbar-action-pressed-state-layer-color':
      options.actionColor ?? snackbarTokens.actionPressedStateLayerColor,
    '--_snackbar-action-focus-state-layer-opacity':
      snackbarTokens.actionFocusStateLayerOpacity,
    '--_snackbar-action-hover-state-layer-opacity':
      snackbarTokens.actionHoverStateLayerOpacity,
    '--_snackbar-action-pressed-state-layer-opacity':
      snackbarTokens.actionPressedStateLayerOpacity,
    '--_snackbar-icon-color': iconColor,
    '--_snackbar-icon-focus-color':
      options.iconColor ?? snackbarTokens.iconFocusColor,
    '--_snackbar-icon-hover-color':
      options.iconColor ?? snackbarTokens.iconHoverColor,
    '--_snackbar-icon-pressed-color':
      options.iconColor ?? snackbarTokens.iconPressedColor,
    '--_snackbar-icon-focus-state-layer-color':
      options.iconColor ?? snackbarTokens.iconFocusStateLayerColor,
    '--_snackbar-icon-hover-state-layer-color':
      options.iconColor ?? snackbarTokens.iconHoverStateLayerColor,
    '--_snackbar-icon-pressed-state-layer-color':
      options.iconColor ?? snackbarTokens.iconPressedStateLayerColor,
    '--_snackbar-icon-focus-state-layer-opacity':
      snackbarTokens.iconFocusStateLayerOpacity,
    '--_snackbar-icon-hover-state-layer-opacity':
      snackbarTokens.iconHoverStateLayerOpacity,
    '--_snackbar-icon-pressed-state-layer-opacity':
      snackbarTokens.iconPressedStateLayerOpacity,
    '--_snackbar-icon-size': snackbarTokens.iconSize,
    '--_snackbar-radius': cssLength(shape as CssLength),
    '--_snackbar-box-shadow': getElevationBoxShadow(
      snackbarTokens.containerElevation,
      shadowColor as string,
    ),
    '--_snackbar-single-line-height': snackbarTokens.containerSingleLineHeight,
    '--_snackbar-two-lines-height': snackbarTokens.containerTwoLinesHeight,
    '--_snackbar-max-width': cssLength(
      (options.maxWidth ?? snackbarRuntime.maximumWidth) as CssLength,
    ),
    '--_snackbar-horizontal-spacing': `${snackbarRuntime.horizontalSpacing}px`,
    '--_snackbar-button-side-spacing': `${snackbarRuntime.horizontalSpacingButtonSide}px`,
    '--_snackbar-text-end-extra-spacing': `${snackbarRuntime.textEndExtraSpacing}px`,
    '--_snackbar-vertical-padding': `${snackbarRuntime.verticalPadding}px`,
    '--_snackbar-action-bottom-padding': `${snackbarRuntime.actionButtonBottomPadding}px`,
    ...typographyVariables(
      'snackbar-text',
      snackbarTokens.supportingTextTypography,
    ),
    ...typographyVariables(
      'snackbar-action',
      snackbarTokens.actionLabelTypography,
    ),
  };
}

function interactionVariable(
  state: SnackbarInteractionState,
  base: string,
  focus: string,
  hover: string,
  pressed: string,
) {
  if (state.isPressed) return pressed;
  if (state.isFocusVisible) return focus;
  if (state.isHovered) return hover;
  return base;
}

export function getSnackbarActionStyle(
  state: SnackbarInteractionState = {},
): SnackbarStyle {
  return {
    '--_button-content-color': interactionVariable(
      state,
      'var(--_snackbar-action-color)',
      'var(--_snackbar-action-focus-color)',
      'var(--_snackbar-action-hover-color)',
      'var(--_snackbar-action-pressed-color)',
    ),
    '--_button-font-family': 'var(--_snackbar-action-font-family)',
    '--_button-font-size': 'var(--_snackbar-action-font-size)',
    '--_button-line-height': 'var(--_snackbar-action-line-height)',
    '--_button-font-weight': 'var(--_snackbar-action-font-weight)',
    '--_button-letter-spacing': 'var(--_snackbar-action-letter-spacing)',
    '--ripple-color': interactionVariable(
      state,
      'var(--_snackbar-action-color)',
      'var(--_snackbar-action-focus-state-layer-color)',
      'var(--_snackbar-action-hover-state-layer-color)',
      'var(--_snackbar-action-pressed-state-layer-color)',
    ),
  };
}

export function getSnackbarDismissActionStyle(
  state: SnackbarInteractionState = {},
): SnackbarStyle {
  return {
    '--_icon-button-content-color': interactionVariable(
      state,
      'var(--_snackbar-icon-color)',
      'var(--_snackbar-icon-focus-color)',
      'var(--_snackbar-icon-hover-color)',
      'var(--_snackbar-icon-pressed-color)',
    ),
    '--_icon-button-icon-size': 'var(--_snackbar-icon-size)',
    '--ripple-color': interactionVariable(
      state,
      'var(--_snackbar-icon-color)',
      'var(--_snackbar-icon-focus-state-layer-color)',
      'var(--_snackbar-icon-hover-state-layer-color)',
      'var(--_snackbar-icon-pressed-state-layer-color)',
    ),
  };
}
