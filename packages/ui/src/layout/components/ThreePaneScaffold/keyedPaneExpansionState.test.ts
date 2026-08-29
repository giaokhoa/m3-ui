import { describe, expect, it, vi } from 'vitest';
import {
  PaneExpansionState,
  PaneExpansionUnspecified,
} from '../../adaptive/paneExpansionState';
import { KeyedPaneExpansionStateCache } from './keyedPaneExpansionState';

describe('KeyedPaneExpansionStateCache', () => {
  it('keeps one public PaneExpansionState identity while restoring each keyed value', () => {
    const cache = new KeyedPaneExpansionStateCache();
    const state = cache.select('primary:secondary');
    expect(state).toBeInstanceOf(PaneExpansionState);
    state.onMeasured(1000);
    state.setFirstPaneWidth(400);

    const switched = cache.select('primary:tertiary');
    expect(switched).toBe(state);
    expect(switched.getLayoutState(1000).firstPaneWidth).toBe(PaneExpansionUnspecified);

    switched.setFirstPaneWidth(650);
    expect(switched.getLayoutState(1000).firstPaneWidth).toBe(650);

    const restored = cache.select('primary:secondary');
    expect(restored).toBe(state);
    expect(restored.getLayoutState(1000).firstPaneWidth).toBe(400);

    cache.select('primary:tertiary');
    expect(state.getLayoutState(1000).firstPaneWidth).toBe(650);
  });

  it('seeds newly selected keyed states with the latest scaffold measurement', () => {
    const cache = new KeyedPaneExpansionStateCache();
    const state = cache.select('primary:secondary');
    state.onMeasured(1000);
    state.onExpansionOffsetMeasured(500);
    state.dispatchRawDelta(100);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(600);

    cache.select('primary:tertiary');
    state.onExpansionOffsetMeasured(500);
    state.dispatchRawDelta(125);
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(625);

    cache.select('primary:secondary');
    expect(state.getLayoutState(1000).currentDraggingOffset).toBe(600);
  });

  it('forwards active keyed-state notifications through the stable facade', () => {
    const cache = new KeyedPaneExpansionStateCache();
    const state = cache.select('primary:secondary');
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);

    state.setFirstPaneWidth(320);
    expect(listener).toHaveBeenCalledTimes(1);

    cache.select('primary:tertiary');
    state.setFirstPaneWidth(480);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    state.setFirstPaneWidth(500);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
