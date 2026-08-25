import { describe, expect, it } from 'vitest';
import * as token from '@m3/tokens';
import {
  dialogRuntime,
  dialogTokens,
  getDialogActionStyle,
  getDialogOverlayStyle,
  getDialogStyle,
} from './Dialog.defaults';

describe('Material 3 Dialog defaults', () => {
  it('projects the complete AndroidX Dialog token family', () => {
    expect(dialogTokens).toEqual({
      actionFocusLabelTextColor: token.ComponentDialogActionFocusLabelTextColor,
      actionHoverLabelTextColor: token.ComponentDialogActionHoverLabelTextColor,
      actionLabelTextColor: token.ComponentDialogActionLabelTextColor,
      actionLabelTypography: token.ComponentDialogActionLabelTextFont,
      actionPressedLabelTextColor: token.ComponentDialogActionPressedLabelTextColor,
      containerColor: token.ComponentDialogContainerColor,
      containerElevation: token.ComponentDialogContainerElevation,
      containerShape: token.ComponentDialogContainerShape,
      headlineColor: token.ComponentDialogHeadlineColor,
      headlineTypography: token.ComponentDialogHeadlineFont,
      supportingTextColor: token.ComponentDialogSupportingTextColor,
      supportingTextTypography: token.ComponentDialogSupportingTextFont,
      iconColor: token.ComponentDialogIconColor,
      iconSize: token.ComponentDialogIconSize,
    });
  });

  it('keeps AndroidX renderer geometry beside the Dialog renderer', () => {
    expect(dialogRuntime).toEqual({
      minimumWidth: 280,
      maximumWidth: 560,
      viewportMargin: 24,
      contentPadding: 24,
      iconBottomSpacing: 16,
      titleBottomSpacing: 16,
      supportingTextBottomSpacing: 24,
      actionSpacing: 8,
    });
  });

  it('emits Material surface, typography, icon and Level3 elevation variables', () => {
    const style = getDialogStyle();

    expect(style['--_dialog-container-color']).toBe(
      token.ComponentDialogContainerColor,
    );
    expect(style['--_dialog-radius']).toBe(token.ShapeExtraLarge);
    expect(style['--_dialog-icon-size']).toBe('24px');
    expect(style['--_dialog-headline-font-size']).toBe(
      token.TypographyHeadlineSmallFontSize,
    );
    expect(style['--_dialog-supporting-text-font-size']).toBe(
      token.TypographyBodyMediumFontSize,
    );
    expect(style['--_dialog-action-font-size']).toBe(
      token.TypographyLabelLargeFontSize,
    );
    expect(String(style['--_dialog-box-shadow'])).toContain('color-mix');
  });

  it('reuses the Scrim recipe while keeping RAC as the interactive underlay', () => {
    const style = getDialogOverlayStyle();

    expect(style['--_scrim-container-color']).toBe(token.ScrimContainerColor);
    expect(style['--_scrim-container-opacity']).toBe(
      token.ScrimContainerOpacity,
    );
    expect(style['--_dialog-min-width']).toBe('280px');
    expect(style['--_dialog-max-width']).toBe('560px');
    expect(style['--_dialog-viewport-margin']).toBe('24px');
    expect(
      getDialogOverlayStyle({ scrimAlpha: 0.5 })[
        '--_scrim-container-opacity'
      ],
    ).toBe(0.16);
  });

  it('projects Dialog action states onto the shared TextButton engine without mutating defaults', () => {
    expect(getDialogActionStyle()).toMatchObject({
      '--_button-content-color': 'var(--_dialog-action-color)',
      '--ripple-color': 'var(--_dialog-action-color)',
    });
    expect(getDialogActionStyle({ isHovered: true })).toMatchObject({
      '--_button-content-color': 'var(--_dialog-action-hover-color)',
      '--ripple-color': 'var(--_dialog-action-hover-color)',
    });
    expect(getDialogActionStyle({ isFocusVisible: true })).toMatchObject({
      '--_button-content-color': 'var(--_dialog-action-focus-color)',
    });
    expect(getDialogActionStyle({ isPressed: true })).toMatchObject({
      '--_button-content-color': 'var(--_dialog-action-pressed-color)',
    });

    const overridden = getDialogStyle({
      containerColor: 'rebeccapurple',
      actionColor: 'tomato',
    });
    expect(overridden['--_dialog-container-color']).toBe('rebeccapurple');
    expect(overridden['--_dialog-action-color']).toBe('tomato');
    expect(dialogTokens.containerColor).toBe(token.ComponentDialogContainerColor);
  });
});
