import { describe, expect, it } from 'vitest';
import { menuContainerElevation, menuRuntime } from './Menu.defaults';

describe('Menu runtime defaults', () => {
  it('keeps only overlay mechanics beside the renderer', () => {
    expect(menuRuntime).toEqual({
      viewportMargin: 8,
      exposedMatchAnchorWidth: true,
    });
  });

  it('keeps semantic elevation input for shared Elevation', () => {
    expect(menuContainerElevation).toBe('level2');
  });
});
