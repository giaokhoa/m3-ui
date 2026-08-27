import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';
import { getElevationBoxShadow, type ElevationLevel } from '../../internal/elevation';

type MenuStyle = CSSProperties & Record<`--${string}`, string | number>;
type TokenBag = Record<string, string | number>;
const t = token as unknown as TokenBag;

function value(name: string, fallback: string | number) {
  return t[name] ?? fallback;
}

export const menuTokens = {
  containerColor: value('ComponentMenuBaseContainerColor', 'var(--surface-container)'),
  containerElevation: value('ComponentMenuBaseContainerElevation', 'level2') as ElevationLevel,
  containerShape: value('ComponentMenuBaseContainerShape', 'extraSmall'),
  itemColor: value('ComponentMenuStandardItemLabelTextColor', 'var(--on-surface)'),
  itemIconColor: value('ComponentMenuStandardItemLeadingIconColor', 'var(--on-surface-variant)'),
  disabledColor: value('ComponentMenuStandardItemDisabledLabelTextColor', 'var(--on-surface)'),
  disabledOpacity: Number(value('ComponentMenuStandardItemDisabledLabelTextOpacity', 0.38)),
  selectedContainerColor: value('ComponentMenuStandardItemSelectedContainerColor', 'var(--tertiary-container)'),
  selectedColor: value('ComponentMenuStandardItemSelectedLabelTextColor', 'var(--on-tertiary-container)'),
  segmentedContainerColor: value('ComponentMenuSegmentedGroupContainerColor', 'var(--surface-container-low)'),
  segmentedGroupPadding: value('ComponentMenuSegmentedGroupPadding', 4),
} as const;

// Layout constants are owned by AndroidX Menu.kt/MenuDefaults.kt rather than the
// canonical token graph. Keep web adaptation values local to the renderer.
export const menuRuntime = {
  minWidth: 112,
  maxWidth: 280,
  itemMinHeight: 48,
  itemPaddingInline: 12,
  contentPaddingBlock: 8,
  iconSize: 24,
  iconGap: 12,
  viewportMargin: 8,
  exposedMatchAnchorWidth: true,
  motion: {
    duration: value('MotionSpringFastSpatialDuration', '200ms'),
    easing: value('MotionSpringFastSpatialEasing', 'cubic-bezier(.2, 0, 0, 1)'),
  },
} as const;

const shapeRadius: Record<string, string | number> = {
  extraSmall: value('ShapeExtraSmall', '4px'),
  small: value('ShapeSmall', '8px'),
  medium: value('ShapeMedium', '12px'),
  large: value('ShapeLarge', '16px'),
};

export function getMenuStyle(): MenuStyle {
  const shape = String(menuTokens.containerShape);
  return {
    '--_menu-container-color': menuTokens.containerColor,
    '--_menu-color': menuTokens.itemColor,
    '--_menu-icon-color': menuTokens.itemIconColor,
    '--_menu-disabled-color': menuTokens.disabledColor,
    '--_menu-disabled-opacity': menuTokens.disabledOpacity,
    '--_menu-selected-container-color': menuTokens.selectedContainerColor,
    '--_menu-selected-color': menuTokens.selectedColor,
    '--_menu-segmented-container-color': menuTokens.segmentedContainerColor,
    '--_menu-radius': shapeRadius[shape] ?? shape,
    '--_menu-shadow': getElevationBoxShadow(menuTokens.containerElevation, 'var(--shadow, #000)'),
    '--_menu-min-width': `${menuRuntime.minWidth}px`,
    '--_menu-max-width': `${menuRuntime.maxWidth}px`,
    '--_menu-item-min-height': `${menuRuntime.itemMinHeight}px`,
    '--_menu-item-padding-inline': `${menuRuntime.itemPaddingInline}px`,
    '--_menu-content-padding-block': `${menuRuntime.contentPaddingBlock}px`,
    '--_menu-icon-size': `${menuRuntime.iconSize}px`,
    '--_menu-icon-gap': `${menuRuntime.iconGap}px`,
    '--_menu-motion-duration': menuRuntime.motion.duration,
    '--_menu-motion-easing': menuRuntime.motion.easing,
  };
}
