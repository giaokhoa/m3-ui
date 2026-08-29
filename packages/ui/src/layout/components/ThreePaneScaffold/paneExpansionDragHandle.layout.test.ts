import { describe, expect, it } from 'vitest';
import { calculatePaneExpansionDragHandlePlacement } from './paneExpansionDragHandle.layout';

const base = {
  contentWidth: 1000,
  partitionSpacerSize: '24px',
  minTouchTargetSize: 48,
} as const;

describe('pane expansion drag-handle placement', () => {
  it('keeps the split-centered minimum target away from outer edges', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({ ...base, offsetX: 500 }),
    ).toEqual({ centerX: 500, minWidth: 48 });
    expect(
      calculatePaneExpansionDragHandlePlacement({ ...base, offsetX: 24 }),
    ).toEqual({ centerX: 24, minWidth: 48 });
  });

  it('matches AndroidX edge clamping and width expansion at the start edge', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
    });

    expect(placement).toEqual({ centerX: 12, minWidth: 72 });
    // The 72px box spans -24..48 and is clipped by the scaffold at x=0,
    // leaving the full 48px minimum interactive target inside the scaffold.
    expect(placement.centerX + placement.minWidth / 2).toBe(48);
  });

  it('mirrors the same target preservation at the end edge', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 1000,
    });

    expect(placement).toEqual({ centerX: 988, minWidth: 72 });
    expect(
      base.contentWidth - (placement.centerX - placement.minWidth / 2),
    ).toBe(48);
  });

  it('preserves the minimum target with no partition spacer', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
      partitionSpacerSize: '0px',
    });

    expect(placement).toEqual({ centerX: 0, minWidth: 96 });
    expect(placement.centerX + placement.minWidth / 2).toBe(48);
  });

  it('uses a caller-provided minimum target size in the same edge formula', () => {
    const placement = calculatePaneExpansionDragHandlePlacement({
      ...base,
      offsetX: 0,
      minTouchTargetSize: 64,
    });

    expect(placement).toEqual({ centerX: 12, minWidth: 104 });
    expect(placement.centerX + placement.minWidth / 2).toBe(64);
  });

  it('preserves a valid clamp when the scaffold is narrower than its spacer', () => {
    expect(
      calculatePaneExpansionDragHandlePlacement({
        offsetX: 0,
        contentWidth: 16,
        partitionSpacerSize: '24px',
        minTouchTargetSize: 48,
      }),
    ).toEqual({ centerX: 8, minWidth: 80 });
  });
});
