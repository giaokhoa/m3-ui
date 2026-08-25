import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import { getElevationBoxShadow } from '../../internal/elevation';
import {
  getDismissibleDrawerSheetStyle,
  getModalDrawerSheetStyle,
  getModalNavigationDrawerOverlayStyle,
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
      containerShape: token.ComponentNavigationDrawerContainerShape,
      containerWidth: token.ComponentNavigationDrawerContainerWidth,
      iconSize: token.ComponentNavigationDrawerIconSize,
      labelTextTypography: token.ComponentNavigationDrawerLabelTextTypography,
      modalContainerColor: token.ComponentNavigationDrawerModalContainerColor,
      modalContainerElevation: token.ComponentNavigationDrawerModalContainerElevation,
      standardContainerColor: token.ComponentNavigationDrawerStandardContainerColor,
      standardContainerElevation: token.ComponentNavigationDrawerStandardContainerElevation,
    });
  });

  it('keeps renderer-only Compose geometry and gesture mechanics beside the consumer', () => {
    expect(navigationDrawerRuntime).toMatchObject({
      minimumDrawerWidth: 240,
      maximumDrawerWidth: 360,
      positionalThreshold: 0.5,
      velocityThreshold: 400,
      dragSlop: 4,
      itemOuterPadding: 12,
      itemPaddingStart: 16,
      itemPaddingEnd: 24,
      iconLabelSpace: 12,
      labelBadgeSpace: 12,
      modalRuntimeElevation: 'level0',
    });
  });

  it('projects permanent and dismissible sheets as standard level0 surfaces', () => {
    for (const style of [
      getPermanentDrawerSheetStyle(),
      getDismissibleDrawerSheetStyle(),
    ]) {
      expect(style).toMatchObject({
        '--_navigation-drawer-min-width': '240px',
        '--_navigation-drawer-width': '360px',
        '--_navigation-drawer-container-color': token.ComponentNavigationDrawerStandardContainerColor,
        '--_navigation-drawer-radius-start-start': token.ShapeNone,
        '--_navigation-drawer-radius-start-end': token.ShapeNone,
        '--_navigation-drawer-box-shadow': getElevationBoxShadow('level0'),
      });
    }
  });

  it('keeps the canonical modal level1 token but follows AndroidX runtime Level0 and largeEnd shape', () => {
    expect(navigationDrawerTokens.modalContainerElevation).toBe('level1');
    expect(getModalDrawerSheetStyle()).toMatchObject({
      '--_navigation-drawer-container-color': token.ComponentNavigationDrawerModalContainerColor,
      '--_navigation-drawer-radius-start-start': token.ShapeCornerLargeEndTopStart,
      '--_navigation-drawer-radius-start-end': token.ShapeCornerLargeEndTopEnd,
      '--_navigation-drawer-radius-end-end': token.ShapeCornerLargeEndBottomEnd,
      '--_navigation-drawer-radius-end-start': token.ShapeCornerLargeEndBottomStart,
      '--_navigation-drawer-box-shadow': getElevationBoxShadow('level0'),
    });
  });

  it('projects scrim alpha without copying Scrim token values', () => {
    expect(getModalNavigationDrawerOverlayStyle({ alpha: 0.5 })).toMatchObject({
      '--_scrim-container-color': token.ScrimContainerColor,
      '--_scrim-container-opacity': token.ScrimContainerOpacity * 0.5,
    });
  });

  it('projects selected and inactive item states without fake CSS state classes', () => {
    expect(getNavigationDrawerItemStyle(true)).toMatchObject({
      '--_navigation-drawer-item-height': token.ComponentNavigationDrawerActiveIndicatorHeight,
      '--_navigation-drawer-item-radius': token.ShapeFull,
      '--_navigation-drawer-item-outer-padding': '12px',
      '--_navigation-drawer-item-icon-size': token.ComponentNavigationDrawerIconSize,
      '--_navigation-drawer-item-font-size': token.TypographyLabelLargeFontSize,
      '--_navigation-drawer-item-line-height': token.TypographyLabelLargeLineHeight,
      '--_navigation-drawer-item-letter-spacing': token.TypographyLabelLargeLetterSpacing,
      '--_navigation-drawer-item-container-color': token.ComponentNavigationDrawerActiveIndicatorColor,
      '--_navigation-drawer-item-icon-color': token.ComponentNavigationDrawerActiveIconColor,
      '--_navigation-drawer-item-label-color': token.ComponentNavigationDrawerActiveLabelTextColor,
    });
    expect(getNavigationDrawerItemStyle(false, { isHovered: true })).toMatchObject({
      '--_navigation-drawer-item-container-color': 'transparent',
      '--_navigation-drawer-item-icon-color': token.ComponentNavigationDrawerInactiveHoverIconColor,
      '--_navigation-drawer-item-label-color': token.ComponentNavigationDrawerInactiveHoverLabelTextColor,
      '--_ripple-color': token.ComponentNavigationDrawerInactiveHoverStateLayerColor,
    });
  });
});
