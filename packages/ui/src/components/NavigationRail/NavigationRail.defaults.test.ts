import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  getNavigationRailItemStyle,
  getNavigationRailStyle,
  navigationRailRuntime,
  navigationRailTokens,
} from './NavigationRail.defaults';

describe('NavigationRail defaults', () => {
  it('projects the canonical Compose navigation rail token families', () => {
    expect(navigationRailTokens).toMatchObject({
      containerColor: token.ComponentNavigationRailCollapsedContainerColor,
      containerElevation: token.ComponentNavigationRailCollapsedContainerElevation,
      narrowContainerWidth: token.ComponentNavigationRailCollapsedNarrowContainerWidth,
      activeIconColor: token.ComponentNavigationRailColorItemActiveIcon,
      activeIndicatorColor: token.ComponentNavigationRailColorItemActiveIndicator,
      activeLabelTextColor: token.ComponentNavigationRailColorItemActiveLabelText,
      inactiveIconColor: token.ComponentNavigationRailColorItemInactiveIcon,
      inactiveLabelTextColor: token.ComponentNavigationRailColorItemInactiveLabelText,
      iconSize: token.ComponentNavigationRailBaselineItemIconSize,
      indicatorHeight: token.ComponentNavigationRailVerticalItemActiveIndicatorHeight,
      indicatorWidth: token.ComponentNavigationRailVerticalItemActiveIndicatorWidth,
      noLabelIndicatorHeight:
        token.ComponentNavigationRailBaselineNoLabelActiveIndicatorHeight,
      labelTextTypography: token.ComponentNavigationRailVerticalItemLabelTextTypography,
    });
  });

  it('keeps current AndroidX collapsed geometry beside the UI consumer', () => {
    expect(navigationRailRuntime).toMatchObject({
      verticalPadding: 4,
      itemSpacing: 4,
      headerSpacerHeight: 8,
      itemHeight: 56,
      disabledAlpha: 0.38,
    });
    const style = getNavigationRailStyle();
    expect(style).toMatchObject({
      '--_navigation-rail-width': '80px',
      '--_navigation-rail-container-color':
        token.ComponentNavigationRailCollapsedContainerColor,
      '--_navigation-rail-vertical-padding': '4px',
      '--_navigation-rail-item-spacing': '4px',
      '--_navigation-rail-header-spacer-height': '8px',
    });
    expect(
      String(style['--_navigation-rail-box-shadow']).match(/0px 0px 0px 0px/g),
    ).toHaveLength(3);
  });

  it('uses 56x32 labeled indicators and 56x56 icon-only indicators', () => {
    expect(getNavigationRailItemStyle(true, true)).toMatchObject({
      '--_navigation-rail-item-height': '56px',
      '--_navigation-rail-item-width': '80px',
      '--_navigation-rail-indicator-width': '56px',
      '--_navigation-rail-indicator-height': '32px',
      '--_navigation-rail-indicator-top': '0px',
      '--_navigation-rail-indicator-centered-top': '12px',
      '--_navigation-rail-icon-size': '24px',
      '--_navigation-rail-icon-color': token.ComponentNavigationRailColorItemActiveIcon,
      '--_navigation-rail-label-color': token.ComponentNavigationRailColorItemActiveLabelText,
      '--_navigation-rail-indicator-color': token.ComponentNavigationRailColorItemActiveIndicator,
    });
    expect(getNavigationRailItemStyle(false, false)).toMatchObject({
      '--_navigation-rail-indicator-width': '56px',
      '--_navigation-rail-indicator-height': '56px',
      '--_navigation-rail-indicator-top': '0px',
      '--_navigation-rail-icon-color': token.ComponentNavigationRailColorItemInactiveIcon,
    });
  });

  it('maps current AndroidX state layers and canonical baseline opacities', () => {
    expect(
      getNavigationRailItemStyle(true, true, { isHovered: true }),
    ).toMatchObject({
      '--_ripple-color': token.ComponentNavigationRailColorItemActiveHoveredStateLayer,
      '--_ripple-hover-opacity': token.ComponentNavigationRailBaselineHoverStateLayerOpacity,
    });
    expect(
      getNavigationRailItemStyle(false, true, { isFocusVisible: true }),
    ).toMatchObject({
      '--_ripple-color': token.ComponentNavigationRailColorItemInactiveFocusedStateLayer,
      '--_ripple-focus-opacity': token.ComponentNavigationRailBaselineFocusStateLayerOpacity,
    });
    expect(
      getNavigationRailItemStyle(false, true, { isPressed: true }),
    ).toMatchObject({
      '--_ripple-color': token.ComponentNavigationRailColorItemInactivePressedStateLayer,
      '--_ripple-pressed-opacity': token.ComponentNavigationRailBaselinePressedStateLayerOpacity,
    });
  });

  it('keeps disabled alpha and public color overrides local to the item', () => {
    expect(
      getNavigationRailItemStyle(
        true,
        true,
        { isDisabled: true },
        {
          selectedIconColor: 'rebeccapurple',
          selectedLabelColor: 'tomato',
          indicatorColor: 'gold',
        },
      ),
    ).toMatchObject({
      '--_navigation-rail-icon-color': 'rebeccapurple',
      '--_navigation-rail-label-color': 'tomato',
      '--_navigation-rail-indicator-color': 'gold',
      '--_navigation-rail-content-opacity': 0.38,
    });
  });
});
