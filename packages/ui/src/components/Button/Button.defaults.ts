import {
  buttonVariantTokens,
  type ButtonContainerColor,
  type ButtonVariant,
  type ButtonVariantTokens,
} from '@m3/tokens/button';
import type { ElevationLevel } from '@m3/tokens/elevation';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow } from '../../internal/elevation';
import type { ButtonInteraction } from './Button.interactions';

export type ButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ButtonInteractionState {
  readonly isDisabled: boolean;
  readonly interaction: ButtonInteraction | null;
}

const shapeRadius = {
  full: '9999px',
} as const;

function percent(value: number): string {
  return `${value * 100}%`;
}

function colorRoleVariable(role: ButtonContainerColor): string {
  if (role === 'transparent') {
    return 'transparent';
  }

  const name = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return `var(--${name})`;
}

function typefaceRoleVariable(role: string): string {
  return `var(--font-family-${role})`;
}

export function getButtonBaseStyle(tokens: ButtonVariantTokens): ButtonStyle {
  return {
    '--_button-min-width': `${tokens.minWidth}px`,
    '--_button-min-height': `${tokens.minHeight}px`,
    '--_button-padding-block': `${tokens.contentPadding.block}px`,
    '--_button-padding-inline-start': `${tokens.contentPadding.inlineStart}px`,
    '--_button-padding-inline-end': `${tokens.contentPadding.inlineEnd}px`,
    '--_button-icon-padding-block': `${tokens.iconContentPadding.block}px`,
    '--_button-icon-padding-inline-start': `${tokens.iconContentPadding.inlineStart}px`,
    '--_button-icon-padding-inline-end': `${tokens.iconContentPadding.inlineEnd}px`,
    '--_button-container-radius': shapeRadius[tokens.containerShape],
    '--_button-container-color': colorRoleVariable(tokens.containerColor),
    '--_button-content-color': colorRoleVariable(tokens.contentColor),
    '--_button-disabled-container-color': colorRoleVariable(
      tokens.disabledContainerColor,
    ),
    '--_button-disabled-container-opacity': percent(
      tokens.disabledContainerOpacity,
    ),
    '--_button-disabled-content-color': colorRoleVariable(
      tokens.disabledContentColor,
    ),
    '--_button-disabled-content-opacity': percent(tokens.disabledContentOpacity),
    '--_button-outline-color': colorRoleVariable(tokens.outlineColor),
    '--_button-outline-width': `${tokens.outlineWidth}px`,
    '--_button-disabled-outline-opacity': percent(tokens.disabledOutlineOpacity),
    '--_button-font-family': typefaceRoleVariable(tokens.labelTypography.fontFamily),
    '--_button-font-size': `${tokens.labelTypography.fontSize}px`,
    '--_button-line-height': `${tokens.labelTypography.lineHeight}px`,
    '--_button-font-weight': tokens.labelTypography.fontWeight,
    '--_button-letter-spacing': `${tokens.labelTypography.letterSpacing}px`,
    '--_button-icon-size': `${tokens.iconSize}px`,
    '--_button-icon-spacing': `${tokens.iconSpacing}px`,
  };
}

export function resolveButtonElevation(
  tokens: ButtonVariantTokens,
  { isDisabled, interaction }: ButtonInteractionState,
): ElevationLevel {
  if (isDisabled) {
    return tokens.disabledElevation;
  }

  switch (interaction) {
    case 'press':
      return tokens.pressedElevation;
    case 'hover':
      return tokens.hoveredElevation;
    case 'focus':
      return tokens.focusedElevation;
    default:
      return tokens.defaultElevation;
  }
}

export function getButtonStyle(
  variant: ButtonVariant,
  state: ButtonInteractionState,
): ButtonStyle {
  const tokens = buttonVariantTokens[variant];

  return {
    ...getButtonBaseStyle(tokens),
    boxShadow: getElevationBoxShadow(resolveButtonElevation(tokens, state)),
  };
}

export const filledButtonBaseStyle = getButtonBaseStyle(
  buttonVariantTokens.filled,
);

export function getFilledButtonStyle(state: ButtonInteractionState): ButtonStyle {
  return getButtonStyle('filled', state);
}
