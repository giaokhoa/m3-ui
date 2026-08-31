import { describe, expect, it } from 'vitest';
import {
  calculatePaneScaffoldDirective,
  calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth,
  calculateWindowAdaptiveInfo,
  defaultWindowPosture,
  paneScaffoldTokens,
  type FoldingFeature,
  type HingePolicy,
  type PaneScaffoldDirective,
  type WindowPosture,
} from './paneScaffoldDirective';

function info(width: number, height = 800, posture = defaultWindowPosture) {
  return calculateWindowAdaptiveInfo({ width, height }, posture);
}

describe('Material 3 pane scaffold directive', () => {
  it('projects the pinned AndroidX pane metrics from canonical tokens', () => {
    expect(paneScaffoldTokens).toEqual({
      partitionSpacer: '24px',
      preferredWidth: '360px',
      preferredWidthExtraLarge: '412px',
      preferredHeight: '420px',
    });
  });

  it.each([
    [360, 1, '0px', '360px'],
    [600, 1, '0px', '360px'],
    [840, 2, '24px', '360px'],
    [1200, 3, '24px', '412px'],
    [1600, 3, '24px', '412px'],
  ] as const)(
    'maps width %s to %s horizontal partitions',
    (width, partitions, spacer, preferredWidth) => {
      const directive = calculatePaneScaffoldDirective(info(width));
      expect(directive.maxHorizontalPartitions).toBe(partitions);
      expect(directive.horizontalPartitionSpacerSize).toBe(spacer);
      expect(directive.defaultPanePreferredWidth).toBe(preferredWidth);
      expect(directive.defaultPanePreferredHeight).toBe('420px');
    },
  );

  it('keeps custom partition counts open like AndroidX PaneScaffoldDirective', () => {
    const directive: PaneScaffoldDirective = {
      ...calculatePaneScaffoldDirective(info(1200)),
      maxHorizontalPartitions: 4,
      maxVerticalPartitions: 3,
    };

    expect(directive.maxHorizontalPartitions).toBe(4);
    expect(directive.maxVerticalPartitions).toBe(3);
  });

  it('uses two vertical partitions for expanded height only in a single-pane width', () => {
    expect(calculatePaneScaffoldDirective(info(600, 900))).toMatchObject({
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      verticalPartitionSpacerSize: '24px',
    });

    expect(calculatePaneScaffoldDirective(info(840, 900))).toMatchObject({
      maxHorizontalPartitions: 2,
      maxVerticalPartitions: 1,
      verticalPartitionSpacerSize: '0px',
    });
  });

  it('uses two vertical partitions in tabletop posture', () => {
    const posture: WindowPosture = { isTabletop: true, foldingFeatures: [] };
    expect(calculatePaneScaffoldDirective(info(1200, 700, posture))).toMatchObject({
      maxVerticalPartitions: 2,
      verticalPartitionSpacerSize: '24px',
    });
  });

  it('matches the dense two-pane medium-width alternative', () => {
    expect(
      calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth(info(700)),
    ).toMatchObject({
      maxHorizontalPartitions: 2,
      horizontalPartitionSpacerSize: '24px',
      maxVerticalPartitions: 1,
      verticalPartitionSpacerSize: '0px',
    });
  });

  it('applies AndroidX-compatible vertical hinge policies', () => {
    const separating: FoldingFeature = {
      left: 500,
      top: 0,
      right: 520,
      bottom: 900,
      orientation: 'vertical',
      isSeparating: true,
      isOccluding: false,
    };
    const occluding: FoldingFeature = {
      left: 700,
      top: 0,
      right: 720,
      bottom: 900,
      orientation: 'vertical',
      isSeparating: true,
      isOccluding: true,
    };
    const horizontal: FoldingFeature = {
      left: 0,
      top: 400,
      right: 1200,
      bottom: 420,
      orientation: 'horizontal',
      isSeparating: true,
      isOccluding: true,
    };
    const posture: WindowPosture = {
      isTabletop: false,
      foldingFeatures: [separating, occluding, horizontal],
    };

    const expectedCounts: Record<HingePolicy, number> = {
      'always-avoid': 2,
      'avoid-separating': 2,
      'avoid-occluding': 1,
      'never-avoid': 0,
    };

    for (const [policy, count] of Object.entries(expectedCounts) as [
      HingePolicy,
      number,
    ][]) {
      expect(
        calculatePaneScaffoldDirective(info(1200, 800, posture), policy)
          .excludedBounds,
      ).toHaveLength(count);
    }
  });
});
