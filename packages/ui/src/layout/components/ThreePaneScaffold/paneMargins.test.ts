import { describe, expect, it } from 'vitest';
import { applyPaneMargins } from './paneMargins';

const fullPane = { left: 0, top: 0, width: 1000, height: 800 };

describe('applyPaneMargins', () => {
  it('leaves placement unchanged when margins are unspecified', () => {
    expect(applyPaneMargins(fullPane, undefined, 1000, 800)).toBe(fullPane);
  });

  it('resolves logical fixed margins in LTR and RTL', () => {
    const margins = {
      inlineStart: 32,
      inlineEnd: 48,
      blockStart: 20,
      blockEnd: 24,
    };

    expect(applyPaneMargins(fullPane, margins, 1000, 800, 'ltr')).toEqual({
      left: 32,
      top: 20,
      width: 920,
      height: 756,
    });
    expect(applyPaneMargins(fullPane, margins, 1000, 800, 'rtl')).toEqual({
      left: 48,
      top: 20,
      width: 920,
      height: 756,
    });
  });

  it('takes the union of inset edge constraints like AndroidX RectRulers', () => {
    expect(
      applyPaneMargins(
        fullPane,
        {
          insetBounds: [
            { left: 10, top: 30, right: 900, bottom: 700 },
            { left: 40, top: 20, right: 950, bottom: 650 },
          ],
        },
        1000,
        800,
      ),
    ).toEqual({ left: 40, top: 30, width: 860, height: 620 });
  });

  it('preserves Compose infinity rounding for fixed margins and ruler edges', () => {
    expect(
      applyPaneMargins(
        fullPane,
        { inlineStart: Number.POSITIVE_INFINITY },
        1000,
        800,
      ),
    ).toEqual({ left: 2147483647, top: 0, width: 0, height: 800 });

    expect(
      applyPaneMargins(
        fullPane,
        { insetBounds: [{ right: Number.NEGATIVE_INFINITY }] },
        1000,
        800,
      ),
    ).toEqual({ left: 0, top: 0, width: 0, height: 800 });
  });

  it('rounds fixed margins and ruler edges after the Compose Float boundary', () => {
    expect(
      applyPaneMargins(
        { left: 0, top: 0, width: 20000000, height: 800 },
        {
          inlineStart: 16777216.6,
          insetBounds: [{ right: 16777217.4 }],
        },
        20000000,
        800,
      ),
    ).toEqual({ left: 16777216, top: 0, width: 2, height: 800 });
  });

  it('validates fixed margins after conversion to Compose Float', () => {
    expect(
      applyPaneMargins(fullPane, { inlineStart: -1e-50 }, 1000, 800),
    ).toEqual(fullPane);
  });

  it('keeps negative fixed margins invalid like PaddingValues', () => {
    expect(() =>
      applyPaneMargins(fullPane, { inlineStart: -1 }, 1000, 800),
    ).toThrow(RangeError);
  });

  it('does not move internal pane edges that already respect outer margins', () => {
    const placement = { left: 120, top: 80, width: 300, height: 400 };
    expect(
      applyPaneMargins(
        placement,
        {
          inlineStart: 24,
          inlineEnd: 24,
          blockStart: 24,
          blockEnd: 24,
        },
        1000,
        800,
      ),
    ).toEqual(placement);
  });

  it('shrinks instead of translating when an outer edge violates a margin', () => {
    expect(
      applyPaneMargins(
        { left: 600, top: 500, width: 400, height: 300 },
        { inlineEnd: 40, blockEnd: 60 },
        1000,
        800,
      ),
    ).toEqual({ left: 600, top: 500, width: 360, height: 240 });
  });

  it('clamps conflicting bounds to zero-sized geometry', () => {
    expect(
      applyPaneMargins(
        { left: 10, top: 10, width: 20, height: 20 },
        { inlineStart: 80, blockStart: 90 },
        100,
        100,
      ),
    ).toEqual({ left: 80, top: 90, width: 0, height: 0 });
  });

  it('preserves IntRect edge overflow before applying margins', () => {
    expect(
      applyPaneMargins(
        { left: 2147483647, top: 0, width: 360, height: 800 },
        {},
        1000,
        800,
      ),
    ).toEqual({ left: 2147483647, top: 0, width: 360, height: 800 });
  });
});
