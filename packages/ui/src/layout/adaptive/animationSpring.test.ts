import { describe, expect, it } from 'vitest';
import {
  calculateDragToResizeSpringDurationMs,
  sampleDragToResizeSpring,
} from './dragToResizeSpring';
import {
  calculatePaneMotionSpringDurationMs,
  samplePaneMotionSpring,
} from './paneMotionSpring';
import {
  AnimationCoreInterruptionSpringSpec,
  MaterialPaneSpringSpec,
  calculateAnimationSpringDurationMs,
  calculateAnimationVectorSpringDurationMs,
  sampleAnimationSpringMotion,
  sampleAnimationVectorSpringAtPlayTime,
} from './animationSpring';

describe('animation spring parity', () => {
  it('matches the pinned Material pane spring including incoming velocity', () => {
    expect(
      calculateAnimationSpringDurationMs(
        MaterialPaneSpringSpec,
        420,
        0,
        1,
        -175,
      ),
    ).toBe(calculatePaneMotionSpringDurationMs(420, 0, 1, -175));

    const motion = sampleAnimationSpringMotion(
      MaterialPaneSpringSpec,
      420,
      0,
      123.9,
      -175,
    );
    expect(motion.value).toBe(samplePaneMotionSpring(420, 0, 123.9, -175));
    expect(motion.value).toBe(Math.fround(motion.value));
    expect(motion.velocity).toBe(Math.fround(motion.velocity));
  });

  it('matches the animation-core default critical spring value', () => {
    const motion = sampleAnimationSpringMotion(
      AnimationCoreInterruptionSpringSpec,
      1000,
      0,
      100,
    );

    expect(motion.value).toBe(sampleDragToResizeSpring(1000, 0, 100));
    // 1000 / threshold 1 and 10 / DragToResize threshold .01 normalize
    // to the same SpringEstimation displacement.
    expect(
      calculateAnimationSpringDurationMs(
        AnimationCoreInterruptionSpringSpec,
        1000,
        0,
        1,
      ),
    ).toBe(calculateDragToResizeSpringDurationMs(10, 0));
  });

  it('preserves and Float-quantizes incoming interruption velocity', () => {
    const zeroVelocity = sampleAnimationSpringMotion(
      AnimationCoreInterruptionSpringSpec,
      400,
      0,
      100,
      0,
    );
    const incomingVelocity = sampleAnimationSpringMotion(
      AnimationCoreInterruptionSpringSpec,
      400,
      0,
      100,
      -1200,
    );

    expect(incomingVelocity.value).not.toBe(zeroVelocity.value);
    expect(incomingVelocity.velocity).not.toBe(zeroVelocity.velocity);
    expect(incomingVelocity.value).toBe(Math.fround(incomingVelocity.value));
    expect(incomingVelocity.velocity).toBe(Math.fround(incomingVelocity.velocity));
  });

  it('uses the slowest vector dimension and snaps the vector at duration', () => {
    const duration = calculateAnimationVectorSpringDurationMs(
      AnimationCoreInterruptionSpringSpec,
      [1000, 20],
      [0, 0],
      [1, 1],
      [0, 0],
    );

    expect(
      sampleAnimationVectorSpringAtPlayTime(
        AnimationCoreInterruptionSpringSpec,
        [1000, 20],
        [0, 0],
        duration,
        [1, 1],
      ),
    ).toEqual([
      { value: 0, velocity: 0 },
      { value: 0, velocity: 0 },
    ]);
  });
});
