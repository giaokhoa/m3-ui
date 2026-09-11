import { describe, expect, it } from 'vitest';
import {
  switchStateLayerRadius,
  switchTrackFocusRingRadius,
} from './Switch.defaults';

describe('Switch runtime defaults', () => {
  it('keeps only Ripple geometry that requires numeric runtime values', () => {
    expect(switchStateLayerRadius).toBe(20);
    expect(switchTrackFocusRingRadius).toBe('16px');
  });
});
