import { describe, expect, it } from 'vitest';
import { DockedEdge, DragToResizeState } from './dragToResizeState';
import type { PaneScaffoldDirective } from './paneScaffoldDirective';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  PaneAlignment,
  ThreePaneScaffoldRole,
  calculateThreePaneScaffoldValue,
  isPaneInteractable,
  supportingPaneScaffoldAdaptStrategies,
} from './threePaneScaffold';

const singlePaneDirective: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('calculateThreePaneScaffoldValue', () => {
  it('uses primary, secondary, tertiary priority without a destination', () => {
    expect(
      calculateThreePaneScaffoldValue({ maxHorizontalPartitions: 1 }),
    ).toMatchObject({
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    });

    expect(
      calculateThreePaneScaffoldValue({ maxHorizontalPartitions: 2 }),
    ).toMatchObject({
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    });
  });

  it('treats the newest destination as highest priority', () => {
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 2,
      destinationHistory: [
        { pane: ThreePaneScaffoldRole.Tertiary },
        { pane: ThreePaneScaffoldRole.Secondary },
      ],
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Hidden);
    expect(value.secondary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.tertiary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.currentDestination).toBe(ThreePaneScaffoldRole.Secondary);
  });

  it('reflows the current pane under its anchor in a single horizontal/two vertical layout', () => {
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Reflow(ThreePaneScaffoldRole.Tertiary),
        tertiary: PaneAdaptStrategy.Hide,
      },
      destinationHistory: [{ pane: ThreePaneScaffoldRole.Secondary }],
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Hidden);
    expect(value.secondary).toEqual(
      PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Tertiary),
    );
    expect(value.tertiary).toEqual(PaneAdaptedValue.Expanded);
  });

  it('never reflows when there is more than one horizontal partition', () => {
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 2,
      maxVerticalPartitions: 2,
      adaptStrategies: supportingPaneScaffoldAdaptStrategies,
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.secondary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.tertiary).toEqual(PaneAdaptedValue.Hidden);
  });

  it('uses the supporting-pane default reflow in a single horizontal/two vertical layout', () => {
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      maxVerticalPartitions: 2,
      adaptStrategies: supportingPaneScaffoldAdaptStrategies,
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.secondary).toEqual(
      PaneAdaptedValue.Reflowed(ThreePaneScaffoldRole.Primary),
    );
    expect(value.tertiary).toEqual(PaneAdaptedValue.Hidden);
  });

  it('levitates only the current destination and does not consume a partition', () => {
    const scrim = 'scrim';
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Hide,
        tertiary: PaneAdaptStrategy.Levitate({
          alignment: PaneAlignment.BottomCenter,
          scrim,
        }),
      },
      destinationHistory: [{ pane: ThreePaneScaffoldRole.Tertiary }],
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.secondary).toEqual(PaneAdaptedValue.Hidden);
    expect(value.tertiary).toEqual(
      PaneAdaptedValue.Levitated(PaneAlignment.BottomCenter, scrim),
    );
  });

  it('preserves stable scrim function identity through React normalization', () => {
    const scrim = () => null;
    const firstValue = PaneAdaptedValue.Levitated(PaneAlignment.Center, scrim);
    const secondValue = PaneAdaptedValue.Levitated(PaneAlignment.Center, scrim);
    const firstStrategy = PaneAdaptStrategy.Levitate({ scrim });
    const secondStrategy = PaneAdaptStrategy.Levitate({ scrim });

    expect(firstValue.type).toBe('levitated');
    expect(secondValue.type).toBe('levitated');
    if (firstValue.type === 'levitated' && secondValue.type === 'levitated') {
      expect(firstValue.scrim).toBe(secondValue.scrim);
    }
    expect(firstStrategy.scrim).toBe(secondStrategy.scrim);
  });

  it('keeps a non-current levitate-only pane hidden', () => {
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Hide,
        tertiary: PaneAdaptStrategy.Levitate(),
      },
      destinationHistory: [
        { pane: ThreePaneScaffoldRole.Tertiary },
        { pane: ThreePaneScaffoldRole.Primary },
      ],
    });

    expect(value.primary).toEqual(PaneAdaptedValue.Expanded);
    expect(value.secondary).toEqual(PaneAdaptedValue.Hidden);
    expect(value.tertiary).toEqual(PaneAdaptedValue.Hidden);
  });

  it('implements Levitate.onlyIf and onlyIfSinglePane like AndroidX', () => {
    const levitate = PaneAdaptStrategy.Levitate();

    expect(levitate.onlyIf(true)).toBe(levitate);
    expect(levitate.onlyIf(false)).toBe(PaneAdaptStrategy.Hide);
    expect(levitate.onlyIfSinglePane(singlePaneDirective)).toBe(levitate);
    expect(
      levitate.onlyIfSinglePane({ ...singlePaneDirective, maxHorizontalPartitions: 2 }),
    ).toBe(PaneAdaptStrategy.Hide);
  });

  it('blocks underlying pane interaction only when a levitated pane has a scrim', () => {
    const withScrim = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Levitated(PaneAlignment.Center, 'scrim'),
    };
    const withoutScrim = {
      ...withScrim,
      tertiary: PaneAdaptedValue.Levitated(PaneAlignment.Center),
    };

    expect(isPaneInteractable(withScrim, ThreePaneScaffoldRole.Primary)).toBe(false);
    expect(isPaneInteractable(withScrim, ThreePaneScaffoldRole.Tertiary)).toBe(true);
    expect(isPaneInteractable(withoutScrim, ThreePaneScaffoldRole.Primary)).toBe(true);
  });

  it('carries the drag-to-resize state into the levitated adapted value', () => {
    const dragToResizeState = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    const value = calculateThreePaneScaffoldValue({
      maxHorizontalPartitions: 1,
      adaptStrategies: {
        primary: PaneAdaptStrategy.Hide,
        secondary: PaneAdaptStrategy.Hide,
        tertiary: PaneAdaptStrategy.Levitate({ dragToResizeState }),
      },
      destinationHistory: [{ pane: ThreePaneScaffoldRole.Tertiary }],
    });

    expect(value.tertiary.type).toBe('levitated');
    if (value.tertiary.type === 'levitated') {
      expect(value.tertiary.dragToResizeState).toBe(dragToResizeState);
    }
  });

  it('does not invent partition-count validation absent from AndroidX', () => {
    expect(
      calculateThreePaneScaffoldValue({ maxHorizontalPartitions: 0 }),
    ).toMatchObject({
      primary: PaneAdaptedValue.Hidden,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    });

    expect(
      calculateThreePaneScaffoldValue({
        maxHorizontalPartitions: 1,
        maxVerticalPartitions: 0,
        adaptStrategies: supportingPaneScaffoldAdaptStrategies,
      }),
    ).toMatchObject({
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    });
  });
});
