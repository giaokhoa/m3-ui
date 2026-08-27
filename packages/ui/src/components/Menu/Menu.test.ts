import { describe, expect, it } from 'vitest';
import { getMenuStyle, menuRuntime, menuTokens } from './Menu.defaults';

describe('Menu defaults', () => {
  it('keeps AndroidX-owned geometry local to the renderer', () => {
    expect(menuRuntime).toMatchObject({
      minWidth: 112,
      maxWidth: 280,
      itemMinHeight: 48,
      contentPaddingBlock: 8,
      viewportMargin: 8,
    });
  });

  it('projects canonical menu tokens into renderer variables', () => {
    const style = getMenuStyle();
    expect(style['--_menu-container-color']).toBe(menuTokens.containerColor);
    expect(style['--_menu-disabled-opacity']).toBe(menuTokens.disabledOpacity);
    expect(style['--_menu-selected-container-color']).toBe(
      menuTokens.selectedContainerColor,
    );
    expect(style['--_menu-item-min-height']).toBe('48px');
  });
});
