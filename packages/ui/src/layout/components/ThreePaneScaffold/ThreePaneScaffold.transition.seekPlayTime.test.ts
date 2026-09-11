import { describe, expect, it } from 'vitest';
import {
  PaneMotionDefaultDisplacementThreshold,
  samplePaneMotionVectorSpringAtPlayTime,
} from '../../adaptive/paneMotionSpring';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldTransitionFrame } from './ThreePaneScaffold.transition';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 3,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const paneOrder: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

const currentValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const targetValue: ThreePaneScaffoldValue = {
  ...currentValue,
  tertiary: PaneAdaptedValue.Levitated('center', 'scrim'),
};

describe('ThreePaneScaffold seek playtime parity', () => {
  it('rounds seek playtime in nanoseconds before Float spring sampling', () => {
    const progress = Math.fround(0.003048779908567667);

    // The Material modal visibility spring is 328ms. Multiplying in JS Double
    // lands just below 1ms, which used to make the web sampler truncate to 0ms.
    expect(328 * progress).toBeLessThan(1);

    const result = calculateThreePaneScaffoldTransitionFrame({
      width: 1000,
      height: 800,
      directive,
      currentValue,
      targetValue,
      progressFraction: progress,
      paneOrder,
    });

    // SeekableTransitionState.seekToFraction multiplies the Float-as-Double by
    // 328_000_000ns and roundToLong()s to 1_000_000ns. FloatSpringSpec then
    // samples exactly 1ms of spring motion.
    const oneMillisecondOpacity = samplePaneMotionVectorSpringAtPlayTime(
      [0],
      [1],
      1,
      PaneMotionDefaultDisplacementThreshold,
    )[0]!;
    expect(oneMillisecondOpacity).toBeGreaterThan(0);
    expect(result.tertiary?.opacity).toBe(oneMillisecondOpacity);
    expect(result.scrimOpacity).toBe(oneMillisecondOpacity);
  });
});
