import {
  buttonSizeTokens,
  buttonVariantTokens,
  type ButtonContainerColor,
  type ButtonPressedShape,
  type ButtonSize,
  type ButtonVariant,
  type ButtonVariantTokens,
} from '@m3/tokens/button';
import {
  elevationMotionTokens,
  type ElevationLevel,
} from '@m3/tokens/elevation';
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

const shapeRadius = {
  full: '9999px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
} as const;

// AndroidX currently animates ButtonShapes with MotionSchemeKeyTokens.DefaultEffects.
// Both built-in Material motion schemes resolve that token to the same critically
// damped spring (damping 1, stiffness 1600). This CSS linear() curve samples the
// normalized spring response until Compose's Float visibility threshold is reached.
const buttonShapeTransition =
  'border-radius 166ms linear(0, 0.1433 10%, 0.3829 20%, 0.5917 30%, 0.7431 40%, 0.8437 50%, 0.9072 60%, 0.9458 70%, 0.9688 80%, 0.9823 90%, 1)';

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

function normalizeShapeValue(value: ButtonShapeValue): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

function pressedShapeRadius(role: ButtonPressedShape): string {
  return shapeRadius[role];
}

export function buttonShapesForSize(size: ButtonSize): ButtonShapes {
  return {
    shape: shapeRadius.full,
    pressedShape: pressedShapeRadius(buttonSizeTokens[size].pressedShape),
  };
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

export function getButtonSizeStyle(size: ButtonSize): ButtonStyle {
  const tokens = buttonSizeTokens[size];

  return {
    '--_button-min-height': `${tokens.minHeight}px`,
    '--_button-padding-block': `${tokens.contentPadding.block}px`,
    '--_button-padding-inline-start': `${tokens.contentPadding.inlineStart}px`,
    '--_button-padding-inline-end': `${tokens.contentPadding.inlineEnd}px`,
    '--_button-icon-padding-block': `${tokens.iconContentPadding.block}px`,
    '--_button-icon-padding-inline-start': `${tokens.iconContentPadding.inlineStart}px`,
    '--_button-icon-padding-inline-end': `${tokens.iconContentPadding.inlineEnd}px`,
    '--_button-font-family': typefaceRoleVariable(tokens.typography.fontFamily),
    '--_button-font-size': `${tokens.typography.fontSize}px`,
    '--_button-line-height': `${tokens.typography.lineHeight}px`,
    '--_button-font-weight': tokens.typography.fontWeight,
    '--_button-letter-spacing': `${tokens.typography.letterSpacing}px`,
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

export function resolveButtonElevationTransition({
  isDisabled,
  interaction,
  previousInteraction = null,
}: ButtonInteractionState): string {
  if (isDisabled) {
    return 'none';
  }

  if (interaction !== null) {
    const { durationMs, easing } = elevationMotionTokens.incoming;
    return `box-shadow ${durationMs}ms ${easing}`;
  }

  if (previousInteraction === null) {
    return 'none';
  }

  const spec =
    previousInteraction === 'hover'
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
    ...(activeShape === null
      ? {}
      : { '--_button-container-radius': normalizeShapeValue(activeShape) }),
    boxShadow: getElevationBoxShadow(resolveButtonElevation(tokens, state)),
    transition: resolveButtonTransition(state, options.shapes !== undefined),
  };
}

export const filledButtonBaseStyle = getButtonBaseStyle(
  buttonVariantTokens.filled,
);

export function getFilledButtonStyle(state: ButtonInteractionState): ButtonStyle {
  return getButtonStyle('filled', state);
}
