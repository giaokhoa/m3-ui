import { describe, expect, it } from 'vitest';
import {
  getTabStyle,
  getTabsStyle,
  tabsRuntime,
  tabsTokens,
} from './Tabs.defaults';

describe('Material 3 Tabs defaults', () => {
  it('keeps canonical navigation tab tokens as the generated source', () => {
    expect(tabsTokens.primary.containerHeight).toBe('48px');
    expect(tabsTokens.primary.iconAndLabelTextContainerHeight).toBe('64px');
    expect(tabsTokens.primary.activeIndicatorHeight).toBe('3px');
    expect(tabsTokens.secondary.activeIndicatorHeight).toBe('2px');
    expect(tabsTokens.primary.iconSize).toBe('24px');
    expect(tabsTokens.secondary.iconSize).toBe('24px');
  });

  it('keeps AndroidX renderer mechanics beside the consumer', () => {
    expect(tabsRuntime).toMatchObject({
      scrollableEdgePadding: 52,
      scrollableMinTabWidth: 90,
      horizontalTextPadding: 16,
      leadingIconLabelGap: 8,
      stackedIconAndLabelHeight: 72,
      secondaryIndicatorHeight: 3,
      disabledAlpha: 0.38,
    });
  });

  it('maps primary and secondary indicator behavior independently', () => {
    const primary = getTabsStyle('primary', 'fixed');
    const secondary = getTabsStyle('secondary', 'fixed');

    expect(primary['--_tabs-indicator-height']).toBe('3px');
    expect(primary['--_tabs-indicator-radius']).toBe('3px 3px 0px 0px');
    expect(secondary['--_tabs-indicator-height']).toBe('3px');
    expect(secondary['--_tabs-indicator-radius']).toBe('0px');
  });

  it('exposes scrollable geometry and DefaultSpatial motion as CSS variables', () => {
    const style = getTabsStyle('primary', 'scrollable');
    expect(style['--_tabs-edge-padding']).toBe('52px');
    expect(style['--_tabs-min-tab-width']).toBe('90px');
    expect(style['--_tabs-motion-duration']).toBe(
      tabsRuntime.motion.indicator.duration,
    );
    expect(style['--_tabs-motion-easing']).toBe(
      tabsRuntime.motion.indicator.easing,
    );
  });

  it('maps selected, inactive and disabled content without mutating tokens', () => {
    const selected = getTabStyle('primary', { selected: true });
    const inactive = getTabStyle('primary', { selected: false });
    const disabled = getTabStyle('secondary', { disabled: true });

    expect(selected['--_tabs-label-color']).toBe(
      tabsTokens.primary.activeLabelTextColor,
    );
    expect(inactive['--_tabs-label-color']).toBe(
      tabsTokens.primary.inactiveLabelTextColor,
    );
    expect(disabled['--_tabs-content-opacity']).toBe(0.38);
    expect(selected['--_tabs-tab-large-height']).toBe('72px');
  });
});
