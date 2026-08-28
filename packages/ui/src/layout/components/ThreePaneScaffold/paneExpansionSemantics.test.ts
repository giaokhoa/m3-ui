import { describe, expect, it } from 'vitest';
import {
  PaneExpansionAnchor,
  PaneExpansionState,
} from '../../adaptive/paneExpansionState';
import {
  describePaneExpansionAnchor,
  getPaneExpansionHandleAriaState,
} from './paneExpansionSemantics';

describe('pane expansion semantics', () => {
  it('mirrors the pinned AndroidX anchor descriptions', () => {
    expect(describePaneExpansionAnchor(PaneExpansionAnchor.proportion(0.5))).toBe(
      '50 percent',
    );
    expect(describePaneExpansionAnchor(PaneExpansionAnchor.proportion(0.333))).toBe(
      '33 percent',
    );
    expect(describePaneExpansionAnchor(PaneExpansionAnchor.fromStart(320.9))).toBe(
      '320 DPs from start',
    );
    expect(describePaneExpansionAnchor(PaneExpansionAnchor.fromEnd(240.8))).toBe(
      '240 DPs from end',
    );
  });

  it('describes the current anchor and the next accessibility action', () => {
    const state = new PaneExpansionState({
      anchors: [
        PaneExpansionAnchor.proportion(0.3),
        PaneExpansionAnchor.proportion(0.5),
        PaneExpansionAnchor.proportion(0.7),
      ],
      initialAnchoredIndex: 1,
    });
    state.onMeasured(1000);

    expect(getPaneExpansionHandleAriaState(state)).toMatchObject({
      valueText: 'Current pane split, 50 percent',
      description: 'Change pane split to 70 percent',
    });

    state.moveToNextAnchor();
    expect(getPaneExpansionHandleAriaState(state)).toMatchObject({
      valueText: 'Current pane split, 70 percent',
      description: 'Change pane split to 30 percent',
    });
  });

  it('supports localized formatter overrides without changing anchor state', () => {
    const state = new PaneExpansionState({
      anchors: [PaneExpansionAnchor.proportion(0.4), PaneExpansionAnchor.proportion(0.6)],
      initialAnchoredIndex: 0,
    });
    state.onMeasured(1000);

    expect(
      getPaneExpansionHandleAriaState(state, {
        proportionAnchor: (percent) => `${percent}%`,
        currentSplit: (anchor) => `Current: ${anchor}`,
        changeSplit: (anchor) => `Next: ${anchor}`,
      }),
    ).toMatchObject({
      valueText: 'Current: 40%',
      description: 'Next: 60%',
    });
  });
});
