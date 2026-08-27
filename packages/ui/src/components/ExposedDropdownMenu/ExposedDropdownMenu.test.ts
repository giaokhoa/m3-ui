import { describe, expect, it } from 'vitest';
import { calculateExposedDropdownMaxHeight } from './ExposedDropdownMenu.utils';

describe('calculateExposedDropdownMaxHeight', () => {
  it('uses the larger visible side of the anchor', () => {
    expect(
      calculateExposedDropdownMaxHeight(
        { top: 0, bottom: 800 },
        { top: 300, bottom: 356 },
        8,
      ),
    ).toBe(436);
  });

  it('respects a shifted visual viewport such as a software keyboard viewport', () => {
    expect(
      calculateExposedDropdownMaxHeight(
        { top: 120, bottom: 520 },
        { top: 420, bottom: 476 },
        8,
      ),
    ).toBe(292);
  });

  it('never returns a negative height', () => {
    expect(
      calculateExposedDropdownMaxHeight(
        { top: 100, bottom: 200 },
        { top: 90, bottom: 210 },
        8,
      ),
    ).toBe(0);
  });
});
