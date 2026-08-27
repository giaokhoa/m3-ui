import { describe, expect, it } from 'vitest';
import { fabMenuTokens, getFabMenuStyle, getToggleFabStyle } from './FabMenu.defaults';

describe('FloatingActionButtonMenu defaults', () => {
  it('projects canonical Compose FAB menu geometry without mutating source tokens', () => {
    expect(fabMenuTokens.closeButton).toMatchObject({
      betweenSpace: 8,
      height: 56,
      width: 56,
      iconSize: 20,
    });
    expect(fabMenuTokens.listItem).toMatchObject({
      betweenSpace: 4,
      height: 56,
      minWidth: 56,
      iconSize: 24,
      iconLabelSpace: 8,
      leadingSpace: 24,
      trailingSpace: 24,
      elevation: 'level3',
    });
    expect(fabMenuTokens.layout).toEqual({ horizontalPadding: 16, triggerBottomPadding: 16 });
  });

  it('keeps FastSpatial/FastEffects item motion and a deterministic slow-effects web stagger cadence', () => {
    expect(fabMenuTokens.motion.itemSpatialDuration).toBeTruthy();
    expect(fabMenuTokens.motion.itemSpatialEasing).toBeTruthy();
    expect(fabMenuTokens.motion.itemEffectsDuration).toBeTruthy();
    expect(fabMenuTokens.motion.itemEffectsEasing).toBeTruthy();
    expect(fabMenuTokens.motion.staggerStepMs).toBe(50);

    const style = getFabMenuStyle(180) as Record<string, string | number>;
    expect(style['--_fab-menu-max-height']).toBe('180px');
    expect(style['--_fab-menu-item-height']).toBe('56px');
    expect(style['--_fab-menu-item-leading-space']).toBe('24px');
  });

  it('morphs baseline, medium and large toggles into the pinned 56px close geometry', () => {
    const baseline = getToggleFabStyle('baseline', false) as Record<string, string | number>;
    const medium = getToggleFabStyle('medium', false) as Record<string, string | number>;
    const large = getToggleFabStyle('large', false) as Record<string, string | number>;
    const checkedMedium = getToggleFabStyle('medium', true) as Record<string, string | number>;

    expect(baseline['--_fab-container-width']).toBe('56px');
    expect(baseline['--_fab-container-radius']).toBe('16px');
    expect(medium['--_fab-target-size']).toBe('80px');
    expect(medium['--_fab-container-width']).toBe('80px');
    expect(medium['--_fab-container-radius']).toBe('20px');
    expect(large['--_fab-target-size']).toBe('96px');
    expect(large['--_fab-icon-size']).toBe('36px');

    expect(checkedMedium['--_fab-target-size']).toBe('80px');
    expect(checkedMedium['--_fab-container-width']).toBe('56px');
    expect(checkedMedium['--_fab-container-height']).toBe('56px');
    expect(checkedMedium['--_fab-container-radius']).toBe('28px');
    expect(checkedMedium['--_fab-icon-size']).toBe('20px');
    expect(checkedMedium['--_fab-container-color']).toBe('var(--primary)');
    expect(checkedMedium['--_fab-content-color']).toBe('var(--on-primary)');
  });
});
