import { describe, expect, it, vi } from 'vitest';
import {
  DrawerState,
  DrawerValue,
  calculateDrawerAnchors,
  calculateDrawerFraction,
  resolveDrawerTarget,
} from './DrawerState';

describe('DrawerState', () => {
  it('uses the measured width for Closed/Open anchors', () => {
    expect(calculateDrawerAnchors(360)).toEqual({
      closed: -360,
      open: 0,
    });
  });

  it('clamps scrim progress to the anchor interval', () => {
    const anchors = calculateDrawerAnchors(360);
    expect(calculateDrawerFraction(-500, anchors)).toBe(0);
    expect(calculateDrawerFraction(-180, anchors)).toBe(0.5);
    expect(calculateDrawerFraction(20, anchors)).toBe(1);
  });

  it('settles by the AndroidX 50% positional threshold', () => {
    const anchors = calculateDrawerAnchors(360);
    expect(
      resolveDrawerTarget({
        currentValue: DrawerValue.Closed,
        offset: -181,
        velocity: 0,
        anchors,
      }),
    ).toBe(DrawerValue.Closed);
    expect(
      resolveDrawerTarget({
        currentValue: DrawerValue.Closed,
        offset: -180,
        velocity: 0,
        anchors,
      }),
    ).toBe(DrawerValue.Open);
    expect(
      resolveDrawerTarget({
        currentValue: DrawerValue.Open,
        offset: -180,
        velocity: 0,
        anchors,
      }),
    ).toBe(DrawerValue.Closed);
  });

  it('lets 400px/s logical velocity choose the adjacent anchor', () => {
    const anchors = calculateDrawerAnchors(360);
    expect(
      resolveDrawerTarget({
        currentValue: DrawerValue.Closed,
        offset: -350,
        velocity: 400,
        anchors,
      }),
    ).toBe(DrawerValue.Open);
    expect(
      resolveDrawerTarget({
        currentValue: DrawerValue.Open,
        offset: -10,
        velocity: -400,
        anchors,
      }),
    ).toBe(DrawerValue.Closed);
  });

  it('supports vetoable imperative transitions and subscriptions', () => {
    const confirm = vi.fn((value: DrawerValue) => value !== DrawerValue.Closed);
    const state = new DrawerState({
      initialValue: DrawerValue.Open,
      confirmStateChange: confirm,
    });
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);

    expect(state.close()).toBe(false);
    expect(state.isOpen).toBe(true);
    expect(listener).not.toHaveBeenCalled();
    expect(state.snapTo(DrawerValue.Open)).toBe(true);

    unsubscribe();
    expect(confirm).toHaveBeenCalledWith(DrawerValue.Closed);
  });
});
