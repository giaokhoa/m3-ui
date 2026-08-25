import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import { getElevationBoxShadow } from '../../internal/elevation';
import {
  getNavigationDrawerItemStyle,
  getPermanentDrawerSheetStyle,
  navigationDrawerRuntime,
  navigationDrawerTokens,
} from './NavigationDrawer.defaults';

describe('NavigationDrawer defaults', () => {
  it('projects the reconciled canonical drawer tokens', () => {
    expect(navigationDrawerTokens).toMatchObject({
      activeIndicatorColor: token.ComponentNavigationDrawerActiveIndicatorColor,
      activeIndicatorHeight: token.ComponentNavigationDrawerActiveIndicatorHeight,
      activeIndicatorShape: token.ComponentNavigationDrawerActiveIndicatorShape,
      activeIndicatorWidth: token.ComponentNavigationDrawerActiveIndicatorWidth,
      containerWidth: token.ComponentNavigationDrawerContainerWidth,
      iconSize: token.ComponentNavigationDrawerIconSize,
      labelTextTypography: token.ComponentNavigationDrawerLabelTextTypography,
      standardContainerColor: token.ComponentNavigationDrawerStandardContainerColor,
      standardContainerElevation:
        token.ComponentNavigationDrawerStandardContainerElevation,
    });
  });

  it('keeps renderer-only Compose spacing beside the consumer', () => {
    expect(navigationDrawerRuntime).toEqual({
      minimumDrawerWidth: 240,
      itemOuterPadding: 12,
      itemPaddingStart: 16,
      itemPaddingEnd: 24,
      iconLabelSpace: 12,
      labelBadgeSpace: 12,
    });
  });

  it('projects permanent sheet geometry and level0 elevation', () => {
    expect(getPermanentDrawerSheetStyle()).toMatchObject({
      '--_navigation-drawer-min-width': '240px',
      '--_navigation-drawer-width': '360px',
      '--_navigation-drawer-container-color':
        token.ComponentNavigationDrawerStandardContainerColor,
      '--_navigation-drawer-container-radius': token.ShapeNone,
      '--_navigation-drawer-box-shadow': getElevationBoxShadow('level0'),
    });
  });

  it('projects selected and inactive item states without fake CSS state classes', () => {
    expect(getNavigationDrawerItemStyle(true)).toMatchObject({
      '--_navigation-drawer-item-height':
        token.ComponentNavigationDrawerActiveIndicatorHeight,
      '--_navigation-drawer-item-radius': token.ShapeFull,
      '--_navigation-drawer-item-outer-padding': '12px',
      '--_navigation-drawer-item-icon-size':
        token.ComponentNavigationDrawerIconSize,
      '--_navigation-drawer-item-font-size': token.TypographyLabelLargeFontSize,
      '--_navigation-drawer-item-line-height':
        token.TypographyLabelLargeLineHeight,
      '--_navigation-drawer-item-letter-spacing':
        token.TypographyLabelLargeLetterSpacing,
      '--_navigation-drawer-item-container-color':
        token.ComponentNavigationDrawerActiveIndicatorColor,
      '--_navigation-drawer-item-icon-color':
        token.ComponentNavigationDrawerActiveIconColor,
      '--_navigation-drawer-item-label-color':
        token.ComponentNavigationDrawerActiveLabelTextColor,
    });
    expect(
      getNavigationDrawerItemStyle(false, { isHovered: true }),
    ).toMatchObject({
      '--_navigation-drawer-item-container-color': 'transparent',
      '--_navigation-drawer-item-icon-color':
        token.ComponentNavigationDrawerInactiveHoverIconColor,
      '--_navigation-drawer-item-label-color':
        token.ComponentNavigationDrawerInactiveHoverLabelTextColor,
      '--_ripple-color':
        token.ComponentNavigationDrawerInactiveHoverStateLayerColor,
    });
  });
});
