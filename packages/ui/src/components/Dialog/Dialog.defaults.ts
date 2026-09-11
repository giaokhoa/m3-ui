import type { CSSProperties } from 'react';
import { getScrimStyle } from '../Scrim';

export type DialogStyle = CSSProperties & Record<`--${string}`, string | number>;
type CssLength = NonNullable<CSSProperties['maxWidth']>;

export interface DialogStyleOptions {
  containerColor?: CSSProperties['backgroundColor'];
  headlineColor?: CSSProperties['color'];
  supportingTextColor?: CSSProperties['color'];
  iconColor?: CSSProperties['color'];
  actionColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  shadowColor?: CSSProperties['color'];
}

export interface DialogOverlayStyleOptions {
  scrimColor?: CSSProperties['backgroundColor'];
  scrimOpacity?: number;
  scrimAlpha?: number;
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
}

export const dialogRuntime = {
  minimumWidth: 280,
  maximumWidth: 560,
  viewportMargin: 24,
  contentPadding: 24,
  iconBottomSpacing: 16,
  titleBottomSpacing: 16,
  supportingTextBottomSpacing: 24,
  actionSpacing: 8,
} as const;

function cssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** Runtime-only visual overrides. Immutable Material defaults live in generated dialog.css. */
export function getDialogStyle(options: DialogStyleOptions = {}): DialogStyle {
  const style: DialogStyle = {};
  if (options.containerColor !== undefined) style['--_dialog-container-color'] = options.containerColor;
  if (options.headlineColor !== undefined) style['--_dialog-headline-color'] = options.headlineColor;
  if (options.supportingTextColor !== undefined) style['--_dialog-supporting-text-color'] = options.supportingTextColor;
  if (options.iconColor !== undefined) style['--_dialog-icon-color'] = options.iconColor;
  if (options.actionColor !== undefined) {
    style['--_dialog-action-color'] = options.actionColor;
    style['--_dialog-action-focus-color'] = options.actionColor;
    style['--_dialog-action-hover-color'] = options.actionColor;
    style['--_dialog-action-pressed-color'] = options.actionColor;
  }
  if (options.shape !== undefined) style['--_dialog-radius'] = cssLength(options.shape as CssLength);
  return style;
}

export function getDialogOverlayStyle(options: DialogOverlayStyleOptions = {}): DialogStyle {
  return {
    ...getScrimStyle({
      containerColor: options.scrimColor,
      containerOpacity: options.scrimOpacity,
      alpha: options.scrimAlpha,
    }),
    ...(options.minWidth === undefined ? {} : { '--_dialog-min-width': cssLength(options.minWidth as CssLength) }),
    ...(options.maxWidth === undefined ? {} : { '--_dialog-max-width': cssLength(options.maxWidth as CssLength) }),
  };
}
