import { describe, expect, it } from 'vitest';
import { getPlainTooltipStyle, getRichTooltipStyle, plainTooltipRuntime } from './Tooltip.defaults';

describe('Tooltip runtime boundary', () => {
  it('leaves immutable defaults to generated CSS', () => {
    expect(getPlainTooltipStyle()).toEqual({});
    expect(getRichTooltipStyle()).toEqual({});
    expect(plainTooltipRuntime.spacingBetweenTooltipAndAnchor).toBe(4);
  });

  it('projects caller overrides without rebuilding token defaults', () => {
    expect(getRichTooltipStyle({ actionColor: 'gold', maxWidth: 280 })).toMatchObject({
      '--_rich-tooltip-action-color': 'gold',
      '--_rich-tooltip-action-pressed-label-color': 'gold',
      '--_rich-tooltip-action-pressed-state-layer-color': 'gold',
      '--_rich-tooltip-max-width': '280px',
    });
  });
});
