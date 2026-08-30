import { describe, expect, it } from 'vitest';
import * as token from '@m3-ui/tokens';
import {
  getListItemElevationLevel,
  getListItemStyle,
  listItemTokens,
} from './ListItem.defaults';

describe('ListItem defaults', () => {
  it('maps one/two/three-line geometry from canonical list tokens', () => {
    expect(listItemTokens.height).toEqual({ oneLine: 56, twoLine: 72, threeLine: 88 });
    expect(getListItemStyle(1)['--_list-item-min-height']).toBe('56px');
    expect(getListItemStyle(2)['--_list-item-min-height']).toBe('72px');
    expect(getListItemStyle(3)['--_list-item-min-height']).toBe('88px');
  });

  it('keeps elevation selection semantic while generated CSS owns shadow serialization', () => {
    const selected = getListItemStyle(1, { isSelected: true });
    const dragged = getListItemStyle(1, { isDragged: true });
    expect(selected['--_list-item-container-color']).toBe(token.ComponentListBaseItemSelectedContainerColor);
    expect(selected['--_list-item-label-color']).toBe(token.ComponentListBaseItemSelectedLabelTextColor);
    expect(dragged['--_list-item-label-color']).toBe(token.ComponentListBaseItemDraggedLabelTextColor);
    expect(getListItemElevationLevel()).toBe(listItemTokens.container.elevation);
    expect(getListItemElevationLevel({ isDragged: true })).toBe(listItemTokens.dragged.elevation);
    expect(selected['--_list-item-box-shadow']).toBeUndefined();
    expect(dragged['--_list-item-box-shadow']).toBeUndefined();
  });

  it('uses canonical disabled opacity and state-layer opacity', () => {
    const disabled = getListItemStyle(1, { isDisabled: true });
    expect(disabled['--_list-item-label-opacity']).toBe(token.ComponentListBaseItemDisabledLabelTextOpacity);
    expect(disabled['--_ripple-hover-opacity']).toBe(token.StateLayerOpacityHover);
    expect(disabled['--_ripple-focus-opacity']).toBe(token.StateLayerOpacityFocus);
    expect(disabled['--_ripple-pressed-opacity']).toBe(token.StateLayerOpacityPressed);
  });
});
