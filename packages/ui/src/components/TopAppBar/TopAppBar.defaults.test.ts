import { describe, expect, it } from 'vitest';
import {
  clampScrollFraction,
  getTopAppBarStyle,
  topAppBarExpandedHeight,
  topAppBarRuntime,
  topAppBarTokens,
} from './TopAppBar.defaults';
import {
  TopAppBarDefaults,
  createTopAppBarState,
} from './TopAppBar';

describe('TopAppBar defaults', () => {
  it('maps the canonical app-bar token family without rewriting source tokens', () => {
    expect(topAppBarTokens.smallHeight).toBe('64px');
    expect(topAppBarTokens.mediumHeight).toBe('112px');
    expect(topAppBarTokens.mediumFlexibleHeight).toBe('112px');
    expect(topAppBarTokens.mediumFlexibleLargeHeight).toBe('136px');
    expect(topAppBarTokens.largeHeight).toBe('152px');
    expect(topAppBarTokens.largeFlexibleHeight).toBe('120px');
    expect(topAppBarTokens.largeFlexibleLargeHeight).toBe('152px');
  });

  it('keeps AndroidX layout runtime constants beside the UI consumer', () => {
    expect(topAppBarRuntime.horizontalPadding).toBe(4);
    expect(topAppBarRuntime.titleInset).toBe(16);
    expect(topAppBarRuntime.mediumTitleBottomPadding).toBe(24);
    expect(topAppBarRuntime.largeTitleBottomPadding).toBe(28);
  });

  it('selects subtitle-sensitive flexible expanded heights', () => {
    expect(topAppBarExpandedHeight('medium-flexible', false)).toBe(112);
    expect(topAppBarExpandedHeight('medium-flexible', true)).toBe(136);
    expect(topAppBarExpandedHeight('large-flexible', false)).toBe(120);
    expect(topAppBarExpandedHeight('large-flexible', true)).toBe(152);
  });

  it('interpolates height and switches to the canonical scrolled container', () => {
    const expanded = getTopAppBarStyle('large', 0);
    const halfway = getTopAppBarStyle('large', 0.5);
    const collapsed = getTopAppBarStyle('large', 1);

    expect(expanded['--_top-app-bar-height']).toBe('152px');
    expect(halfway['--_top-app-bar-height']).toBe('108px');
    expect(collapsed['--_top-app-bar-height']).toBe('64px');
    expect(expanded['--_top-app-bar-container-color']).toBe(
      topAppBarTokens.containerColor,
    );
    expect(collapsed['--_top-app-bar-container-color']).toBe(
      topAppBarTokens.scrolledContainerColor,
    );
  });

  it('uses overlap, not collapse, for pinned/single-row scrolled visuals', () => {
    const resting = getTopAppBarStyle('small', 0, false, {}, 0);
    const tinyOverlap = getTopAppBarStyle('small', 0, false, {}, 0.01);
    const overlapped = getTopAppBarStyle('small', 0, false, {}, 0.02);

    expect(resting['--_top-app-bar-container-color']).toBe(
      topAppBarTokens.containerColor,
    );
    expect(tinyOverlap['--_top-app-bar-container-color']).toBe(
      topAppBarTokens.containerColor,
    );
    expect(overlapped['--_top-app-bar-container-color']).toBe(
      topAppBarTokens.scrolledContainerColor,
    );
  });

  it('clamps controlled state and preserves scroll-behavior concepts', () => {
    expect(clampScrollFraction(-1)).toBe(0);
    expect(clampScrollFraction(2)).toBe(1);
    expect(clampScrollFraction(Number.NaN)).toBe(0);

    const state = createTopAppBarState(1.5, 32, 0.5);
    expect(state).toEqual({
      collapsedFraction: 1,
      overlappedFraction: 0.5,
      contentOffset: 32,
    });
    expect(TopAppBarDefaults.pinnedScrollBehavior(state)).toEqual({
      type: 'pinned',
      state,
    });
    expect(TopAppBarDefaults.enterAlwaysScrollBehavior(state).type).toBe(
      'enter-always',
    );
    expect(TopAppBarDefaults.exitUntilCollapsedScrollBehavior(state).type).toBe(
      'exit-until-collapsed',
    );
  });
});
