import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  getWideNavigationRailItemStyle,
  getWideNavigationRailStyle,
  wideNavigationRailRuntime,
  wideNavigationRailTokens,
} from './WideNavigationRail.defaults';

describe('WideNavigationRail defaults', () => {
  it('projects the canonical collapsed, expanded and item token families', () => {
    expect(wideNavigationRailTokens).toMatchObject({
      collapsedContainerWidth: token.ComponentNavigationRailCollapsedContainerWidth,
      expandedContainerWidthMinimum:
        token.ComponentNavigationRailExpandedContainerWidthMinimum,
      expandedContainerWidthMaximum:
        token.ComponentNavigationRailExpandedContainerWidthMaximum,
      topSpace: token.ComponentNavigationRailCollapsedTopSpace,
      collapsedItemSpace: token.ComponentNavigationRailCollapsedItemVerticalSpace,
      headerSpaceMinimum:
        token.ComponentNavigationRailBaselineItemHeaderSpaceMinimum,
      collapsedItemHeight: token.ComponentNavigationRailBaselineItemContainerHeight,
      verticalIndicatorWidth:
        token.ComponentNavigationRailVerticalItemActiveIndicatorWidth,
      verticalIndicatorHeight:
        token.ComponentNavigationRailVerticalItemActiveIndicatorHeight,
      horizontalIndicatorHeight:
        token.ComponentNavigationRailHorizontalItemActiveIndicatorHeight,
    });
  });

  it('locks the current AndroidX 96px collapsed and 220-360px expanded rail geometry', () => {
    const style = getWideNavigationRailStyle();
    expect(style).toMatchObject({
      '--_wide-navigation-rail-collapsed-width': '96px',
      '--_wide-navigation-rail-expanded-min-width': '220px',
      '--_wide-navigation-rail-expanded-max-width': '360px',
      '--_wide-navigation-rail-top-space': '44px',
      '--_wide-navigation-rail-header-space': '40px',
      '--_wide-navigation-rail-collapsed-item-space': '4px',
    });
    expect(
      String(style['--_wide-navigation-rail-box-shadow']).match(
        /0px 0px 0px 0px/g,
      ),
    ).toHaveLength(3);
  });

  it('switches labeled items from 64px top-icon to 56px start-icon geometry', () => {
    expect(getWideNavigationRailItemStyle(true, false, true)).toMatchObject({
      '--_wide-navigation-rail-item-collapsed-height': '64px',
      '--_wide-navigation-rail-indicator-width': '56px',
      '--_wide-navigation-rail-indicator-height': '32px',
      '--_wide-navigation-rail-icon-size': '24px',
      '--_wide-navigation-rail-label-color':
        token.ComponentNavigationRailColorItemActiveLabelText,
      '--_wide-navigation-rail-label-font-size': token.TypographyLabelMediumFontSize,
      '--_wide-navigation-rail-label-line-height':
        token.TypographyLabelMediumLineHeight,
    });

    expect(getWideNavigationRailItemStyle(true, true, true)).toMatchObject({
      '--_wide-navigation-rail-item-expanded-height': '56px',
      '--_wide-navigation-rail-indicator-height': '56px',
      '--_wide-navigation-rail-expanded-icon-label-space': '8px',
      '--_wide-navigation-rail-label-color':
        token.ComponentNavigationRailColorItemActiveIcon,
      '--_wide-navigation-rail-label-font-size': token.TypographyLabelLargeFontSize,
      '--_wide-navigation-rail-label-line-height': token.TypographyLabelLargeLineHeight,
    });
  });

  it('keeps icon-only items circular and current state layers canonical', () => {
    expect(getWideNavigationRailItemStyle(false, true, false)).toMatchObject({
      '--_wide-navigation-rail-indicator-width': '56px',
      '--_wide-navigation-rail-indicator-height': '56px',
      '--_wide-navigation-rail-icon-color':
        token.ComponentNavigationRailColorItemInactiveIcon,
    });
    expect(
      getWideNavigationRailItemStyle(false, false, true, {
        isFocusVisible: true,
      }),
    ).toMatchObject({
      '--_ripple-color':
        token.ComponentNavigationRailColorItemInactiveFocusedStateLayer,
      '--_ripple-focus-opacity':
        token.ComponentNavigationRailBaselineFocusStateLayerOpacity,
    });
  });

  it('keeps renderer-only alpha, expanded-label drift and motion beside the UI', () => {
    expect(wideNavigationRailRuntime).toMatchObject({
      itemHorizontalPadding: 20,
      disabledAlpha: 0.38,
      motion: {
        spatial: {
          duration: token.MotionSpringDefaultSpatialDuration,
          easing: token.MotionSpringDefaultSpatialEasing,
        },
      },
    });
    expect(
      getWideNavigationRailItemStyle(
        true,
        true,
        true,
        { isDisabled: true },
        {
          selectedStartLabelColor: 'tomato',
          selectedIconColor: 'rebeccapurple',
          indicatorColor: 'gold',
        },
      ),
    ).toMatchObject({
      '--_wide-navigation-rail-label-color': 'tomato',
      '--_wide-navigation-rail-icon-color': 'rebeccapurple',
      '--_wide-navigation-rail-indicator-color': 'gold',
      '--_wide-navigation-rail-content-opacity': 0.38,
    });
  });
});
