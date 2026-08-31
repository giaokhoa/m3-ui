import { describe, expect, it } from 'vitest';
import { PaneAdaptedValue, type ThreePaneScaffoldValue } from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  type ThreePaneScaffoldProgressAnimation,
  type ThreePaneScaffoldProgressAnimationContext,
} from './threePaneScaffoldState';

const hidden: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Hidden,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

describe('MutableThreePaneScaffoldState repeated animateTo parity', () => {
  it('cancels the previous mutator and restarts from its current fraction', async () => {
    const runs: Array<
      ThreePaneScaffoldProgressAnimationContext & { finish: () => void }
    > = [];
    const animation: ThreePaneScaffoldProgressAnimation = (context) =>
      new Promise<void>((resolve) => {
        const finish = () => resolve();
        context.signal.addEventListener('abort', finish, { once: true });
        runs.push({ ...context, finish });
      });

    const state = new MutableThreePaneScaffoldState(hidden);
    state.setTransitionDurationResolver({}, () => 300);

    const first = state.animateTo(primary, { animation });
    expect(runs).toHaveLength(1);
    runs[0]!.update(0.4);
    expect(state.progressFraction).toBe(Math.fround(0.4));

    const second = state.animateTo(primary, { animation });
    expect(runs[0]!.signal.aborted).toBe(true);
    expect(runs).toHaveLength(2);
    expect(runs[1]!.from).toBe(Math.fround(0.4));

    runs[1]!.update(1);
    runs[1]!.finish();
    await Promise.all([first, second]);

    expect(state.currentState).toBe(primary);
    expect(state.targetState).toBe(primary);
    expect(state.progressFraction).toBe(0);
  });
});
