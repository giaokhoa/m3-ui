import { describe, expect, it } from 'vitest';
import { DockedEdge, DragToResizeState } from '../../adaptive/dragToResizeState';
import { PaneExpansionState } from '../../adaptive/paneExpansionState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { calculateThreePaneScaffoldTransitionDuration } from './ThreePaneScaffold.transition';

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

const primary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Hidden,
};

const primarySecondary: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
};

function expansionDuration(paneExpansionState: PaneExpansionState) {
  return calculateThreePaneScaffoldTransitionDuration({
    width: 1000,
    height: 800,
    directive,
    currentValue: primary,
    targetValue: primarySecondary,
    paneOrder,
    paneExpansionState,
  });
}

function levitatedDuration(resizeState: DragToResizeState) {
  const currentValue: ThreePaneScaffoldValue = {
    primary: PaneAdaptedValue.Levitated('center', undefined, resizeState),
    secondary: PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
  const targetValue: ThreePaneScaffoldValue = {
    ...currentValue,
    secondary: PaneAdaptedValue.Expanded,
  };
  return calculateThreePaneScaffoldTransitionDuration({
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder,
  });
}

function replacedLevitatedDuration(
  currentResizeState: DragToResizeState,
  targetResizeState: DragToResizeState,
) {
  const currentValue: ThreePaneScaffoldValue = {
    primary: PaneAdaptedValue.Levitated('center', undefined, currentResizeState),
    secondary: PaneAdaptedValue.Expanded,
    tertiary: PaneAdaptedValue.Hidden,
  };
  const targetValue: ThreePaneScaffoldValue = {
    primary: PaneAdaptedValue.Levitated('center', undefined, targetResizeState),
    secondary: PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
  return calculateThreePaneScaffoldTransitionDuration({
    width: 1000,
    height: 800,
    directive,
    currentValue,
    targetValue,
    paneOrder,
  });
}

function resizeState() {
  return new DragToResizeState({
    dockedEdge: DockedEdge.Start,
    minSize: 48,
    maxSize: 900,
  });
}

describe('ThreePaneScaffold external geometry duration parity', () => {
  it('changes visibility duration when the same expansion state changes width', () => {
    const expansionState = new PaneExpansionState();

    expansionState.setFirstPaneWidth(250);
    const narrowFirstPaneDuration = expansionDuration(expansionState);
    const narrowRevision = expansionState.getSnapshot();

    expansionState.setFirstPaneWidth(750);
    const wideFirstPaneDuration = expansionDuration(expansionState);

    expect(expansionState.getSnapshot()).toBeGreaterThan(narrowRevision);
    expect(narrowFirstPaneDuration).toBeGreaterThan(wideFirstPaneDuration);
  });

  it('changes visibility duration when the same levitated resize state changes width', () => {
    const state = resizeState();

    const initialDuration = levitatedDuration(state);
    const initialRevision = state.getSnapshot();
    expect(state.size).toBe(360);

    state.dispatchRawDelta(200);
    const resizedDuration = levitatedDuration(state);

    expect(state.getSnapshot()).toBeGreaterThan(initialRevision);
    expect(state.size).toBe(560);
    expect(initialDuration).toBeGreaterThan(resizedDuration);
  });

  it('changes exit duration when only the current levitated resize state changes', () => {
    const currentResizeState = resizeState();
    const targetResizeState = resizeState();

    const initialDuration = replacedLevitatedDuration(
      currentResizeState,
      targetResizeState,
    );
    const currentRevision = currentResizeState.getSnapshot();
    expect(currentResizeState.size).toBe(360);
    expect(targetResizeState.size).toBe(360);

    currentResizeState.dispatchRawDelta(200);
    const resizedDuration = replacedLevitatedDuration(
      currentResizeState,
      targetResizeState,
    );

    expect(currentResizeState.getSnapshot()).toBeGreaterThan(currentRevision);
    expect(targetResizeState.getSnapshot()).toBe(0);
    expect(currentResizeState.size).toBe(560);
    expect(resizedDuration).toBeLessThan(initialDuration);
  });
});
