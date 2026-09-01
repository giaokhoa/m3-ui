import { describe, expect, it } from 'vitest';
import * as token from '@m3-ui/tokens';
import { getListItemElevationLevel } from './ListItem.elevation';

describe('ListItem elevation', () => {
  it('selects only the canonical normal and dragged semantic levels at runtime', () => {
    expect(getListItemElevationLevel()).toBe(token.ComponentListBaseItemContainerElevation);
    expect(getListItemElevationLevel(false)).toBe(token.ComponentListBaseItemContainerElevation);
    expect(getListItemElevationLevel(true)).toBe(token.ComponentListBaseItemDraggedContainerElevation);
  });
});
