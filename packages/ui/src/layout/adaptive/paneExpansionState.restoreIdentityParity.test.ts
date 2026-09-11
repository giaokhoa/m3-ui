import { describe, expect, it } from 'vitest';
import { PaneExpansionAnchor, PaneExpansionState } from './paneExpansionState';

describe('PaneExpansionState restore anchor identity', () => {
  it('keeps the existing currentAnchor when the new list still contains an equal anchor', async () => {
    const originalListedAnchor = PaneExpansionAnchor.proportion(0.5);
    const currentAnchor = PaneExpansionAnchor.proportion(0.5);
    const state = new PaneExpansionState({
      anchors: [originalListedAnchor],
      animation: async ({ to, update }) => update(to),
    });
    state.onMeasured(1000);
    await state.animateTo(currentAnchor);

    const replacementListedAnchor = PaneExpansionAnchor.proportion(0.5);
    state.setAnchors([replacementListedAnchor]);

    expect(currentAnchor).not.toBe(originalListedAnchor);
    expect(replacementListedAnchor).not.toBe(currentAnchor);
    expect(state.currentAnchor).toBe(currentAnchor);
  });
});
