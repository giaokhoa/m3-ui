import { filledButtonTokens } from '@m3/tokens/button';
import type { ElevationLevel } from '@m3/tokens/elevation';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow } from '../../internal/elevation';

export type ButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ButtonInteractionState {
  readonly isDisabled: boolean;
  readonly isPressed: boolean;
  readonly isFocused: boolean;
  readonly isHovered: boolean;
}

const shapeRadius = {
  full: '9999px',
} as const;

function percent(value: number): string {
  return `${value * 100}%`;
}

function colorRoleVariable(role: string): string {
  const name = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return `var(--${name})`;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

export const filledButtonBaseStyle: ButtonStyle = {
  '--_button-min-width': `${filledButtonTokens.minWidth}px`,
  '--_button-min-height': `${filledButtonTokens.minHeight}px`,
  '--_button-padding-block': `${filledButtonTokens.contentPadding.block}px`,
  '--_button-padding-inline': `${filledButtonTokens.contentPadding.inline}px`,
  '--_button-container-radius': shapeRadius[filledButtonTokens.containerShape],
  '--_button-container-color': colorRoleVariable(
    filledButtonTokens.containerColor,
  ),
  '--_button-content-color': colorRoleVariable(filledButtonTokens.contentColor),
  '--_button-disabled-container-color': colorRoleVariable(
    filledButtonTokens.disabledContainerColor,
  ),
  '--_button-disabled-container-opacity': percent(
    filledButtonTokens.disabledContainerOpacity,
  ),
  '--_button-disabled-content-color': colorRoleVariable(
    filledButtonTokens.disabledContentColor,
  ),
  '--_button-disabled-content-opacity': percent(
    filledButtonTokens.disabledContentOpacity,
  ),
  '--_button-font-family': typefaceRoleVariable(
    filledButtonTokens.labelTypography.fontFamily,
  ),
  '--_button-font-size': `${filledButtonTokens.labelTypography.fontSize}px`,
  '--_button-line-height': `${filledButtonTokens.labelTypography.lineHeight}px`,
  '--_button-font-weight': filledButtonTokens.labelTypography.fontWeight,
  '--_button-letter-spacing': `${filledButtonTokens.labelTypography.letterSpacing}px`,
  '--_button-icon-size': `${filledButtonTokens.iconSize}px`,
  '--_button-icon-spacing': `${filledButtonTokens.iconSpacing}px`,
};

export function resolveFilledButtonElevation({
  isDisabled,
  isPressed,
  isFocused,
  isHovered,
}: ButtonInteractionState): ElevationLevel {
  if (isDisabled) {
    return filledButtonTokens.disabledElevation;
  }

  if (isPressed) {
    return filledButtonTokens.pressedElevation;
  }

  if (isFocused) {
    return filledButtonTokens.focusedElevation;
  }

  if (isHovered) {
    return filledButtonTokens.hoveredElevation;
  }

  return filledButtonTokens.defaultElevation;
}

export function getFilledButtonStyle(
  state: ButtonInteractionState,
): ButtonStyle {
  return {
    ...filledButtonBaseStyle,
    boxShadow: getElevationBoxShadow(resolveFilledButtonElevation(state)),
  };
}
