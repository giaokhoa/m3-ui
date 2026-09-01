import { describe, expect, it } from 'vitest';
import {
  calculatePaneScaffoldDirective,
  calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth,
  calculateWindowAdaptiveInfo,
} from './paneScaffoldDirective';
import {
  BackNavigationBehavior,
  createListDetailPaneScaffoldNavigator,
  createSupportingPaneScaffoldNavigator,
  type PanePredictiveBackEvent,
  type PanePredictiveBackSource,
} from './threePaneScaffoldNavigator';
import {
  ListDetailPaneScaffoldRole,
  PaneAdaptStrategy,
  PaneAlignment,
  SupportingPaneScaffoldRole,
  type ThreePaneScaffoldAdaptStrategies,
} from './threePaneScaffold';

function directive(width: number, height = 720) {
  return calculatePaneScaffoldDirective(calculateWindowAdaptiveInfo({ width, height }));
}

describe('ThreePaneScaffoldNavigator', () => {
  it('navigates list -> detail -> extra and pops the latest destination', () => {
    const navigator = createListDetailPaneScaffoldNavigator<string>({
      directive: directive(480),
    });

    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, 'detail-1');
    navigator.navigateTo(ListDetailPaneScaffoldRole.Extra, 'extra-1');

    expect(navigator.destinationHistory.map(({ pane }) => pane)).toEqual([
      ListDetailPaneScaffoldRole.List,
      ListDetailPaneScaffoldRole.Detail,
      ListDetailPaneScaffoldRole.Extra,
    ]);
    expect(navigator.currentDestination?.contentKey).toBe('extra-1');
    expect(navigator.navigateBack(BackNavigationBehavior.PopLatest)).toBe(true);
    expect(navigator.currentDestination).toEqual({
      pane: ListDetailPaneScaffoldRole.Detail,
      contentKey: 'detail-1',
    });
  });

  it('implements each AndroidX back-navigation policy deterministically', () => {
    const compact = directive(480);
    const navigator = createListDetailPaneScaffoldNavigator<string>({
      directive: compact,
      initialDestinationHistory: [
        { pane: ListDetailPaneScaffoldRole.List },
        { pane: ListDetailPaneScaffoldRole.Detail, contentKey: 'a' },
        { pane: ListDetailPaneScaffoldRole.Detail, contentKey: 'b' },
      ],
    });

    expect(navigator.canNavigateBack(BackNavigationBehavior.PopLatest)).toBe(true);
    expect(
      navigator.canNavigateBack(BackNavigationBehavior.PopUntilCurrentDestinationChange),
    ).toBe(true);
    expect(navigator.canNavigateBack(BackNavigationBehavior.PopUntilContentChange)).toBe(true);

    expect(
      navigator.navigateBack(BackNavigationBehavior.PopUntilCurrentDestinationChange),
    ).toBe(true);
    expect(navigator.currentDestination?.pane).toBe(ListDetailPaneScaffoldRole.List);

    const expanded = createListDetailPaneScaffoldNavigator({
      directive: directive(1700),
      initialDestinationHistory: [
        { pane: ListDetailPaneScaffoldRole.List },
        { pane: ListDetailPaneScaffoldRole.Detail },
        { pane: ListDetailPaneScaffoldRole.Extra },
      ],
    });
    expect(
      expanded.canNavigateBack(BackNavigationBehavior.PopUntilScaffoldValueChange),
    ).toBe(false);
    expect(
      expanded.canNavigateBack(BackNavigationBehavior.PopUntilCurrentDestinationChange),
    ).toBe(true);
  });

  it('uses content-key identity for PopUntilContentChange', () => {
    const navigator = createListDetailPaneScaffoldNavigator<object>({
      directive: directive(480),
    });
    const firstKey = { id: 1 };
    const secondKey = { id: 1 };
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, firstKey);
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, secondKey);

    expect(navigator.navigateBack(BackNavigationBehavior.PopUntilContentChange)).toBe(true);
    expect(navigator.currentDestination?.contentKey).toBe(firstKey);
  });

  it('preserves logical history while resizing compact -> expanded -> compact', () => {
    const compact = directive(480);
    const expanded = directive(1000);
    const navigator = createListDetailPaneScaffoldNavigator({ directive: compact });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail);
    navigator.navigateTo(ListDetailPaneScaffoldRole.Extra);
    const history = navigator.destinationHistory.map(({ pane }) => pane);

    expect(navigator.scaffoldValue.tertiary.type).toBe('expanded');
    expect(navigator.scaffoldValue.primary.type).toBe('hidden');

    navigator.updateConfiguration({ directive: expanded });
    expect(navigator.destinationHistory.map(({ pane }) => pane)).toEqual(history);
    expect(navigator.scaffoldValue.tertiary.type).toBe('expanded');
    expect(navigator.scaffoldValue.primary.type).toBe('expanded');

    navigator.updateConfiguration({ directive: compact });
    expect(navigator.destinationHistory.map(({ pane }) => pane)).toEqual(history);
    expect(navigator.currentDestination?.pane).toBe(ListDetailPaneScaffoldRole.Extra);
    expect(navigator.scaffoldValue.tertiary.type).toBe('expanded');
  });

  it('supports the dense two-pane-on-medium directive without a second breakpoint system', () => {
    const mediumInfo = calculateWindowAdaptiveInfo({ width: 700, height: 720 });
    const dense = calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth(mediumInfo);
    const navigator = createListDetailPaneScaffoldNavigator({ directive: dense });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail);

    expect(dense.maxHorizontalPartitions).toBe(2);
    expect(navigator.scaffoldValue.primary.type).toBe('expanded');
    expect(navigator.scaffoldValue.secondary.type).toBe('expanded');
  });

  it('supports canonical supporting-pane navigation and reflow', () => {
    const navigator = createSupportingPaneScaffoldNavigator({
      directive: directive(480, 900),
    });
    navigator.navigateTo(SupportingPaneScaffoldRole.Supporting);

    expect(navigator.currentDestination?.pane).toBe(SupportingPaneScaffoldRole.Supporting);
    expect(navigator.scaffoldValue.primary.type).toBe('expanded');
    expect(navigator.scaffoldValue.secondary.type).toBe('reflowed');
  });

  it('keeps levitated destination behavior in the existing scaffold calculator', () => {
    const compact = directive(480);
    const strategies: ThreePaneScaffoldAdaptStrategies = {
      primary: PaneAdaptStrategy.Hide,
      secondary: PaneAdaptStrategy.Hide,
      tertiary: PaneAdaptStrategy.Levitate({ alignment: PaneAlignment.Center }),
    };
    const navigator = createListDetailPaneScaffoldNavigator({
      directive: compact,
      adaptStrategies: strategies,
    });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Extra);

    expect(navigator.scaffoldValue.tertiary.type).toBe('levitated');
    expect(navigator.scaffoldValue.primary.type).toBe('expanded');
  });

  it('does not pop when no destination satisfies the selected policy', () => {
    const navigator = createListDetailPaneScaffoldNavigator({
      directive: directive(480),
    });

    expect(navigator.canNavigateBack()).toBe(false);
    expect(navigator.navigateBack()).toBe(false);
    expect(navigator.destinationHistory).toHaveLength(1);
  });

  it('can calculate from only the current destination when history awareness is disabled', () => {
    const navigator = createListDetailPaneScaffoldNavigator({
      directive: directive(1000),
      isDestinationHistoryAware: false,
    });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Extra);

    expect(navigator.destinationHistory).toHaveLength(2);
    expect(navigator.scaffoldValue.tertiary.type).toBe('expanded');
  });

  it('round-trips a serializable navigation snapshot', () => {
    const navigator = createListDetailPaneScaffoldNavigator<string>({
      directive: directive(480),
    });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, '42');
    const snapshot = JSON.parse(JSON.stringify(navigator.snapshot()));

    const restored = createListDetailPaneScaffoldNavigator<string>({
      directive: directive(480),
    });
    restored.restore(snapshot);

    expect(restored.destinationHistory).toEqual(navigator.destinationHistory);
    expect(restored.currentDestination?.contentKey).toBe('42');
  });

  it('wires predictive-back start/progress/cancel/commit without popping before commit', () => {
    let listener: ((event: PanePredictiveBackEvent) => void) | undefined;
    const source: PanePredictiveBackSource = {
      subscribe(next) {
        listener = next;
        return () => {
          listener = undefined;
        };
      },
    };
    const navigator = createListDetailPaneScaffoldNavigator({
      directive: directive(480),
    });
    navigator.navigateTo(ListDetailPaneScaffoldRole.Detail);
    const disconnect = navigator.connectPredictiveBackSource(
      source,
      BackNavigationBehavior.PopLatest,
    );

    listener?.({ type: 'start' });
    listener?.({ type: 'progress', progress: 0.5 });
    expect(navigator.destinationHistory).toHaveLength(2);
    expect(navigator.scaffoldState.isPredictiveBackInProgress).toBe(true);

    listener?.({ type: 'cancel' });
    expect(navigator.destinationHistory).toHaveLength(2);

    listener?.({ type: 'start' });
    listener?.({ type: 'progress', progress: 0.75 });
    listener?.({ type: 'commit' });
    expect(navigator.destinationHistory).toHaveLength(1);
    expect(navigator.currentDestination?.pane).toBe(ListDetailPaneScaffoldRole.List);

    disconnect();
    expect(listener).toBeUndefined();
  });
});
