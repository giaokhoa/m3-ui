import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  badgeRuntime,
  badgeTokens,
  getBadgeStyle,
  getBadgedBoxStyle,
} from './Badge.defaults';

describe('Badge defaults', () => {
  it('projects canonical Material 3 badge tokens', () => {
    expect(badgeTokens.small).toEqual({
      color: token.ComponentBadgeSmallColor,
      shape: token.ComponentBadgeSmallShape,
      size: 6,
    });
    expect(badgeTokens.large).toMatchObject({
      color: token.ComponentBadgeLargeColor,
      contentColor: token.ComponentBadgeLargeLabelTextColor,
      shape: token.ComponentBadgeLargeShape,
      size: 16,
    });
    expect(badgeTokens.large.typography).toEqual({
      fontFamily: token.TypographyLabelSmallFontFamily,
      fontSize: token.TypographyLabelSmallFontSize,
      lineHeight: token.TypographyLabelSmallLineHeight,
      fontWeight: token.TypographyLabelSmallFontWeight,
      letterSpacing: token.TypographyLabelSmallLetterSpacing,
    });
  });

  it('keeps current Compose-only layout mechanics beside the consumer', () => {
    expect(badgeRuntime).toEqual({
      contentHorizontalPadding: 4,
      dotOffset: 6,
      contentHorizontalOffset: 12,
      contentVerticalOffset: 14,
    });
    expect(getBadgedBoxStyle()).toEqual({
      '--_badge-dot-offset': '6px',
      '--_badge-content-horizontal-offset': '12px',
      '--_badge-content-vertical-offset': '14px',
    });
  });

  it('emits canonical dot and content styles', () => {
    expect(getBadgeStyle(false)).toMatchObject({
      '--_badge-container-color': token.ComponentBadgeSmallColor,
      '--_badge-content-color': 'transparent',
      '--_badge-size': '6px',
      '--_badge-padding-inline': '0px',
    });
    expect(getBadgeStyle(true)).toMatchObject({
      '--_badge-container-color': token.ComponentBadgeLargeColor,
      '--_badge-content-color': token.ComponentBadgeLargeLabelTextColor,
      '--_badge-size': '16px',
      '--_badge-padding-inline': '4px',
      '--_badge-font-size': token.TypographyLabelSmallFontSize,
    });
  });

  it('keeps public color overrides local to the badge', () => {
    expect(
      getBadgeStyle(true, {
        containerColor: 'rebeccapurple',
        contentColor: 'white',
      }),
    ).toMatchObject({
      '--_badge-container-color': 'rebeccapurple',
      '--_badge-content-color': 'white',
    });
  });
});
