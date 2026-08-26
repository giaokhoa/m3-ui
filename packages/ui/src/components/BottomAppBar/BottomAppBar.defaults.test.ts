import { describe, expect, it } from 'vitest';
import {
  bottomAppBarHeight,
  bottomAppBarRuntime,
  bottomAppBarTokens,
  clampBottomAppBarFraction,
  getBottomAppBarStyle,
  shouldCollapseBottomAppBar,
} from './BottomAppBar.defaults';
import {
  createBottomAppBarState,
  settleBottomAppBarState,
} from './BottomAppBar';

describe('BottomAppBar defaults', () => {
  it('projects the canonical regular BottomAppBar token family', () => {
    expect(bottomAppBarTokens.containerColor).toBe('var(--surface-container)');
    expect(bottomAppBarTokens.containerElevation).toBe('level2');
    expect(bottomAppBarTokens.containerHeight).toBe('80px');
    expect(bottomAppBarTokens.containerShape).toBe('none');
  });

  it('projects the pinned DockedToolbar geometry used by FlexibleBottomAppBar', () => {
    expect(bottomAppBarTokens.flexibleContainerHeight).toBe('64px');
    expect(bottomAppBarTokens.flexibleLeadingSpace).toBe('16px');
    expect(bottomAppBarTokens.flexibleTrailingSpace).toBe('16px');
    expect(bottomAppBarTokens.flexibleMinSpacing).toBe('4px');
    expect(bottomAppBarTokens.flexibleMaxSpacing).toBe('32px');
    expect(bottomAppBarTokens.flexibleContainerElevation).toBe('level0');
  });

  it('keeps AndroidX content and FAB renderer insets beside the consumer', () => {
    expect(bottomAppBarRuntime.contentHorizontalPadding).toBe(4);
    expect(bottomAppBarRuntime.contentTopPadding).toBe(4);
    expect(bottomAppBarRuntime.fabHorizontalPadding).toBe(12);
    expect(bottomAppBarRuntime.fabVerticalPadding).toBe(8);
    expect(bottomAppBarRuntime.snapThreshold).toBe(0.5);
  });

  it('collapses the entire app bar height from the controlled fraction', () => {
    expect(getBottomAppBarStyle('regular', 0)['--_bottom-app-bar-height']).toBe('80px');
    expect(getBottomAppBarStyle('regular', 0.25)['--_bottom-app-bar-height']).toBe('60px');
    expect(getBottomAppBarStyle('regular', 1)['--_bottom-app-bar-height']).toBe('0px');
    expect(getBottomAppBarStyle('flexible', 0)['--_bottom-app-bar-height']).toBe('64px');
  });

  it('accepts only positive finite flexible expanded-height overrides', () => {
    expect(bottomAppBarHeight('flexible', 96)).toBe(96);
    expect(bottomAppBarHeight('flexible', 0)).toBe(64);
    expect(bottomAppBarHeight('flexible', Number.POSITIVE_INFINITY)).toBe(64);
  });

  it('clamps state and settles intermediate fractions at the AndroidX 50 percent threshold', () => {
    expect(clampBottomAppBarFraction(-1)).toBe(0);
    expect(clampBottomAppBarFraction(2)).toBe(1);
    expect(shouldCollapseBottomAppBar(0.49)).toBe(false);
    expect(shouldCollapseBottomAppBar(0.5)).toBe(true);
    expect(settleBottomAppBarState(createBottomAppBarState(0.49)).collapsedFraction).toBe(0);
    expect(settleBottomAppBarState(createBottomAppBarState(0.5)).collapsedFraction).toBe(1);
  });
});
