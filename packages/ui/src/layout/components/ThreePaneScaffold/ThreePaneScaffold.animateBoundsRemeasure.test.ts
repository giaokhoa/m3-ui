import { describe, expect, it } from 'vitest';
import { updateAnimateBoundsRemeasureOriginPlacement } from './ThreePaneScaffold.visibilityInterruption';

const origin = { left: 0, top: 10, width: 600, height: 700 };
const rendered = { left: 120, top: 80, width: 480, height: 620 };
const previousTarget = { left: 240, top: 160, width: 360, height: 540 };

describe('ThreePaneScaffold AnimateBounds remeasure origin', () => {
  it('captures only rendered size when the target size changes', () => {
    expect(
      updateAnimateBoundsRemeasureOriginPlacement({
        origin,
        rendered,
        previousTarget,
        nextTarget: { ...previousTarget, width: 420, height: 500 },
      }),
    ).toEqual({
      left: origin.left,
      top: origin.top,
      width: rendered.width,
      height: rendered.height,
    });
  });

  it('captures only rendered offset when the target offset changes', () => {
    expect(
      updateAnimateBoundsRemeasureOriginPlacement({
        origin,
        rendered,
        previousTarget,
        nextTarget: { ...previousTarget, left: 300, top: 120 },
      }),
    ).toEqual({
      left: rendered.left,
      top: rendered.top,
      width: origin.width,
      height: origin.height,
    });
  });

  it('captures the whole rendered rect when both target halves change', () => {
    expect(
      updateAnimateBoundsRemeasureOriginPlacement({
        origin,
        rendered,
        previousTarget,
        nextTarget: { left: 300, top: 120, width: 420, height: 500 },
      }),
    ).toEqual(rendered);
  });
});
