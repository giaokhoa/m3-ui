import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import {
  buttonShapesForSize,
  getButtonStyle,
} from '../Button/Button.defaults';
import type { ToggleButtonSize, ToggleButtonVariant } from './ToggleButton.types';

export type ToggleButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface ToggleButtonState {
  readonly isDisabled: boolean;
  readonly isSelected: boolean;
  readonly isPressed: boolean;
  readonly isHovered: boolean;
  readonly isFocused: boolean;
}

const selectedShape = {
  extraSmall: token.ShapeMedium,
  small: token.ShapeMedium,
  medium: token.ShapeLarge,
  large: token.ShapeExtraLarge,
  extraLarge: token.ShapeExtraLarge,
} as const satisfies Record<ToggleButtonSize, string>;

const variantColors = {
  filled: {
    unselectedContainer: 'var(--surface-container)',
    unselectedContent: 'var(--on-surface-variant)',
    selectedContainer: 'var(--primary)',
    selectedContent: 'var(--on-primary)',
  },
  elevated: {
    unselectedContainer: 'var(--surface-container-low)',
    unselectedContent: 'var(--primary)',
    selectedContainer: 'var(--primary)',
    selectedContent: 'var(--on-primary)',
  },
  filledTonal: {
    unselectedContainer: 'var(--secondary-container)',
    unselectedContent: 'var(--on-secondary-container)',
    selectedContainer: 'var(--secondary)',
    selectedContent: 'var(--on-secondary)',
  },
  outlined: {
    unselectedContainer: 'transparent',
    unselectedContent: 'var(--on-surface-variant)',
    selectedContainer: 'var(--inverse-surface)',
    selectedContent: 'var(--inverse-on-surface)',
  },
} as const;

export function resolveToggleButtonInteraction(
  state: ToggleButtonState,
): 'press' | 'hover' | 'focus' | null {
  if (state.isPressed) return 'press';
  if (state.isHovered) return 'hover';
  if (state.isFocused) return 'focus';
  return null;
}

function outlineWidthForSize(size: ToggleButtonSize): string {
  if (size === 'large') return '2px';
  if (size === 'extraLarge') return '3px';
  return '1px';
}

export function toggleButtonShapesForSize(size: ToggleButtonSize) {
  const base = buttonShapesForSize(size);
  return {
    shape: base.shape,
    pressedShape: base.pressedShape,
    selectedShape: selectedShape[size],
  } as const;
}

export function getToggleButtonStyle(
  variant: ToggleButtonVariant,
  state: ToggleButtonState,
  size: ToggleButtonSize = 'small',
): ToggleButtonStyle {
  const interaction = resolveToggleButtonInteraction(state);
  const shapes = buttonShapesForSize(size);
  const colors = variantColors[variant];
  const activeShape = state.isPressed
    ? shapes.pressedShape
    : state.isSelected
      ? selectedShape[size]
      : shapes.shape;
  const base = getButtonStyle(
    variant,
    { isDisabled: state.isDisabled, interaction },
    { size, shapes, legacyInlineElevation: false },
  );
  const transition = state.isDisabled
    ? 'none'
    : [
        base.transition === 'none' ? null : base.transition,
        `background-color ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`,
        `color ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`,
        `border-color ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`,
      ].filter((value): value is string => value !== null).join(', ');

  return {
    ...base,
    '--_button-container-radius': activeShape,
    '--_button-container-color': state.isSelected
      ? colors.selectedContainer
      : colors.unselectedContainer,
    '--_button-content-color': state.isSelected
      ? colors.selectedContent
      : colors.unselectedContent,
    '--_button-outline-color': 'var(--outline-variant)',
    '--_button-outline-width': variant === 'outlined' && !state.isSelected
      ? outlineWidthForSize(size)
      : '0px',
    '--_button-disabled-container-color': variant === 'outlined'
      ? 'var(--outline-variant)'
      : 'var(--on-surface)',
    '--_button-disabled-container-opacity': '10%',
    '--_button-disabled-content-color': 'var(--on-surface-variant)',
    '--_button-disabled-content-opacity': '38%',
    '--_button-disabled-outline-opacity': '10%',
    // AndroidX XSmall currently specifies 8px while the repo's canonical web Button
    // projection intentionally remains 4px; adapt only this ToggleButton renderer.
    ...(size === 'extraSmall' ? { '--_button-icon-spacing': '8px' } : {}),
    transition,
  };
}
