import { describe, expect, it, vi } from 'vitest';
import {
  WideNavigationRailState,
  WideNavigationRailValue,
} from './WideNavigationRailState';

describe('WideNavigationRailState', () => {
  it('starts collapsed by default', () => {
    const state = new WideNavigationRailState();
    expect(state.currentValue).toBe(WideNavigationRailValue.Collapsed);
    expect(state.targetValue).toBe(WideNavigationRailValue.Collapsed);
    expect(state.isCollapsed).toBe(true);
    expect(state.isExpanded).toBe(false);
  });

  it('expands, collapses and toggles synchronously while renderer owns motion', () => {
    const state = new WideNavigationRailState();
    expect(state.expand()).toBe(true);
    expect(state.isExpanded).toBe(true);
    expect(state.toggle()).toBe(true);
    expect(state.isCollapsed).toBe(true);
    expect(state.toggle()).toBe(true);
    expect(state.isExpanded).toBe(true);
    expect(state.collapse()).toBe(true);
    expect(state.isCollapsed).toBe(true);
  });

  it('supports an expanded initial value and snapTo', () => {
    const state = new WideNavigationRailState({
      initialValue: WideNavigationRailValue.Expanded,
    });
    expect(state.isExpanded).toBe(true);
    expect(state.snapTo(WideNavigationRailValue.Collapsed)).toBe(true);
    expect(state.currentValue).toBe(WideNavigationRailValue.Collapsed);
  });

  it('notifies subscribers only when the logical value changes', () => {
    const state = new WideNavigationRailState();
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);
    state.collapse();
    expect(listener).not.toHaveBeenCalled();
    state.expand();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    state.collapse();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
