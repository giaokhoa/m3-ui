import { describe, expect, it } from 'vitest';
import { checkboxGeometry } from './Checkbox.geometry';

describe('Checkbox runtime geometry', () => {
  it('keeps only JS-required ripple and SVG geometry at runtime', () => {
    expect(checkboxGeometry.containerSize).toBe(18);
    expect(checkboxGeometry.stateLayerRadius).toBe(20);
    expect(checkboxGeometry.focusRingInset).toBe(15);
    expect(checkboxGeometry.focusRingRadius).toBe(4.5);
  });

  it('derives mark paths from canonical generated coordinates', () => {
    expect(checkboxGeometry.checkPath).toContain('M 4.5 9');
    expect(checkboxGeometry.checkPath).toContain('L 13.5');
    expect(checkboxGeometry.indeterminatePath).toBe('M 4.5 9 L 13.5 9');
  });
});
