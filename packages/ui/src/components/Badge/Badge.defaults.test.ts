import { describe, expect, it } from 'vitest';
import {
  badgeRuntime,
  getBadgeStyle,
  getBadgedBoxStyle,
} from './Badge.defaults';

describe('Badge runtime defaults', () => {
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

  it('leaves immutable paint, size, shape and typography to generated CSS', () => {
    expect(getBadgeStyle(false)).toEqual({
      '--_badge-padding-inline': '0px',
    });
    expect(getBadgeStyle(true)).toEqual({
      '--_badge-padding-inline': '4px',
    });
  });

  it('keeps public color overrides local to the badge', () => {
    expect(
      getBadgeStyle(true, {
        containerColor: 'rebeccapurple',
        contentColor: 'white',
      }),
    ).toEqual({
      '--_badge-padding-inline': '4px',
      '--_badge-container-color': 'rebeccapurple',
      '--_badge-content-color': 'white',
    });
  });

  it('does not emit a content color override for dot badges', () => {
    expect(getBadgeStyle(false, { contentColor: 'white' })).toEqual({
      '--_badge-padding-inline': '0px',
    });
  });
});
