import { describe, expect, it } from 'vitest';
import {
  getSegmentedButtonDisabledColors,
  segmentedButtonRowStyle,
  segmentedButtonStyle,
} from './SegmentedButton.defaults';
import {
  segmentedButtonRuntime,
  segmentedButtonTokens,
} from './SegmentedButton.tokens';

const style = segmentedButtonStyle as Record<string, string | number>;
const rowStyle = segmentedButtonRowStyle as Record<string, string | number>;

describe('SegmentedButton defaults', () => {
  it('projects the canonical outlined segmented button geometry', () => {
    expect(segmentedButtonTokens.containerHeight).toBe('40px');
    expect(segmentedButtonTokens.minWidth).toBe('58px');
    expect(segmentedButtonTokens.outlineWidth).toBe('1px');
    expect(segmentedButtonTokens.iconSize).toBe('18px');
    expect(segmentedButtonTokens.shape).toBe('9999px');
    expect(rowStyle['--_segmented-button-overlap']).toBe('1px');
  });

  it('keeps source-only padding, gap and z-index beside the UI consumer', () => {
    expect(segmentedButtonRuntime.contentPaddingInline).toBe('12px');
    expect(segmentedButtonRuntime.iconLabelSpacing).toBe('8px');
    expect(segmentedButtonRuntime.checkedZIndex).toBe(5);
    expect(segmentedButtonRuntime.interactionZIndex).toBe(10);
  });

  it('resolves selected and unselected roles through ThemeProvider variables', () => {
    expect(style['--_segmented-button-selected-container-color']).toBe(
      'var(--secondary-container)',
    );
    expect(style['--_segmented-button-selected-label-color']).toBe(
      'var(--on-secondary-container)',
    );
    expect(style['--_segmented-button-unselected-label-color']).toBe(
      'var(--on-surface)',
    );
    expect(style['--_segmented-button-outline-color']).toBe('var(--outline)');
  });

  it('matches Compose disabled content and outline alpha', () => {
    expect(getSegmentedButtonDisabledColors()).toEqual({
      label: 'color-mix(in srgb, var(--on-surface) 38%, transparent)',
      icon: 'color-mix(in srgb, var(--on-surface) 38%, transparent)',
      outline: 'color-mix(in srgb, var(--on-surface) 12%, transparent)',
    });
  });

  it('uses FastSpatial displacement and DefaultEffects icon motion', () => {
    expect(style['--_segmented-button-content-motion-duration']).toBe('137ms');
    expect(style['--_segmented-button-icon-motion-duration']).toBe('166ms');
    expect(String(style['--_segmented-button-content-motion-easing'])).toContain(
      'linear(',
    );
    expect(String(style['--_segmented-button-icon-motion-easing'])).toContain(
      'linear(',
    );
  });
});
