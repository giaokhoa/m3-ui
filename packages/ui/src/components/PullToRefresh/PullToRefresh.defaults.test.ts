import { describe, expect, it } from 'vitest';
import { pullToRefreshDefaults } from './PullToRefresh';

describe('PullToRefresh parity defaults', () => {
  it('projects the AndroidX positional threshold to 80 CSS pixels', () => {
    expect(pullToRefreshDefaults.threshold).toBe(80);
  });

  it('uses the AndroidX 0.5 drag multiplier', () => {
    expect(pullToRefreshDefaults.dragMultiplier).toBe(0.5);
  });
});
