import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackNavigationBehavior,
  createListDetailPaneScaffoldNavigator,
  type PanePredictiveBackSource,
  type ThreePaneScaffoldNavigator,
} from '../../adaptive/threePaneScaffoldNavigator';
import {
  ListDetailPaneScaffoldRole,
  listDetailPaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldDestinationItem,
} from '../../adaptive/threePaneScaffold';
import {
  ListDetailPaneScaffold,
  type ListDetailPaneScaffoldProps,
} from './ListDetailPaneScaffold';

export interface NavigableListDetailPaneScaffoldProps<T = unknown>
  extends Omit<ListDetailPaneScaffoldProps, 'value' | 'scaffoldState'> {
  navigator?: ThreePaneScaffoldNavigator<T>;
  adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
  isDestinationHistoryAware?: boolean;
  initialDestinationHistory?: readonly ThreePaneScaffoldDestinationItem<T>[];
  backNavigationBehavior?: BackNavigationBehavior;
  predictiveBackSource?: PanePredictiveBackSource;
}

/**
 * Router-independent ListDetailPaneScaffold backed by logical pane history.
 * Supply `navigator` when navigation is shared outside this subtree; otherwise
 * the wrapper creates one whose initial destination is the canonical List pane.
 */
export function NavigableListDetailPaneScaffold<T = unknown>({
  navigator,
  adaptStrategies,
  isDestinationHistoryAware,
  initialDestinationHistory = [{ pane: ListDetailPaneScaffoldRole.List }],
  backNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  predictiveBackSource,
  directive,
  ...props
}: NavigableListDetailPaneScaffoldProps<T>) {
  const resolvedAdaptStrategies =
    adaptStrategies ?? navigator?.adaptStrategies ?? listDetailPaneScaffoldAdaptStrategies;
  const resolvedHistoryAware =
    isDestinationHistoryAware ?? navigator?.isDestinationHistoryAware ?? true;
  const [defaultNavigator] = useState(() =>
    createListDetailPaneScaffoldNavigator<T>({
      directive,
      adaptStrategies: resolvedAdaptStrategies,
      initialDestinationHistory,
      isDestinationHistoryAware: resolvedHistoryAware,
    }),
  );
  const activeNavigator = navigator ?? defaultNavigator;

  useSyncExternalStore(
    activeNavigator.subscribe,
    activeNavigator.getSnapshot,
    activeNavigator.getSnapshot,
  );

  useLayoutEffect(() => activeNavigator.attachScaffold(), [activeNavigator]);

  useLayoutEffect(() => {
    activeNavigator.updateConfiguration({
      directive,
      adaptStrategies: resolvedAdaptStrategies,
      isDestinationHistoryAware: resolvedHistoryAware,
    });
  }, [activeNavigator, directive, resolvedAdaptStrategies, resolvedHistoryAware]);

  useEffect(() => {
    if (predictiveBackSource === undefined) return;
    return activeNavigator.connectPredictiveBackSource(
      predictiveBackSource,
      backNavigationBehavior,
    );
  }, [activeNavigator, backNavigationBehavior, predictiveBackSource]);

  return (
    <ListDetailPaneScaffold
      {...props}
      directive={directive}
      scaffoldState={activeNavigator.scaffoldState}
    />
  );
}
