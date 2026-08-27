import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';
import { getScrimStyle } from '../Scrim';

export type DialogStyle = CSSProperties &
  Record<`--${string}`, string | number>;
type DialogShape = keyof typeof shapeRadius;
type DialogTypography = keyof typeof typography;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

const shapeRadius = {
  extraLarge: token.ShapeExtraLarge,
} as const;

const typography = {
  headlineSmall: {
    fontFamilyRole: token.TypographyHeadlineSmallFontFamily,
    fontSize: token.TypographyHeadlineSmallFontSize,
    lineHeight: token.TypographyHeadlineSmallLineHeight,
    fontWeight: token.TypographyHeadlineSmallFontWeight,
    letterSpacing: token.TypographyHeadlineSmallLetterSpacing,
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
} as const;

export interface DialogStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  headlineColor?: CSSProperties['color'];
  supportingTextColor?: CSSProperties['color'];
  iconColor?: CSSProperties['color'];
  actionColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  shadowColor?: CSSProperties['color'];
}

export interface DialogOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  scrimAlpha?: number;
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
}

export interface DialogActionInteractionState {
  isFocusVisible?: boolean;
  isHovered?: boolean;
  isPressed?: boolean;
}

export const dialogTokens = {
  actionFocusLabelTextColor: token.ComponentDialogActionFocusLabelTextColor,
  actionHoverLabelTextColor: token.ComponentDialogActionHoverLabelTextColor,
  actionLabelTextColor: token.ComponentDialogActionLabelTextColor,
  actionLabelTypography:
    token.ComponentDialogActionLabelTextFont as DialogTypography,
  actionPressedLabelTextColor: token.ComponentDialogActionPressedLabelTextColor,
  containerColor: token.ComponentDialogContainerColor,
  containerElevation: token.ComponentDialogContainerElevation as ElevationLevel,
  containerShape: token.ComponentDialogContainerShape as DialogShape,
  headlineColor: token.ComponentDialogHeadlineColor,
  headlineTypography: token.ComponentDialogHeadlineFont as DialogTypography,
  supportingTextColor: token.ComponentDialogSupportingTextColor,
  supportingTextTypography:
    token.ComponentDialogSupportingTextFont as DialogTypography,
  iconColor: token.ComponentDialogIconColor,
  iconSize: token.ComponentDialogIconSize,
} as const;

// AndroidX AlertDialog.kt owns these renderer mechanics rather than DialogTokens.kt.
// Keep them beside the renderer instead of promoting layout constants into DTCG.
export const dialogRuntime = {
  minimumWidth: 280,
  maximumWidth: 560,
  viewportMargin: 24,
  contentPadding: 24,
  iconBottomSpacing: 16,
  titleBottomSpacing: 16,
  supportingTextBottomSpacing: 24,
  actionSpacing: 8,
} as const;

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function typographyVariables(prefix: string, role: DialogTypography) {
  const text = typography[role];
  return {
    [`--_${prefix}-font-family`]: typefaceRoleVariable(text.fontFamilyRole),
    [`--_${prefix}-font-size`]: text.fontSize,
    [`--_${prefix}-line-height`]: text.lineHeight,
    [`--_${prefix}-font-weight`]: text.fontWeight,
    [`--_${prefix}-letter-spacing`]: text.letterSpacing,
  } as Record<`--${string}`, string | number>;
}

export function getDialogStyle(
  options: DialogStyleOptions = {},
): DialogStyle {
  const actionColor = options.actionColor ?? dialogTokens.actionLabelTextColor;
  const shape = options.shape ?? shapeRadius[dialogTokens.containerShape];

  return {
    '--_dialog-container-color':
      options.containerColor ?? dialogTokens.containerColor,
    '--_dialog-headline-color':
      options.headlineColor ?? dialogTokens.headlineColor,
    '--_dialog-supporting-text-color':
      options.supportingTextColor ?? dialogTokens.supportingTextColor,
    '--_dialog-icon-color': options.iconColor ?? dialogTokens.iconColor,
    '--_dialog-action-color': actionColor,
    '--_dialog-action-focus-color':
      options.actionColor ?? dialogTokens.actionFocusLabelTextColor,
    '--_dialog-action-hover-color':
      options.actionColor ?? dialogTokens.actionHoverLabelTextColor,
    '--_dialog-action-pressed-color':
      options.actionColor ?? dialogTokens.actionPressedLabelTextColor,
    '--_dialog-icon-size': dialogTokens.iconSize,
    '--_dialog-radius': cssLength(shape as CssLength),
    '--_dialog-box-shadow': getElevationBoxShadow(
      dialogTokens.containerElevation,
      (options.shadowColor ?? 'var(--shadow)') as string,
    ),
    '--_dialog-content-padding': `${dialogRuntime.contentPadding}px`,
    '--_dialog-icon-bottom-spacing': `${dialogRuntime.iconBottomSpacing}px`,
    '--_dialog-title-bottom-spacing': `${dialogRuntime.titleBottomSpacing}px`,
    '--_dialog-supporting-text-bottom-spacing': `${dialogRuntime.supportingTextBottomSpacing}px`,
    '--_dialog-action-spacing': `${dialogRuntime.actionSpacing}px`,
    ...typographyVariables(
      'dialog-headline',
      dialogTokens.headlineTypography,
    ),
    ...typographyVariables(
      'dialog-supporting-text',
      dialogTokens.supportingTextTypography,
    ),
    ...typographyVariables(
      'dialog-action',
      dialogTokens.actionLabelTypography,
    ),
  };
}

export function getDialogOverlayStyle(
  options: DialogOverlayStyleOptions = {},
): DialogStyle {
  const scrim = getScrimStyle({
    containerColor: options.scrimColor,
    containerOpacity: options.scrimOpacity,
    alpha: options.scrimAlpha,
  });

  return {
    ...scrim,
    '--_dialog-min-width': cssLength(
      (options.minWidth ?? dialogRuntime.minimumWidth) as CssLength,
    ),
    '--_dialog-max-width': cssLength(
      (options.maxWidth ?? dialogRuntime.maximumWidth) as CssLength,
    ),
    '--_dialog-viewport-margin': `${dialogRuntime.viewportMargin}px`,
  };
}

function interactionColor(
  state: DialogActionInteractionState,
): string {
  if (state.isPressed) return 'var(--_dialog-action-pressed-color)';
  if (state.isFocusVisible) return 'var(--_dialog-action-focus-color)';
  if (state.isHovered) return 'var(--_dialog-action-hover-color)';
  return 'var(--_dialog-action-color)';
}

export function getDialogActionStyle(
  state: DialogActionInteractionState = {},
): DialogStyle {
  const color = interactionColor(state);
  return {
    '--_button-content-color': color,
    '--_button-font-family': 'var(--_dialog-action-font-family)',
    '--_button-font-size': 'var(--_dialog-action-font-size)',
    '--_button-line-height': 'var(--_dialog-action-line-height)',
    '--_button-font-weight': 'var(--_dialog-action-font-weight)',
    '--_button-letter-spacing': 'var(--_dialog-action-letter-spacing)',
    '--ripple-color': color,
  };
}
