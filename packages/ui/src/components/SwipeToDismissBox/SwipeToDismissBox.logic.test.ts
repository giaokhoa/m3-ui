import { describe, expect, it } from 'vitest';
import {
  SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD,
  dismissValueForLogicalOffset,
  resolveSwipeToDismissTarget,
} from './SwipeToDismissBox.logic';

describe('SwipeToDismissBox settling', () => {
  it('locks the pinned 56px positional threshold', () => {
    expect(SWIPE_TO_DISMISS_POSITIONAL_THRESHOLD).toBe(56);
    expect(resolveSwipeToDismissTarget({
      logicalOffset: 55,
      logicalVelocity: 0,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: true,
    })).toBe('settled');
    expect(resolveSwipeToDismissTarget({
      logicalOffset: 56,
      logicalVelocity: 0,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: true,
    })).toBe('start-to-end');
  });

  it('resolves both logical directions and respects disabled anchors', () => {
    expect(resolveSwipeToDismissTarget({
      logicalOffset: -80,
      logicalVelocity: 0,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: true,
    })).toBe('end-to-start');
    expect(resolveSwipeToDismissTarget({
      logicalOffset: -80,
      logicalVelocity: 0,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: false,
    })).toBe('settled');
    expect(resolveSwipeToDismissTarget({
      logicalOffset: 80,
      logicalVelocity: 0,
      enableDismissFromStartToEnd: false,
      enableDismissFromEndToStart: true,
    })).toBe('settled');
  });

  it('uses the pinned velocity threshold for deterministic flings', () => {
    expect(resolveSwipeToDismissTarget({
      logicalOffset: 12,
      logicalVelocity: 125,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: true,
    })).toBe('start-to-end');
    expect(resolveSwipeToDismissTarget({
      logicalOffset: -12,
      logicalVelocity: -125,
      enableDismissFromStartToEnd: true,
      enableDismissFromEndToStart: true,
    })).toBe('end-to-start');
  });

  it('derives logical direction from offset', () => {
    expect(dismissValueForLogicalOffset(1)).toBe('start-to-end');
    expect(dismissValueForLogicalOffset(-1)).toBe('end-to-start');
    expect(dismissValueForLogicalOffset(0)).toBe('settled');
  });
});
