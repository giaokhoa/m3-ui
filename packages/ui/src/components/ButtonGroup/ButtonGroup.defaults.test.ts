import { describe, expect, it } from 'vitest';
import {
  buttonGroupMotionTokens,
  buttonGroupOverflowMenuTokens,
  buttonGroupSizeTokens,
  buttonGroupStyle,
  connectedButtonGroupSizeTokens,
  defaultButtonGroupExpandedRatio,
  distributePressedWidths,
  visiblePrefixCount,
} from './ButtonGroup.defaults';

describe('ButtonGroup parity defaults', () => {
  it('maps AndroidX small standard and connected geometry from canonical tokens', () => {
    expect(buttonGroupSizeTokens.small).toEqual({ gap: '12px', height: '40px' });
    expect(connectedButtonGroupSizeTokens.small).toEqual({
      gap: '2px',
      height: '40px',
      innerCorner: '8px',
      pressedInnerCorner: '4px',
    });
    expect(defaultButtonGroupExpandedRatio).toBe(0.15);
  });

  it('uses FastSpatial for width and connected shape motion', () => {
    expect(buttonGroupMotionTokens).toMatchObject({
      duration: '137ms',
      dampingRatio: 0.9,
      stiffness: 1400,
    });
    expect(buttonGroupMotionTokens.easing).toContain('linear(');
  });

  it('keeps the private overflow surface on existing canonical menu/list tokens', () => {
    expect(buttonGroupOverflowMenuTokens).toMatchObject({
      containerColor: 'var(--surface-container)',
      containerRadius: '4px',
      containerElevation: 'level2',
      itemContainerColor: 'var(--surface-container-low)',
      itemLabelColor: 'var(--on-surface)',
      itemHeight: '56px',
      itemPaddingInlineStart: '16px',
      itemPaddingInlineEnd: '16px',
      itemGap: '12px',
      itemIconSize: '24px',
    });
  });

  it('projects logical connected shape and runtime color variables without literals', () => {
    const style = buttonGroupStyle('connected', 'small');
    expect(style).toMatchObject({
      '--_button-group-gap': '2px',
      '--_button-group-height': '40px',
      '--_button-group-inner-corner': '8px',
      '--_button-group-pressed-inner-corner': '4px',
      '--_button-group-full-corner': '9999px',
      '--_button-group-unselected-container': 'var(--surface-container)',
      '--_button-group-unselected-content': 'var(--on-surface-variant)',
      '--_button-group-selected-container': 'var(--primary)',
      '--_button-group-selected-content': 'var(--on-primary)',
    });
    expect(JSON.stringify(style)).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it('expands a middle item by borrowing half from each neighbor', () => {
    expect(distributePressedWidths({
      widths: [100, 120, 80],
      maxCompression: [24, 24, 24],
      pressedIndex: 1,
      expandedRatio: 0.15,
    })).toEqual([91, 138, 71]);
  });

  it('expands edge items from one side and clamps at compression limit', () => {
    expect(distributePressedWidths({
      widths: [100, 70, 80],
      maxCompression: [24, 8, 24],
      pressedIndex: 0,
      expandedRatio: 0.15,
    })).toEqual([108, 62, 80]);
    expect(distributePressedWidths({
      widths: [70, 80, 100],
      maxCompression: [6, 24, 24],
      pressedIndex: 2,
      expandedRatio: 0.15,
    })).toEqual([70, 65, 115]);
  });

  it('keeps total geometry constant while pressed', () => {
    const before = [88, 104, 96, 110];
    const after = distributePressedWidths({
      widths: before,
      maxCompression: [24, 24, 24, 24],
      pressedIndex: 2,
      expandedRatio: 0.15,
    });
    expect(after.reduce((sum, width) => sum + width, 0)).toBeCloseTo(
      before.reduce((sum, width) => sum + width, 0),
      8,
    );
  });

  it('computes an ordered visible prefix while reserving overflow indicator space', () => {
    expect(visiblePrefixCount([70, 80, 90], 300, 12, 40)).toBe(3);
    expect(visiblePrefixCount([70, 80, 90], 230, 12, 40)).toBe(2);
    expect(visiblePrefixCount([70, 80, 90], 100, 12, 40)).toBe(0);
  });
});
