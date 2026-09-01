import { describe, expect, it } from 'vitest';
import {
  getNavigationBarItemStyle,
  getNavigationBarStyle,
  navigationBarRuntime,
} from './NavigationBar/NavigationBar.defaults';
import { getNavigationRailItemStyle } from './NavigationRail/NavigationRail.defaults';
import {
  getCenteredOccupancy,
  getShortNavigationBarItemStyle,
} from './ShortNavigationBar/ShortNavigationBar.defaults';
import {
  getModalDrawerSheetStyle,
  getNavigationDrawerMotionStyle,
  navigationDrawerRuntime,
} from './NavigationDrawer/NavigationDrawer.defaults';
import {
  calculateModalWideNavigationRailFraction,
  getModalWideNavigationRailStyle,
  modalWideNavigationRailRuntime,
  shouldDismissModalWideNavigationRail,
} from './WideNavigationRail/ModalWideNavigationRail.defaults';
import {
  getWideNavigationRailItemStyle,
  wideNavigationRailTokens,
} from './WideNavigationRail/WideNavigationRail.defaults';
import { getTabsStyle, tabsRuntime } from './Tabs/Tabs.defaults';

describe('navigation runtime bridges', () => {
  it('keeps only renderer mechanics that require JS', () => {
    expect(navigationBarRuntime.runtimeElevation).toBe('level0');
    expect(navigationDrawerRuntime).toMatchObject({
      minimumDrawerWidth: 240,
      maximumDrawerWidth: 360,
      positionalThreshold: 0.5,
      velocityThreshold: 400,
      dragSlop: 4,
    });
    expect(wideNavigationRailTokens).toEqual({
      expandedContainerWidthMinimum: '220px',
      expandedContainerWidthMaximum: '360px',
    });
    expect(tabsRuntime).toMatchObject({
      scrollableEdgePadding: 52,
      scrollableMinTabWidth: 90,
      stackedIconAndLabelHeight: 72,
    });
  });

  it.each([[3, 0.6], [4, 0.7], [5, 0.8], [6, 0.9], [7, 1]])(
    'keeps short navigation centered occupancy for %i items',
    (count, occupancy) => expect(getCenteredOccupancy(count)).toBe(occupancy),
  );

  it('keeps drawer offsets dynamic while CSS owns its motion recipe', () => {
    expect(getNavigationDrawerMotionStyle(-120, 360)).toEqual({
      '--_navigation-drawer-offset': '-120px',
      '--_navigation-drawer-closed-offset': '-360px',
      '--_navigation-drawer-content-offset': '240px',
    });
  });

  it('keeps modal wide rail drag fraction and settle threshold in JS', () => {
    expect(calculateModalWideNavigationRailFraction(-80, 320)).toBe(0.75);
    expect(shouldDismissModalWideNavigationRail(-159, 320)).toBe(false);
    expect(shouldDismissModalWideNavigationRail(-160, 320)).toBe(true);
    expect(modalWideNavigationRailRuntime.motion).toMatchObject({
      expandWidth: { duration: '137ms' },
      slide: { duration: '194ms' },
      effects: { duration: '166ms' },
    });
  });
});

describe('navigation public override bridges', () => {
  it('keeps instance surface overrides inline', () => {
    expect(getNavigationBarStyle({ containerColor: 'tomato' })).toEqual({
      '--_navigation-bar-container-color': 'tomato',
    });
    expect(getTabsStyle('primary', 'fixed', { indicatorColor: 'gold' })).toEqual({
      '--_tabs-indicator-color': 'gold',
    });
    expect(getModalDrawerSheetStyle({ shape: '12px' })).toMatchObject({
      '--_navigation-drawer-radius-start-start': '12px',
      '--_navigation-drawer-radius-end-end': '12px',
    });
    expect(getModalWideNavigationRailStyle({ modalShape: '16px' })).toEqual({
      '--_modal-wide-navigation-rail-radius': '16px',
    });
  });

  it('routes item overrides through CSS-owned selected state', () => {
    expect(getNavigationBarItemStyle(true, {}, { selectedIconColor: 'red' })).toEqual({
      '--_navigation-bar-selected-icon-override': 'red',
    });
    expect(getNavigationRailItemStyle(false, true, {}, { unselectedLabelColor: 'blue' })).toEqual({
      '--_navigation-rail-unselected-label-override': 'blue',
    });
    expect(getShortNavigationBarItemStyle(true, 'start', {}, { selectedStartLabelColor: 'green' })).toEqual({
      '--_short-navigation-bar-selected-start-label-override': 'green',
    });
    expect(getWideNavigationRailItemStyle(true, true, true, {}, { indicatorColor: 'gold' })).toEqual({
      '--_wide-navigation-rail-indicator-override': 'gold',
    });
  });
});
