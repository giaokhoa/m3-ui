import { describe, expect, it } from 'vitest';
import { SheetState, SheetValue } from '../BottomSheet';
import {
  bottomSheetScaffoldDefaults,
  getBottomSheetScaffoldMetrics,
} from './BottomSheetScaffold';

function createPartialState() {
  return new SheetState({
    enabledValues: [SheetValue.PartiallyExpanded, SheetValue.Expanded],
    initialValue: SheetValue.PartiallyExpanded,
  });
}

describe('BottomSheetScaffold metrics', () => {
  it('reserves the default 56px peek and uses it as the partial anchor', () => {
    expect(bottomSheetScaffoldDefaults.peekHeight).toBe(56);
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 800,
        sheetHeight: 600,
        peekHeight: 56,
        state: createPartialState(),
      }),
    ).toEqual({
      visibleHeight: 56,
      reserveHeight: 56,
    });
  });

  it('uses the full sheet height when expanded while keeping peek reservation', () => {
    const state = createPartialState();
    state.expand();
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 800,
        sheetHeight: 600,
        peekHeight: 80,
        state,
      }),
    ).toEqual({
      visibleHeight: 600,
      reserveHeight: 80,
    });
  });

  it('keeps body peek reservation when Hidden is enabled and selected', () => {
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
      visibleHeight: 0,
      reserveHeight: 72,
    });
  });

  it('clamps an oversized peek to the scaffold height', () => {
    expect(
      getBottomSheetScaffoldMetrics({
        rootHeight: 80,
        sheetHeight: 120,
        peekHeight: 96,
        state: createPartialState(),
      }),
    ).toEqual({
      visibleHeight: 80,
      reserveHeight: 80,
    });
  });
});
