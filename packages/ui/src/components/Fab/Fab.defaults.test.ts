import { describe, expect, it } from 'vitest';
import {
  brandedExtendedFabTokens,
  brandedFabTokens,
  extendedFabSizeTokens,
  fabSizeTokens,
  getBrandedExtendedFabStyle,
  getBrandedFabStyle,
  getExtendedFabStyle,
  getFabStyle,
} from './Fab.defaults';

describe('FAB defaults', () => {
  it('maps all Compose FAB visual sizes while preserving the 48px minimum target', () => {
    expect(fabSizeTokens.small).toMatchObject({ height: 40, width: 40, iconSize: 24 });
    expect(fabSizeTokens.baseline).toMatchObject({ height: 56, width: 56, iconSize: 24 });
    expect(fabSizeTokens.medium).toMatchObject({ height: 80, width: 80, iconSize: 28 });
    expect(fabSizeTokens.large).toMatchObject({ height: 96, width: 96, iconSize: 36 });

    const small = getFabStyle('small') as Record<string, string | number>;
    const baseline = getFabStyle('baseline') as Record<string, string | number>;
    expect(small['--_fab-target-size']).toBe('48px');
    expect(small['--_fab-container-height']).toBe('40px');
    expect(baseline['--_fab-target-size']).toBe('56px');
  });

  it('uses effective runtime shapes including the medium LargeIncreased TODO resolution', () => {
    const small = getFabStyle('small') as Record<string, string | number>;
    const baseline = getFabStyle('baseline') as Record<string, string | number>;
    const medium = getFabStyle('medium') as Record<string, string | number>;
    const large = getFabStyle('large') as Record<string, string | number>;

    expect(small['--_fab-container-radius']).toBe('12px');
    expect(baseline['--_fab-container-radius']).toBe('16px');
    expect(medium['--_fab-container-radius']).toBe('20px');
    expect(large['--_fab-container-radius']).toBe('28px');
  });

  it('defaults to Compose primary-container roles and preserves explicit color overrides', () => {
    const defaults = getFabStyle('baseline') as Record<string, string | number>;
    const custom = getFabStyle('baseline', {
      variant: 'tertiary',
      containerColor: 'rebeccapurple',
      contentColor: 'white',
    }) as Record<string, string | number>;

    expect(defaults['--_fab-container-color']).toBe('var(--primary-container)');
    expect(defaults['--_fab-content-color']).toBe('var(--on-primary-container)');
    expect(custom['--_fab-container-color']).toBe('rebeccapurple');
    expect(custom['--_fab-content-color']).toBe('white');
  });

  it('projects Compose container roles and pinned Material Web public variants', () => {
    const expected = {
      primaryContainer: ['var(--primary-container)', 'var(--on-primary-container)'],
      secondaryContainer: ['var(--secondary-container)', 'var(--on-secondary-container)'],
      tertiaryContainer: ['var(--tertiary-container)', 'var(--on-tertiary-container)'],
      surface: ['var(--surface-container-high)', 'var(--primary)'],
      primary: ['var(--primary)', 'var(--on-primary)'],
      secondary: ['var(--secondary)', 'var(--on-secondary)'],
      tertiary: ['var(--tertiary)', 'var(--on-tertiary)'],
    } as const;

    for (const [variant, [containerColor, contentColor]] of Object.entries(expected)) {
      const style = getFabStyle('baseline', {
        variant: variant as keyof typeof expected,
      }) as Record<string, string | number>;
      expect(style['--_fab-container-color']).toBe(containerColor);
      expect(style['--_fab-content-color']).toBe(contentColor);
      expect(style['--_fab-state-layer-color']).toBe(contentColor);
    }

    const loweredSurface = getFabStyle('baseline', {
      variant: 'surface',
      elevation: 'lowered',
    }) as Record<string, string | number>;
    expect(loweredSurface['--_fab-container-color']).toBe('var(--surface-container-low)');
    expect(loweredSurface['--_fab-content-color']).toBe('var(--primary)');
  });

  it('maps the current fixed-size branded FAB without forcing logo content color', () => {
    expect(brandedFabTokens).toMatchObject({
      height: 56,
      width: 56,
      iconSize: 36,
      shape: 'large',
      containerColor: 'var(--surface-container-high)',
      loweredContainerColor: 'var(--surface-container-low)',
      stateLayerColor: 'var(--primary)',
    });

    const normal = getBrandedFabStyle() as Record<string, string | number>;
    const lowered = getBrandedFabStyle({ elevation: 'lowered' }) as Record<string, string | number>;
    expect(normal['--_fab-target-size']).toBe('56px');
    expect(normal['--_fab-icon-size']).toBe('36px');
    expect(normal['--_fab-container-color']).toBe('var(--surface-container-high)');
    expect(normal['--_fab-content-color']).toBe('inherit');
    expect(normal['--_fab-state-layer-color']).toBe('var(--primary)');
    expect(lowered['--_fab-container-color']).toBe('var(--surface-container-low)');
  });

  it('maps Extended FAB geometry, typography, and runtime-only baseline minimums', () => {
    expect(extendedFabSizeTokens.baseline).toMatchObject({
      height: 56,
      iconSize: 24,
      leadingSpace: 16,
      trailingSpace: 20,
      iconLabelSpace: 12,
      expandedMinWidth: 80,
      textOnlyLeadingSpace: 20,
      textOnlyTrailingSpace: 20,
    });
    expect(extendedFabSizeTokens.small).toMatchObject({
      height: 56,
      iconSize: 24,
      leadingSpace: 16,
      trailingSpace: 16,
      iconLabelSpace: 8,
      expandedMinWidth: 56,
    });
    expect(extendedFabSizeTokens.medium).toMatchObject({
      height: 80,
      iconSize: 28,
      leadingSpace: 26,
      trailingSpace: 26,
      iconLabelSpace: 12,
      expandedMinWidth: 80,
    });
    expect(extendedFabSizeTokens.large).toMatchObject({
      height: 96,
      iconSize: 36,
      leadingSpace: 28,
      trailingSpace: 28,
      iconLabelSpace: 16,
      expandedMinWidth: 96,
    });

    const baseline = getExtendedFabStyle('baseline') as Record<string, string | number>;
    const medium = getExtendedFabStyle('medium') as Record<string, string | number>;
    expect(baseline['--_fab-expanded-min-width']).toBe('80px');
    expect(baseline['--_fab-text-only-leading-space']).toBe('20px');
    expect(baseline['--_fab-text-only-trailing-space']).toBe('20px');
    expect(medium['--_fab-container-radius']).toBe('20px');
    expect(medium['--_fab-label-font-size']).toBe('22px');
    expect(medium['--_fab-icon-label-space']).toBe('12px');
  });

  it('applies the same variant contract to Extended FAB', () => {
    const secondary = getExtendedFabStyle('small', {
      variant: 'secondaryContainer',
    }) as Record<string, string | number>;
    const surface = getExtendedFabStyle('small', {
      variant: 'surface',
      elevation: 'lowered',
    }) as Record<string, string | number>;

    expect(secondary['--_fab-container-color']).toBe('var(--secondary-container)');
    expect(secondary['--_fab-content-color']).toBe('var(--on-secondary-container)');
    expect(surface['--_fab-container-color']).toBe('var(--surface-container-low)');
    expect(surface['--_fab-content-color']).toBe('var(--primary)');
  });

  it('projects current branded Extended FAB label and state-layer roles', () => {
    expect(brandedExtendedFabTokens).toMatchObject({
      height: 56,
      iconSize: 36,
      shape: 'large',
      containerColor: 'var(--surface-container-high)',
      loweredContainerColor: 'var(--surface-container-low)',
      stateLayerColor: 'var(--primary)',
      labelColor: 'var(--on-surface)',
      focusLabelColor: 'var(--primary)',
      hoverLabelColor: 'var(--primary)',
      pressedLabelColor: 'var(--primary)',
    });

    const normal = getBrandedExtendedFabStyle() as Record<string, string | number>;
    const lowered = getBrandedExtendedFabStyle({ elevation: 'lowered' }) as Record<string, string | number>;
    expect(normal['--_fab-target-size']).toBe('56px');
    expect(normal['--_fab-icon-size']).toBe('36px');
    expect(normal['--_fab-expanded-min-width']).toBe('80px');
    expect(normal['--_fab-container-color']).toBe('var(--surface-container-high)');
    expect(normal['--_fab-content-color']).toBe('inherit');
    expect(normal['--_fab-state-layer-color']).toBe('var(--primary)');
    expect(normal['--_fab-label-color']).toBe('var(--on-surface)');
    expect(normal['--_fab-hover-label-color']).toBe('var(--primary)');
    expect(lowered['--_fab-container-color']).toBe('var(--surface-container-low)');
  });

  it('projects FastSpatial/FastEffects motion for Extended expansion', () => {
    const extended = getExtendedFabStyle('small') as Record<string, string | number>;
    expect(extended['--_fab-expand-size-duration']).toBeTruthy();
    expect(extended['--_fab-expand-size-easing']).toBeTruthy();
    expect(extended['--_fab-expand-opacity-duration']).toBeTruthy();
    expect(extended['--_fab-expand-opacity-easing']).toBeTruthy();
  });
});
