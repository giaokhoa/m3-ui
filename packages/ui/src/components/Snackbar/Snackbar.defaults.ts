import type { CSSProperties } from 'react';

export type SnackbarStyle = CSSProperties & Record<`--${string}`, string | number>;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

export interface SnackbarStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  actionColor?: CSSProperties['color'];
  iconColor?: CSSProperties['color'];
  shadowColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  maxWidth?: CSSProperties['maxWidth'];
}

type SnackbarSurfaceStyleOptions = Omit<SnackbarStyleOptions, 'shadowColor'>;

export const snackbarRuntime = {
  maximumWidth: 600,
  horizontalSpacing: 16,
  horizontalSpacingButtonSide: 8,
  textEndExtraSpacing: 8,
  verticalPadding: 14,
  actionButtonBottomPadding: 4,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** Runtime-only style projection. Immutable defaults live in generated snackbar.css. */
export function getSnackbarStyle(options: SnackbarSurfaceStyleOptions = {}): SnackbarStyle {
  const style: SnackbarStyle = {};
  if (options.containerColor !== undefined) style['--_snackbar-container-color'] = options.containerColor;
  if (options.contentColor !== undefined) style['--_snackbar-content-color'] = options.contentColor;
  if (options.actionColor !== undefined) {
    style['--_snackbar-action-color'] = options.actionColor;
    style['--_snackbar-action-focus-color'] = options.actionColor;
    style['--_snackbar-action-hover-color'] = options.actionColor;
    style['--_snackbar-action-pressed-color'] = options.actionColor;
    style['--_snackbar-action-focus-state-layer-color'] = options.actionColor;
    style['--_snackbar-action-hover-state-layer-color'] = options.actionColor;
    style['--_snackbar-action-pressed-state-layer-color'] = options.actionColor;
  }
  if (options.iconColor !== undefined) {
    style['--_snackbar-icon-color'] = options.iconColor;
    style['--_snackbar-icon-focus-color'] = options.iconColor;
    style['--_snackbar-icon-hover-color'] = options.iconColor;
    style['--_snackbar-icon-pressed-color'] = options.iconColor;
    style['--_snackbar-icon-focus-state-layer-color'] = options.iconColor;
    style['--_snackbar-icon-hover-state-layer-color'] = options.iconColor;
    style['--_snackbar-icon-pressed-state-layer-color'] = options.iconColor;
  }
  if (options.shape !== undefined) style['--_snackbar-radius'] = cssLength(options.shape as CssLength);
  if (options.maxWidth !== undefined) style['--_snackbar-max-width'] = cssLength(options.maxWidth as CssLength);
  return style;
}
