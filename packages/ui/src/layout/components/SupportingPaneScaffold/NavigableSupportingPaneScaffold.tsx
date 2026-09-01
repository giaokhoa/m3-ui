import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackNavigationBehavior,
  createSupportingPaneScaffoldNavigator,
  type PanePredictiveBackSource,
  type ThreePaneScaffoldNavigator,
} from '../../adaptive/threePaneScaffoldNavigator';
import {
  SupportingPaneScaffoldRole,
  supportingPaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldDestinationItem,
} from '../../adaptive/threePaneScaffold';
import {
  SupportingPaneScaffold,
  type SupportingPaneScaffoldProps,
} from './SupportingPaneScaffold';

export interface NavigableSupportingPaneScaffoldProps<T = unknown>
  extends Omit<SupportingPaneScaffoldProps, 'value' | 'scaffoldState'> {
  navigator?: ThreePaneScaffoldNavigator<T>;
  adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
  isDestinationHistoryAware?: boolean;
  initialDestinationHistory?: readonly ThreePaneScaffoldDestinationItem<T>[];
  backNavigationBehavior?: BackNavigationBehavior;
  predictiveBackSource?: PanePredictiveBackSource;
}

/**
 * Router-independent SupportingPaneScaffold backed by logical pane history.
 * The default navigator starts at the canonical Main pane.
 */
export function NavigableSupportingPaneScaffold<T = unknown>({
  navigator,
  adaptStrategies,
  isDestinationHistoryAware,
  initialDestinationHistory = [{ pane: SupportingPaneScaffoldRole.Main }],
  backNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  predictiveBackSource,
  directive,
  ...props
}: NavigableSupportingPaneScaffoldProps<T>) {
  const resolvedAdaptStrategies =
    adaptStrategies ?? navigator?.adaptStrategies ?? supportingPaneScaffoldAdaptStrategies;
  const resolvedHistoryAware =
    isDestinationHistoryAware ?? navigator?.isDestinationHistoryAware ?? true;
  const [defaultNavigator] = useState(() =>
    createSupportingPaneScaffoldNavigator<T>({
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
    <SupportingPaneScaffold
      {...props}
      directive={directive}
      scaffoldState={activeNavigator.scaffoldState}
    />
  );
}
