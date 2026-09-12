import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import { buttonElevationLevels } from './Button.elevation';
import {
  buttonShapesForSize,
  getButtonStyle,
} from './Button.runtime';
import type { ButtonShapeType, ButtonSize } from './Button.types';

const idleState = { isDisabled: false, isPressed: false } as const;
const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;
const shapeTokens = {
  extraSmall: {
    round: token.ComponentButtonSizeExtraSmallContainerShapeRound,
    square: token.ComponentButtonSizeExtraSmallContainerShapeSquare,
    pressed: token.ComponentButtonSizeExtraSmallPressedShape,
  },
  small: {
    round: token.ComponentButtonSizeSmallContainerShapeRound,
    square: token.ComponentButtonSizeSmallContainerShapeSquare,
    pressed: token.ComponentButtonSizeSmallPressedShape,
  },
  medium: {
    round: token.ComponentButtonSizeMediumContainerShapeRound,
    square: token.ComponentButtonSizeMediumContainerShapeSquare,
    pressed: token.ComponentButtonSizeMediumPressedShape,
  },
  large: {
    round: token.ComponentButtonSizeLargeContainerShapeRound,
    square: token.ComponentButtonSizeLargeContainerShapeSquare,
    pressed: token.ComponentButtonSizeLargePressedShape,
  },
  extraLarge: {
    round: token.ComponentButtonSizeExtraLargeContainerShapeRound,
    square: token.ComponentButtonSizeExtraLargeContainerShapeSquare,
    pressed: token.ComponentButtonSizeExtraLargePressedShape,
  },
} as const;

function expectedShapes(size: ButtonSize, type: ButtonShapeType) {
  const values = shapeTokens[size];
  return {
    shape: shapeRadius[values[type]],
    pressedShape: shapeRadius[values.pressed],
  };
}

describe('Button runtime integration', () => {
  it('resolves Round and Square runtime shapes from generated semantic tokens', () => {
    for (const size of Object.keys(shapeTokens) as ButtonSize[]) {
      expect(buttonShapesForSize(size)).toEqual(expectedShapes(size, 'round'));
      expect(buttonShapesForSize(size, 'square')).toEqual(expectedShapes(size, 'square'));
    }
  });

  it('only emits runtime shape overrides when shapes are supplied', () => {
    const baseline = getButtonStyle(idleState);
    expect(baseline['--_button-container-radius']).toBeUndefined();
    expect(baseline['--_button-container-color']).toBeUndefined();
    expect(baseline['--_button-min-height']).toBeUndefined();
    expect(baseline.boxShadow).toBeUndefined();

    const shapes = buttonShapesForSize('medium');
    const idle = getButtonStyle(idleState, { shapes });
    const pressed = getButtonStyle({ ...idleState, isPressed: true }, { shapes });
    expect(idle['--_button-container-radius']).toBe(token.ShapeFull);
    expect(pressed['--_button-container-radius']).toBe(token.ShapeMedium);
    expect(pressed.transition).toBe(
      `border-radius ${token.MotionSpringDefaultEffectsDuration} ${token.MotionSpringDefaultEffectsEasing}`,
    );
    expect(pressed.transition).not.toContain('box-shadow');
  });

  it('supplies generated semantic elevation level sets without resolving RAC state locally', () => {
    expect(buttonElevationLevels.elevated).toEqual({
      default: token.ComponentButtonVariantElevatedDefaultElevation,
      hovered: token.ComponentButtonVariantElevatedHoveredElevation,
      focused: token.ComponentButtonVariantElevatedFocusedElevation,
      pressed: token.ComponentButtonVariantElevatedPressedElevation,
      disabled: token.ComponentButtonVariantElevatedDisabledElevation,
    });
    expect(buttonElevationLevels.filled.hovered).toBe(
      token.ComponentButtonVariantFilledHoveredElevation,
    );
    expect(buttonElevationLevels.outlined.hovered).toBe(
      token.ComponentButtonVariantOutlinedHoveredElevation,
    );
  });
});
