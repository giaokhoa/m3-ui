import { describe, expect, it } from 'vitest';
import {
  defaultSurfaceColor,
  defaultSurfaceContentColor,
  elevationLevelToPx,
  getSurfaceBackground,
  getSurfaceContentColor,
  tonalOverlayPercent,
} from './Surface.defaults';

describe('Surface defaults', () => {
  it('projects canonical elevation levels without inventing component values', () => {
    expect(elevationLevelToPx('level0')).toBe(0);
    expect(elevationLevelToPx('level1')).toBeGreaterThan(0);
    expect(elevationLevelToPx('level5')).toBeGreaterThan(elevationLevelToPx('level1'));
  });

  it('uses the Compose tonal elevation alpha formula', () => {
    expect(tonalOverlayPercent(0)).toBe(0);
    expect(tonalOverlayPercent(1)).toBeCloseTo(5.119, 2);
    expect(tonalOverlayPercent(3)).toBeCloseTo(8.238, 2);
  });

  it('keeps the theme surface role as a runtime tonal-elevation sentinel', () => {
    expect(defaultSurfaceColor).toBe('var(--surface)');
    expect(getSurfaceBackground(undefined, 0)).toBe(defaultSurfaceColor);
    expect(getSurfaceBackground(defaultSurfaceColor, 3)).toContain('var(--surface-tint)');
    expect(getSurfaceBackground(defaultSurfaceColor, 3)).toContain('var(--surface)');
  });

  it('never applies the tonal overlay to an arbitrary caller color', () => {
    expect(getSurfaceBackground('#ff0000', 12)).toBe('#ff0000');
    expect(getSurfaceBackground('rebeccapurple', 24)).toBe('rebeccapurple');
  });

  it('inherits content color for custom containers and maps theme surface to onSurface', () => {
    expect(defaultSurfaceContentColor).toBe('var(--on-surface)');
    expect(getSurfaceContentColor(undefined, undefined)).toBe(defaultSurfaceContentColor);
    expect(getSurfaceContentColor(defaultSurfaceColor, undefined)).toBe(defaultSurfaceContentColor);
    expect(getSurfaceContentColor('#ff0000', undefined)).toBeUndefined();
    expect(getSurfaceContentColor('#ff0000', '#ffffff')).toBe('#ffffff');
  });
});
