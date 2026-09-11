import { describe, expect, it } from 'vitest';
import { PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionState unmeasured width parity', () => {
  it('treats a direct width as unspecified until maxExpansionWidth is measured', () => {
    const state = new PaneExpansionState();

    state.setFirstPaneWidth(600);
    expect(state.isUnspecified()).toBe(true);

    state.onMeasured(1000);
    expect(state.isUnspecified()).toBe(false);
    expect(state.getLayoutState(1000).firstPaneWidth).toBe(600);
  });

  it('still treats a direct proportion as specified before measurement', () => {
    const state = new PaneExpansionState();

    state.setFirstPaneProportion(0.4);
    expect(state.isUnspecified()).toBe(false);
  });
});
