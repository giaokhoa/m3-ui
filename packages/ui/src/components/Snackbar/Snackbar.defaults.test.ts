import { describe, expect, it } from 'vitest';
import { getElevationBoxShadow } from '../../internal/elevation';
import {
  getSnackbarActionStyle,
  getSnackbarDismissActionStyle,
  getSnackbarStyle,
  snackbarRuntime,
  snackbarTokens,
} from './Snackbar.defaults';

describe('Snackbar defaults', () => {
  it('projects the complete canonical Snackbar token family', () => {
    expect(snackbarTokens).toEqual({
      actionLabelTextColor: 'var(--inverse-primary)',
      actionFocusLabelTextColor: 'var(--inverse-primary)',
      actionHoverLabelTextColor: 'var(--inverse-primary)',
      actionPressedLabelTextColor: 'var(--inverse-primary)',
      actionLabelTypography: 'labelLarge',
      actionFocusStateLayerColor: 'var(--inverse-primary)',
      actionFocusStateLayerOpacity: 0.1,
      actionHoverStateLayerColor: 'var(--inverse-primary)',
      actionHoverStateLayerOpacity: 0.08,
      actionPressedStateLayerColor: 'var(--inverse-primary)',
      actionPressedStateLayerOpacity: 0.1,
      containerColor: 'var(--inverse-surface)',
      containerElevation: 'level3',
      containerShape: 'extraSmall',
      containerSingleLineHeight: '48px',
      containerTwoLinesHeight: '68px',
      containerShadowColor: 'var(--shadow)',
      iconColor: 'var(--inverse-on-surface)',
      iconFocusColor: 'var(--inverse-on-surface)',
      iconHoverColor: 'var(--inverse-on-surface)',
      iconPressedColor: 'var(--inverse-on-surface)',
      iconSize: '24px',
      iconFocusStateLayerColor: 'var(--inverse-on-surface)',
      iconFocusStateLayerOpacity: 0.1,
      iconHoverStateLayerColor: 'var(--inverse-on-surface)',
      iconHoverStateLayerOpacity: 0.08,
      iconPressedStateLayerColor: 'var(--inverse-on-surface)',
      iconPressedStateLayerOpacity: 0.1,
      supportingTextColor: 'var(--inverse-on-surface)',
      supportingTextTypography: 'bodyMedium',
    });
  });

  it('keeps Compose renderer-only geometry beside the Snackbar renderer', () => {
    expect(snackbarRuntime).toEqual({
      maximumWidth: 600,
      horizontalSpacing: 16,
      horizontalSpacingButtonSide: 8,
      textEndExtraSpacing: 8,
      verticalPadding: 14,
      actionButtonBottomPadding: 4,
    });
  });

  it('emits canonical surface, typography, elevation and geometry variables', () => {
    const style = getSnackbarStyle();

    expect(style).toMatchObject({
      '--_snackbar-container-color': 'var(--inverse-surface)',
      '--_snackbar-content-color': 'var(--inverse-on-surface)',
      '--_snackbar-action-color': 'var(--inverse-primary)',
      '--_snackbar-icon-color': 'var(--inverse-on-surface)',
      '--_snackbar-icon-size': '24px',
      '--_snackbar-radius': '4px',
      '--_snackbar-single-line-height': '48px',
      '--_snackbar-two-lines-height': '68px',
      '--_snackbar-max-width': '600px',
      '--_snackbar-horizontal-spacing': '16px',
      '--_snackbar-button-side-spacing': '8px',
      '--_snackbar-text-end-extra-spacing': '8px',
      '--_snackbar-vertical-padding': '14px',
      '--_snackbar-action-bottom-padding': '4px',
      '--_snackbar-text-font-family': 'var(--font-family-plain)',
      '--_snackbar-text-font-size': '14px',
      '--_snackbar-text-line-height': '20px',
      '--_snackbar-text-font-weight': 400,
      '--_snackbar-text-letter-spacing': '0.2px',
      '--_snackbar-action-font-family': 'var(--font-family-plain)',
      '--_snackbar-action-font-size': '14px',
      '--_snackbar-action-line-height': '20px',
      '--_snackbar-action-font-weight': 500,
      '--_snackbar-action-letter-spacing': '0.1px',
    });
    expect(style['--_snackbar-box-shadow']).toBe(
      getElevationBoxShadow('level3', 'var(--shadow)'),
    );
  });

  it('keeps visual overrides local to the rendered Snackbar surface', () => {
    const style = getSnackbarStyle({
      containerColor: 'tomato',
      contentColor: 'white',
      actionColor: 'gold',
      iconColor: 'silver',
      shadowColor: 'black',
      shape: 12,
      maxWidth: 420,
    });

    expect(style).toMatchObject({
      '--_snackbar-container-color': 'tomato',
      '--_snackbar-content-color': 'white',
      '--_snackbar-action-color': 'gold',
      '--_snackbar-action-focus-color': 'gold',
      '--_snackbar-icon-color': 'silver',
      '--_snackbar-icon-pressed-color': 'silver',
      '--_snackbar-radius': '12px',
      '--_snackbar-max-width': '420px',
    });
    expect(style['--_snackbar-box-shadow']).toBe(
      getElevationBoxShadow('level3', 'black'),
    );
  });

  it('maps RAC action states to Snackbar-specific label and state-layer roles', () => {
    expect(getSnackbarActionStyle({ isHovered: true })).toMatchObject({
      '--_button-content-color': 'var(--_snackbar-action-hover-color)',
      '--ripple-color': 'var(--_snackbar-action-hover-state-layer-color)',
    });
    expect(getSnackbarActionStyle({ isFocusVisible: true })).toMatchObject({
      '--_button-content-color': 'var(--_snackbar-action-focus-color)',
      '--ripple-color': 'var(--_snackbar-action-focus-state-layer-color)',
    });
    expect(getSnackbarActionStyle({ isPressed: true })).toMatchObject({
      '--_button-content-color': 'var(--_snackbar-action-pressed-color)',
      '--ripple-color': 'var(--_snackbar-action-pressed-state-layer-color)',
    });
    expect(getSnackbarDismissActionStyle({ isPressed: true })).toMatchObject({
      '--_icon-button-content-color': 'var(--_snackbar-icon-pressed-color)',
      '--_icon-button-icon-size': 'var(--_snackbar-icon-size)',
      '--ripple-color': 'var(--_snackbar-icon-pressed-state-layer-color)',
    });
  });
});
