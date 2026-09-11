import { describe, expect, it } from 'vitest';
import { getNonInteractiveScrollbarGeometry } from './NonInteractiveScrollbar.geometry';

describe('NonInteractiveScrollbar geometry', () => {
  it('maps top, middle and bottom offsets across the available track', () => {
    const top = getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 400, scrollOffset: 0 },
      96,
      24,
      0.9,
    );
    const middle = getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 400, scrollOffset: 150 },
      96,
      24,
      0.9,
    );
    const bottom = getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 400, scrollOffset: 300 },
      96,
      24,
      0.9,
    );

    expect(top).toEqual({ isVisible: true, trackLength: 96, thumbLength: 24, thumbOffset: 0 });
    expect(middle.thumbOffset).toBe(36);
    expect(bottom.thumbOffset).toBe(72);
  });

  it('coerces proportional thumb length to the configured minimum', () => {
    const geometry = getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 1000, scrollOffset: 0 },
      100,
      30,
      0.9,
    );
    expect(geometry.thumbLength).toBe(30);
  });

  it('coerces proportional thumb length to the configured maximum fraction', () => {
    const geometry = getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 110, scrollOffset: 0 },
      100,
      24,
      0.5,
    );
    expect(geometry.thumbLength).toBe(50);
  });

  it('hides for no overflow and when the track cannot hold the minimum thumb', () => {
    expect(getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 100, scrollOffset: 0 },
      100,
      24,
      0.9,
    ).isVisible).toBe(false);
    expect(getNonInteractiveScrollbarGeometry(
      { viewportSize: 20, contentSize: 100, scrollOffset: 0 },
      20,
      24,
      0.9,
    ).isVisible).toBe(false);
  });

  it('rejects an invalid maximum thumb fraction', () => {
    expect(() => getNonInteractiveScrollbarGeometry(
      { viewportSize: 100, contentSize: 200, scrollOffset: 0 },
      100,
      24,
      1.1,
    )).toThrow(RangeError);
  });
});
