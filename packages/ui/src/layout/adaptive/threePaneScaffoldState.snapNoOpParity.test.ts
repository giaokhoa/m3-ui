import { describe, expect, it } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import { MutableThreePaneScaffoldState } from './threePaneScaffoldState';

const settled: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('MutableThreePaneScaffoldState settled snap parity', () => {
  it('does not clear retained-animation revision for a settled no-op snap', () => {
    const state = new MutableThreePaneScaffoldState(settled);
    const detach = state.setTransitionDurationResolver({}, () => 300);

    try {
      const revision = state.initialValueAnimationsClearRevision;
      state.snapTo(settled);

      expect(state.currentState).toBe(settled);
      expect(state.targetState).toBe(settled);
      expect(state.initialValueAnimationsClearRevision).toBe(revision);
    } finally {
      detach();
    }
  });

  it('still clears predictive-back metadata before the settled snap returns', () => {
    const state = new MutableThreePaneScaffoldState(settled);
    const detach = state.setTransitionDurationResolver({}, () => 300);

    try {
      state.seekTo(0.5, settled, true);
      expect(state.isPredictiveBackInProgress).toBe(true);
      const revision = state.initialValueAnimationsClearRevision;

      state.snapTo(settled);

      expect(state.isPredictiveBackInProgress).toBe(false);
      expect(state.initialValueAnimationsClearRevision).toBe(revision);
    } finally {
      detach();
    }
  });
});
