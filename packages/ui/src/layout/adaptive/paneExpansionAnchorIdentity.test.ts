import { describe, expect, it } from 'vitest';
import { PaneExpansionAnchor, PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionAnchor identity equality', () => {
  it('accepts the same NaN proportion anchor object before measurement', async () => {
    const anchor = PaneExpansionAnchor.proportion(Number.NaN);
    const state = new PaneExpansionState({ anchors: [anchor] });

    await expect(state.animateTo(anchor)).resolves.toBeUndefined();
    expect(state.currentAnchor).toBe(anchor);
  });

  it('rejects a distinct NaN proportion anchor object', async () => {
    const anchor = PaneExpansionAnchor.proportion(Number.NaN);
    const state = new PaneExpansionState({ anchors: [anchor] });

    await expect(
      state.animateTo(PaneExpansionAnchor.proportion(Number.NaN)),
    ).rejects.toThrow(RangeError);
  });
});
