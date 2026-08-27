import { describe, expect, it } from 'vitest';
import { SheetState, SheetValue } from '../BottomSheet';
import {
  bottomSheetScaffoldDefaults,
  getBottomSheetScaffoldMetrics,
} from './BottomSheetScaffold';

describe('BottomSheetScaffold metrics', () => {
  const state = new SheetState({
    enabledValues: [SheetValue.PartiallyExpanded, SheetValue.Expanded],
    initialValue: SheetValue.PartiallyExpanded,
  });

  it('reserves the default 56px peek and adapts BottomSheet half-height anchor', () => {
    expect(bottomSheetScaffoldDefaults.peekHeight).toBe(56);
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 800,
        sheetHeight: 600,
        peekHeight: 56,
        state,
      }),
    ).toEqual({
      externalOffset: 344,
      visibleHeight: 56,
      reserveHeight: 56,
    });
  });

  it('uses the full sheet height when expanded', () => {
    state.expand();
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 800,
        sheetHeight: 600,
        peekHeight: 80,
        state,
      }),
    ).toEqual({
      externalOffset: 0,
      visibleHeight: 600,
      reserveHeight: 80,
    });
  });

  it('removes reservation and visible height when Hidden is enabled and selected', () => {
    const hiddenState = new SheetState({
      enabledValues: [
        SheetValue.Hidden,
        SheetValue.PartiallyExpanded,
        SheetValue.Expanded,
      ],
      initialValue: SheetValue.Hidden,
    });

    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 720,
        sheetHeight: 500,
        peekHeight: 72,
        state: hiddenState,
      }),
    ).toEqual({
      externalOffset: 0,
      visibleHeight: 0,
      reserveHeight: 0,
    });
  });

  it('clamps an oversized peek to the available sheet height', () => {
    const partial = new SheetState({
      enabledValues: [SheetValue.PartiallyExpanded, SheetValue.Expanded],
      initialValue: SheetValue.PartiallyExpanded,
    });
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 800,
        sheetHeight: 40,
        peekHeight: 96,
        state: partial,
      }),
    ).toEqual({
      externalOffset: 0,
      visibleHeight: 40,
      reserveHeight: 40,
    });
  });
});
