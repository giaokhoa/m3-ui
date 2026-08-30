import { describe, expect, it } from 'vitest';
import {
  createFloatingToolbarState,
  floatingToolbarCollapsedFraction,
  floatingToolbarRuntime,
  floatingToolbarTokens,
  getFloatingToolbarStyle,
  getFloatingToolbarTranslation,
  resolveFloatingToolbarElevation,
  setFloatingToolbarOffset,
  settleFloatingToolbarState,
  shouldCollapseFloatingToolbar,
} from './FloatingToolbar.defaults';

describe('FloatingToolbar defaults', () => {
  it('projects the pinned Compose floating toolbar token geometry', () => {
    expect(floatingToolbarTokens.containerHeight).toBe('64px');
    expect(floatingToolbarTokens.leadingSpace).toBe('8px');
    expect(floatingToolbarTokens.trailingSpace).toBe('8px');
    expect(floatingToolbarTokens.betweenSpace).toBe('4px');
    expect(floatingToolbarTokens.externalPadding).toBe('16px');
    expect(floatingToolbarTokens.shape).toBe('full');
    expect(floatingToolbarRuntime.scrollDistanceThreshold).toBe(40);
    expect(floatingToolbarRuntime.toolbarToFabGap).toBe(8);
  });

  it('keeps pinned runtime colors separate from Web-only toolbar variants', () => {
    expect(
      getFloatingToolbarStyle('standard', true, false)[
        '--_floating-toolbar-container-color'
      ],
    ).toBe('var(--surface-container)');
    expect(
      getFloatingToolbarStyle('standard', true, false)[
        '--_floating-toolbar-content-color'
      ],
    ).toBe('var(--on-surface)');
    expect(
      getFloatingToolbarStyle('vibrant', true, false)[
        '--_floating-toolbar-container-color'
      ],
    ).toBe('var(--primary-container)');
    expect(
      getFloatingToolbarStyle('vibrant', true, false)[
        '--_floating-toolbar-content-color'
      ],
    ).toBe('var(--on-primary-container)');
  });

  it('chooses Level0 without FAB and Level1 only for the expanded toolbar part with FAB', () => {
    expect(resolveFloatingToolbarElevation(true, false)).toBe('level0');
    expect(resolveFloatingToolbarElevation(false, false)).toBe('level0');
    expect(resolveFloatingToolbarElevation(true, true)).toBe('level1');
    expect(resolveFloatingToolbarElevation(false, true)).toBe('level0');
    expect(
      getFloatingToolbarStyle('standard', true, true),
    ).not.toHaveProperty('--_floating-toolbar-box-shadow');
  });

  it('uses the pinned FAB range with the FAB smallest when toolbar is expanded', () => {
    expect(floatingToolbarTokens.fabBaselineSize).toBe('56px');
    expect(floatingToolbarTokens.fabMediumSize).toBe('80px');
    expect(
      getFloatingToolbarStyle('standard', true, true)['--_floating-toolbar-fab-size'],
    ).toBe('56px');
    expect(
      getFloatingToolbarStyle('standard', false, true)['--_floating-toolbar-fab-size'],
    ).toBe('80px');
    expect(
      getFloatingToolbarStyle('standard', true, true)[
        '--_floating-toolbar-fab-max-size'
      ],
    ).toBe('80px');
  });

  it('coerces the hoisted offset between offsetLimit and zero', () => {
    const state = createFloatingToolbarState(-64, -20, 8);
    expect(state).toEqual({ offsetLimit: -64, offset: -20, contentOffset: 8 });
    expect(setFloatingToolbarOffset(state, -100).offset).toBe(-64);
    expect(setFloatingToolbarOffset(state, 10).offset).toBe(0);
  });

  it('settles at the pinned 50 percent threshold', () => {
    const before = createFloatingToolbarState(-64, -31, 0);
    const after = createFloatingToolbarState(-64, -33, 0);
    expect(floatingToolbarCollapsedFraction(before)).toBeCloseTo(31 / 64);
    expect(shouldCollapseFloatingToolbar(before)).toBe(false);
    expect(settleFloatingToolbarState(before).offset).toBe(0);
    expect(shouldCollapseFloatingToolbar(after)).toBe(true);
    expect(settleFloatingToolbarState(after).offset).toBe(-64);
  });

  it('maps logical exit directions through layout direction', () => {
    const state = createFloatingToolbarState(-64, -24, 0);
    expect(getFloatingToolbarTranslation(state, 'top')).toBe('translateY(-24px)');
    expect(getFloatingToolbarTranslation(state, 'bottom')).toBe('translateY(24px)');
    expect(getFloatingToolbarTranslation(state, 'start', 'ltr')).toBe(
      'translateX(-24px)',
    );
    expect(getFloatingToolbarTranslation(state, 'start', 'rtl')).toBe(
      'translateX(24px)',
    );
    expect(getFloatingToolbarTranslation(state, 'end', 'ltr')).toBe(
      'translateX(24px)',
    );
  });

  it('allows explicit web color, shape, padding and elevation overrides', () => {
    const style = getFloatingToolbarStyle('standard', true, false, {
      containerColor: 'tomato',
      contentColor: 'white',
      shape: 12,
      contentPadding: 4,
      expandedElevation: 'level1',
    });
    expect(style['--_floating-toolbar-container-color']).toBe('tomato');
    expect(style['--_floating-toolbar-content-color']).toBe('white');
    expect(style['--_floating-toolbar-container-radius']).toBe('12px');
    expect(style['--_floating-toolbar-content-padding']).toBe('4px');
    expect(style).not.toHaveProperty('--_floating-toolbar-box-shadow');
    expect(
      resolveFloatingToolbarElevation(true, false, {
        expandedElevation: 'level1',
      }),
    ).toBe('level1');
    expect(
      resolveFloatingToolbarElevation(false, true, {
        collapsedElevation: 'level2',
      }),
    ).toBe('level2');
  });
});
