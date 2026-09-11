import type { CSSProperties } from 'react';

export type TabsVariant = 'primary' | 'secondary';
export type TabsMode = 'fixed' | 'scrollable';
export type TabsStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface TabsStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  indicatorColor?: CSSProperties['backgroundColor'];
}
export interface TabStyleOptions { selected?: boolean; disabled?: boolean; }

/** Renderer mechanics that require runtime measurement/scroll behavior. */
export const tabsRuntime = {
  scrollableEdgePadding: 52,
  scrollableMinTabWidth: 90,
  horizontalTextPadding: 16,
  leadingIconLabelGap: 8,
  stackedIconLabelGap: 4,
  stackedIconAndLabelHeight: 72,
  secondaryIndicatorHeight: 3,
  disabledAlpha: 0.38,
} as const;

export function getTabsStyle(
  _variant: TabsVariant,
  _mode: TabsMode,
  options: TabsStyleOptions = {},
): TabsStyle {
  return {
    ...(options.containerColor !== undefined
      ? { '--_tabs-container-color': options.containerColor }
      : {}),
    ...(options.indicatorColor !== undefined
      ? { '--_tabs-indicator-color': options.indicatorColor }
      : {}),
  };
}

/** Static selected/disabled state is owned by generated CSS via RAC data attributes. */
export function getTabStyle(
  _variant: TabsVariant,
  _options: TabStyleOptions = {},
): TabsStyle {
  return {};
}
