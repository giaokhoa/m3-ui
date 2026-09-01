import { describe, expect, it } from 'vitest';
import {
  getIconButtonRuntimeStyle,
  iconButtonShapesForSize,
  iconToggleButtonShapesForSize,
} from './IconButton.runtime';

describe('IconButton expressive shape runtime', () => {
  it('maps canonical expressive shape families without owning static paint or size vars', () => {
    expect(iconButtonShapesForSize('small', 'round')).toEqual({
      shape: '9999px',
      pressedShape: '8px',
    });
    expect(iconToggleButtonShapesForSize('medium', 'square')).toEqual({
      shape: '16px',
      pressedShape: '12px',
      selectedShape: '9999px',
    });
  });

  it('only emits a runtime radius when shapes are explicitly supplied', () => {
    expect(getIconButtonRuntimeStyle({ isPressed: false })).toEqual({});

    const shapes = { shape: 20, pressedShape: 4, selectedShape: 12 } as const;
    expect(
      getIconButtonRuntimeStyle({ isPressed: false, isSelected: true }, shapes),
    ).toEqual({ '--_icon-button-container-radius': '12px' });
    expect(
      getIconButtonRuntimeStyle({ isPressed: true, isSelected: true }, shapes),
    ).toEqual({ '--_icon-button-container-radius': '4px' });
  });
});
