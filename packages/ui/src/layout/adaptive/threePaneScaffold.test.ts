import { describe, expect, it } from 'vitest';
import {
  PaneAdaptStrategy,
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  calculateThreePaneScaffoldValue,
  supportingPaneScaffoldAdaptStrategies,
} from './threePaneScaffold';

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

  it('rejects invalid partition counts', () => {
    expect(() =>
      calculateThreePaneScaffoldValue({ maxHorizontalPartitions: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateThreePaneScaffoldValue({
        maxHorizontalPartitions: 1,
        maxVerticalPartitions: 1.5,
      }),
    ).toThrow(RangeError);
  });
});
