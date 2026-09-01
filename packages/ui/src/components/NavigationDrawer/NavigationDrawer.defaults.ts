import type { CSSProperties } from 'react';
import { getScrimStyle } from '../Scrim';

export type NavigationDrawerStyle = CSSProperties & Record<`--${string}`, string | number>;
type CssLength = NonNullable<CSSProperties['width']>;

export interface DrawerSheetStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  width?: CSSProperties['width'];
  shape?: CSSProperties['borderRadius'];
}
export type PermanentDrawerSheetStyleOptions = DrawerSheetStyleOptions;
export type DismissibleDrawerSheetStyleOptions = DrawerSheetStyleOptions;
export type ModalDrawerSheetStyleOptions = DrawerSheetStyleOptions;
export interface ModalNavigationDrawerOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  alpha?: number;
}
export interface NavigationDrawerItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
}

/** Values needed by JS gesture/measurement/unmount mechanics. Paint and motion CSS are generated. */
export const navigationDrawerRuntime = {
  minimumDrawerWidth: 240,
  maximumDrawerWidth: 360,
  positionalThreshold: 0.5,
  velocityThreshold: 400,
  dragSlop: 4,
  motion: { close: { duration: '108ms' } },
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function sheetStyle(options: DrawerSheetStyleOptions = {}): NavigationDrawerStyle {
  const style: NavigationDrawerStyle = {};
  if (options.width !== undefined) style['--_navigation-drawer-width'] = cssLength(options.width as CssLength);
  if (options.containerColor !== undefined) style['--_navigation-drawer-container-color'] = options.containerColor;
  if (options.contentColor !== undefined) style['--_navigation-drawer-content-color'] = options.contentColor;
  if (options.shape !== undefined) {
    style['--_navigation-drawer-radius-start-start'] = options.shape;
    style['--_navigation-drawer-radius-start-end'] = options.shape;
    style['--_navigation-drawer-radius-end-end'] = options.shape;
    style['--_navigation-drawer-radius-end-start'] = options.shape;
  }
  return style;
}

export function getPermanentDrawerSheetStyle(options: PermanentDrawerSheetStyleOptions = {}) { return sheetStyle(options); }
export function getDismissibleDrawerSheetStyle(options: DismissibleDrawerSheetStyleOptions = {}) { return sheetStyle(options); }
export function getModalDrawerSheetStyle(options: ModalDrawerSheetStyleOptions = {}) { return sheetStyle(options); }

export function getModalNavigationDrawerOverlayStyle(
  options: ModalNavigationDrawerOverlayStyleOptions = {},
): NavigationDrawerStyle {
  return getScrimStyle({
    containerColor: options.scrimColor,
    containerOpacity: options.scrimOpacity,
    alpha: options.alpha,
  });
}

export function getNavigationDrawerMotionStyle(offset: number, drawerWidth: number): NavigationDrawerStyle {
  return {
    '--_navigation-drawer-offset': `${offset}px`,
    '--_navigation-drawer-closed-offset': `${-drawerWidth}px`,
    '--_navigation-drawer-content-offset': `${drawerWidth + offset}px`,
  };
}

/** RAC data attributes now own selected/hover/focus/pressed styling in generated CSS. */
export function getNavigationDrawerItemStyle(
  _selected: boolean,
  _state: NavigationDrawerItemInteractionState = {},
): NavigationDrawerStyle {
  return {};
}
