import { describe, expect, it } from 'vitest';
import {
  calculateDragToResizeSpringDurationMs,
  DragToResizeSpringDefaults,
  sampleDragToResizeSpring,
} from './dragToResizeSpring';

describe('DragToResizeState default spring', () => {
  it('pins animation-core default spring constants', () => {
    expect(DragToResizeSpringDefaults).toEqual({
      dampingRatio: 1,
      stiffness: 1500,
      visibilityThreshold: 0.01,
    });
  });

  it('samples the pinned critically-damped SpringSimulation Float response', () => {
    expect(sampleDragToResizeSpring(800, 48, 0)).toBe(800);
    expect(sampleDragToResizeSpring(800, 48, 100)).toBe(124.20745849609375);
    expect(sampleDragToResizeSpring(48, 800, 100)).toBe(723.7925415039062);
  });

  it('uses AndroidX whole-millisecond spring precision', () => {
    expect(sampleDragToResizeSpring(800, 48, 100.9)).toBe(
      sampleDragToResizeSpring(800, 48, 100),
    );
  });

  it('matches the pinned critically-damped duration estimate', () => {
    expect(calculateDragToResizeSpringDurationMs(800, 48)).toBe(359);
    expect(calculateDragToResizeSpringDurationMs(48, 800)).toBe(359);
    expect(calculateDragToResizeSpringDurationMs(420, 420)).toBe(0);
  });
});
