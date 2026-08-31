import { describe, expect, it } from 'vitest';
import { PaneMotion } from '../../adaptive/paneMotion';
import type {
  PaneTransitionFrame,
  ThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';
import { composeThreePaneScaffoldMovingRetargetOrigin } from './ThreePaneScaffold.retarget';

function pane(
  left: number,
  translateX: number,
  opacity: number,
  motion: PaneMotion,
): PaneTransitionFrame {
  return {
    placement: { left, top: 0, width: 300, height: 800 },
    translateX,
    opacity,
    inlineClipFraction: 1,
    motion,
    levitated: false,
  };
}

describe('composeThreePaneScaffoldMovingRetargetOrigin', () => {
  it('keeps old visibility children moving after the logical target changes', () => {
    const frozen: ThreePaneScaffoldTransitionFrame = {
      primary: pane(0, -400, 1, PaneMotion.ExitToLeft),
      secondary: pane(324, 600, 1, PaneMotion.EnterFromRight),
      scrimOpacity: 0,
    };
    const movingPrevious: ThreePaneScaffoldTransitionFrame = {
      primary: pane(0, -800, 1, PaneMotion.ExitToLeft),
      secondary: pane(324, 200, 1, PaneMotion.EnterFromRight),
      scrimOpacity: 0,
    };
    const nextInitial: ThreePaneScaffoldTransitionFrame = {
      secondary: pane(0, 0, 1, PaneMotion.ExitToLeft),
      tertiary: pane(324, 1000, 1, PaneMotion.EnterFromRight),
      scrimOpacity: 0,
    };
    const nextEnd: ThreePaneScaffoldTransitionFrame = {
      secondary: pane(0, -1000, 1, PaneMotion.ExitToLeft),
      tertiary: pane(324, 0, 1, PaneMotion.EnterFromRight),
      scrimOpacity: 0,
    };

    const origin = composeThreePaneScaffoldMovingRetargetOrigin(
      frozen,
      movingPrevious,
      nextInitial,
      nextEnd,
    );

    // Primary is hidden in both new logical states, but AndroidX keeps its old
    // exit child alive until the initial-value animation reaches the old target.
    expect(origin.primary?.translateX).toBe(-800);
    expect(origin.secondary?.translateX).toBe(200);
    expect(origin.tertiary?.translateX).toBe(1000);
  });

  it('freezes private AnimateBounds placement while other values can keep moving', () => {
    const frozenPrimary = pane(120, 0, 0.4, PaneMotion.AnimateBounds);
    const movingPrimary = pane(180, 25, 0.7, PaneMotion.AnimateBounds);
    const nextInitialPrimary = pane(300, 0, 1, PaneMotion.AnimateBounds);
    const nextEndPrimary = pane(500, 0, 1, PaneMotion.AnimateBounds);

    const origin = composeThreePaneScaffoldMovingRetargetOrigin(
      { primary: frozenPrimary, scrimOpacity: 0 },
      { primary: movingPrimary, scrimOpacity: 0 },
      { primary: nextInitialPrimary, scrimOpacity: 0 },
      { primary: nextEndPrimary, scrimOpacity: 0 },
    );

    expect(origin.primary?.placement).toEqual(frozenPrimary.placement);
    expect(origin.primary?.translateX).toBe(25);
    expect(origin.primary?.opacity).toBe(0.7);
  });
});
