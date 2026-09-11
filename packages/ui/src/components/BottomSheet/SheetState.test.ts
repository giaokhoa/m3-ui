import { describe, expect, it, vi } from 'vitest';
import {
  SheetState,
  SheetValue,
  calculateSheetAnchors,
  dampenSheetVelocity,
  resolveSheetTarget,
} from './SheetState';

describe('BottomSheet SheetState', () => {
  it('calculates AndroidX deterministic anchors for tall and short sheets', () => {
    expect(
      calculateSheetAnchors({
        viewportHeight: 800,
        sheetHeight: 600,
      }),
    ).toEqual({
      [SheetValue.Hidden]: 800,
      [SheetValue.PartiallyExpanded]: 400,
      [SheetValue.Expanded]: 200,
    });

    expect(
      calculateSheetAnchors({
        viewportHeight: 800,
        sheetHeight: 300,
      }),
    ).toEqual({
      [SheetValue.Hidden]: 800,
      [SheetValue.PartiallyExpanded]: 500,
      [SheetValue.Expanded]: 500,
    });
  });

  it('accepts an explicit partially-expanded visible height for scaffold peek anchors', () => {
    expect(
      calculateSheetAnchors({
        viewportHeight: 800,
        sheetHeight: 600,
        partialExpandedHeight: 56,
      }),
    ).toEqual({
      [SheetValue.Hidden]: 800,
      [SheetValue.PartiallyExpanded]: 744,
      [SheetValue.Expanded]: 200,
    });
  });

  it('uses the 56px positional threshold and advances one enabled anchor', () => {
    const anchors = calculateSheetAnchors({
      viewportHeight: 800,
      sheetHeight: 600,
    });

    expect(
      resolveSheetTarget({
        currentValue: SheetValue.Expanded,
        offset: 250,
        velocity: 0,
        anchors,
      }),
    ).toBe(SheetValue.Expanded);

    expect(
      resolveSheetTarget({
        currentValue: SheetValue.Expanded,
        offset: 270,
        velocity: 0,
        anchors,
      }),
    ).toBe(SheetValue.PartiallyExpanded);

    expect(
      resolveSheetTarget({
        currentValue: SheetValue.PartiallyExpanded,
        offset: 470,
        velocity: 0,
        anchors,
      }),
    ).toBe(SheetValue.Hidden);
  });

  it('uses velocity direction above 125px/s even before the positional threshold', () => {
    const anchors = calculateSheetAnchors({
      viewportHeight: 800,
      sheetHeight: 600,
    });

    expect(
      resolveSheetTarget({
        currentValue: SheetValue.PartiallyExpanded,
        offset: 420,
        velocity: -180,
        anchors,
      }),
    ).toBe(SheetValue.Expanded);

    expect(
      resolveSheetTarget({
        currentValue: SheetValue.PartiallyExpanded,
        offset: 390,
        velocity: 180,
        anchors,
      }),
    ).toBe(SheetValue.Hidden);
  });

  it('promotes a converged partial anchor to Expanded for short sheets', () => {
    const anchors = calculateSheetAnchors({
      viewportHeight: 800,
      sheetHeight: 300,
    });
    const state = new SheetState({
      initialValue: SheetValue.PartiallyExpanded,
    });

    expect(state.reconcileAnchors(anchors)).toBe(true);
    expect(state.currentValue).toBe(SheetValue.Expanded);
    expect(
      resolveSheetTarget({
        currentValue: SheetValue.PartiallyExpanded,
        offset: 500,
        velocity: 0,
        anchors,
      }),
    ).toBe(SheetValue.Expanded);
  });

  it('ports near-hidden velocity dampening without dropping a valid fling below threshold', () => {
    const anchors = calculateSheetAnchors({
      viewportHeight: 800,
      sheetHeight: 600,
    });

    expect(dampenSheetVelocity(500, 750, anchors)).toBe(125);
    expect(dampenSheetVelocity(100, 750, anchors)).toBeCloseTo(16);
    expect(dampenSheetVelocity(-500, 750, anchors)).toBe(-500);
  });

  it('exposes Compose-like imperative transitions and respects confirmValueChange', () => {
    const confirmValueChange = vi.fn(
      (value: string) => value !== SheetValue.Hidden,
    );
    const state = new SheetState({ confirmValueChange });

    expect(state.show()).toBe(true);
    expect(state.currentValue).toBe(SheetValue.PartiallyExpanded);
    expect(state.expand()).toBe(true);
    expect(state.currentValue).toBe(SheetValue.Expanded);
    expect(state.partialExpand()).toBe(true);
    expect(state.currentValue).toBe(SheetValue.PartiallyExpanded);
    expect(state.hide()).toBe(false);
    expect(state.isVisible).toBe(true);
    expect(confirmValueChange).toHaveBeenLastCalledWith(SheetValue.Hidden);
  });

  it('requires Expanded and rejects commands for disabled states', () => {
    expect(
      () =>
        new SheetState({
          enabledValues: [SheetValue.Hidden],
          initialValue: SheetValue.Hidden,
        }),
    ).toThrow('Expanded must be one of the enabled sheet values.');

    const expandedOnly = new SheetState({
      enabledValues: [SheetValue.Expanded],
      initialValue: SheetValue.Expanded,
    });
    expect(() => expandedOnly.partialExpand()).toThrow(
      'PartiallyExpanded is disabled',
    );
    expect(() => expandedOnly.hide()).toThrow(
      'Hidden is not an enabled sheet value',
    );
  });
});
