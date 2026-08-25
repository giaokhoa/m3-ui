import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import {
  getNavigationBarItemStyle,
  getNavigationBarStyle,
  navigationBarRuntime,
  navigationBarTokens,
} from './NavigationBar.defaults';

describe('NavigationBar defaults', () => {
  it('projects the canonical Compose navigation bar token family', () => {
    expect(navigationBarTokens).toMatchObject({
      containerColor: token.ComponentNavigationBarContainerColor,
      containerElevation: token.ComponentNavigationBarContainerElevation,
      tallContainerHeight: token.ComponentNavigationBarTallContainerHeight,
      activeIconColor: token.ComponentNavigationBarItemActiveIconColor,
      activeIndicatorColor: token.ComponentNavigationBarItemActiveIndicatorColor,
      activeLabelTextColor: token.ComponentNavigationBarItemActiveLabelTextColor,
      inactiveIconColor: token.ComponentNavigationBarItemInactiveIconColor,
      inactiveLabelTextColor: token.ComponentNavigationBarItemInactiveLabelTextColor,
      iconSize: token.ComponentNavigationBarVerticalItemIconSize,
      indicatorHeight: token.ComponentNavigationBarVerticalItemActiveIndicatorHeight,
      indicatorWidth: token.ComponentNavigationBarVerticalItemActiveIndicatorWidth,
      labelTextTypography: token.ComponentNavigationBarLabelTextTypography,
    });
  });

  it('keeps AndroidX renderer overrides beside the UI consumer', () => {
    expect(navigationBarRuntime).toMatchObject({
      runtimeElevation: 'level0',
      horizontalItemSpacing: 8,
      itemToIconMinimumPadding: 44,
      indicatorVerticalOffset: 12,
      disabledAlpha: 0.38,
    });
    const style = getNavigationBarStyle();
    expect(style).toMatchObject({
      '--_navigation-bar-height': '80px',
      '--_navigation-bar-container-color': token.ComponentNavigationBarContainerColor,
    });
    expect(
      String(style['--_navigation-bar-box-shadow']).match(/0px 0px 0px 0px/g),
    ).toHaveLength(3);
  });

  it('projects canonical selected and unselected item roles', () => {
    expect(getNavigationBarItemStyle(true)).toMatchObject({
      '--_navigation-bar-item-height': '80px',
      '--_navigation-bar-indicator-width': '56px',
      '--_navigation-bar-indicator-height': '32px',
      '--_navigation-bar-indicator-top': '12px',
      '--_navigation-bar-indicator-centered-top': '24px',
      '--_navigation-bar-icon-size': '24px',
      '--_navigation-bar-icon-color': token.ComponentNavigationBarItemActiveIconColor,
      '--_navigation-bar-label-color': token.ComponentNavigationBarItemActiveLabelTextColor,
      '--_navigation-bar-indicator-color': token.ComponentNavigationBarItemActiveIndicatorColor,
      '--_navigation-bar-content-opacity': 1,
    });
    expect(getNavigationBarItemStyle(false)).toMatchObject({
      '--_navigation-bar-icon-color': token.ComponentNavigationBarItemInactiveIconColor,
      '--_navigation-bar-label-color': token.ComponentNavigationBarItemInactiveLabelTextColor,
    });
  });

  it('maps interaction state into the canonical baseline ripple aliases', () => {
    expect(getNavigationBarItemStyle(true, { isHovered: true })).toMatchObject({
      '--_ripple-color': token.ComponentNavigationBarBaselineActiveHoverStateLayerColor,
      '--_ripple-hover-opacity': token.ComponentNavigationBarBaselineHoverStateLayerOpacity,
    });
    expect(getNavigationBarItemStyle(false, { isFocusVisible: true })).toMatchObject({
      '--_ripple-color': token.ComponentNavigationBarBaselineInactiveFocusStateLayerColor,
      '--_ripple-focus-opacity': token.ComponentNavigationBarBaselineFocusStateLayerOpacity,
    });
    expect(getNavigationBarItemStyle(false, { isPressed: true })).toMatchObject({
      '--_ripple-color': token.ComponentNavigationBarBaselineInactivePressedStateLayerColor,
      '--_ripple-pressed-opacity': token.ComponentNavigationBarBaselinePressedStateLayerOpacity,
    });
  });

  it('keeps disabled alpha and public color overrides local to the item', () => {
    expect(
      getNavigationBarItemStyle(
        true,
        { isDisabled: true },
        {
          selectedIconColor: 'rebeccapurple',
          selectedLabelColor: 'tomato',
          indicatorColor: 'gold',
        },
      ),
    ).toMatchObject({
      '--_navigation-bar-icon-color': 'rebeccapurple',
      '--_navigation-bar-label-color': 'tomato',
      '--_navigation-bar-indicator-color': 'gold',
      '--_navigation-bar-content-opacity': 0.38,
    });
  });
});
