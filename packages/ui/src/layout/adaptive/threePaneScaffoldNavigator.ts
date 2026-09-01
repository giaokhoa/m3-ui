import type { PaneScaffoldDirective } from './paneScaffoldDirective';
import {
  ListDetailPaneScaffoldRole,
  SupportingPaneScaffoldRole,
  calculateThreePaneScaffoldValueFromDirective,
  listDetailPaneScaffoldAdaptStrategies,
  supportingPaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldAdaptStrategies,
  type ThreePaneScaffoldDestinationItem,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  threePaneScaffoldValuesEqual,
} from './threePaneScaffoldState';

export type BackNavigationBehavior =
  | 'pop-latest'
  | 'pop-until-scaffold-value-change'
  | 'pop-until-current-destination-change'
  | 'pop-until-content-change';

export const BackNavigationBehavior = {
  PopLatest: 'pop-latest',
  PopUntilScaffoldValueChange: 'pop-until-scaffold-value-change',
  PopUntilCurrentDestinationChange: 'pop-until-current-destination-change',
  PopUntilContentChange: 'pop-until-content-change',
} as const satisfies Record<string, BackNavigationBehavior>;

export type PanePredictiveBackEvent =
  | { type: 'start' }
  | { type: 'progress'; progress: number }
  | { type: 'cancel' }
  | { type: 'commit' };

/**
 * Gesture acquisition stays outside the adaptive-navigation package. A browser,
 * shell, native bridge or router adapter can expose its own events through this
 * tiny source contract without becoming a core dependency.
 */
export interface PanePredictiveBackSource {
  subscribe(listener: (event: PanePredictiveBackEvent) => void): () => void;
}

export interface ThreePaneScaffoldNavigatorSnapshot<T = unknown> {
  version: 1;
  destinationHistory: ThreePaneScaffoldDestinationItem<T>[];
  isDestinationHistoryAware: boolean;
}

export interface ThreePaneScaffoldNavigatorOptions<T = unknown> {
  directive: PaneScaffoldDirective;
  adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
  initialDestinationHistory?: readonly ThreePaneScaffoldDestinationItem<T>[];
  isDestinationHistoryAware?: boolean;
}

interface PredictiveBackSession {
  behavior: BackNavigationBehavior;
  destinationIndex: number;
  progress: number;
}

function destinationContentEqual<T>(
  a: ThreePaneScaffoldDestinationItem<T>,
  b: ThreePaneScaffoldDestinationItem<T>,
) {
  return a.pane === b.pane && Object.is(a.contentKey, b.contentKey);
}

/**
 * Framework-neutral pane-history navigator. Browser URL/history ownership is
 * deliberately separate: adapters may observe this object and synchronize
 * routes, but pane history remains the source of truth for scaffold adaptation.
 */
export class ThreePaneScaffoldNavigator<T = unknown> {
  private directiveValue: PaneScaffoldDirective;
  private adaptStrategiesValue: ThreePaneScaffoldAdaptStrategies;
  private historyValue: ThreePaneScaffoldDestinationItem<T>[];
  private historyAwareValue: boolean;
  private scaffoldStateValue: MutableThreePaneScaffoldState;
  private attachedScaffolds = 0;
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private predictiveBackSession: PredictiveBackSession | null = null;

  constructor({
    directive,
    adaptStrategies = listDetailPaneScaffoldAdaptStrategies,
    initialDestinationHistory = [],
    isDestinationHistoryAware = true,
  }: ThreePaneScaffoldNavigatorOptions<T>) {
    this.directiveValue = directive;
    this.adaptStrategiesValue = adaptStrategies;
    this.historyValue = initialDestinationHistory.map((destination) => ({ ...destination }));
    this.historyAwareValue = isDestinationHistoryAware;
    this.scaffoldStateValue = new MutableThreePaneScaffoldState(this.calculateScaffoldValue());
  }

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.revision;

  private notify() {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }

  get directive() {
    return this.directiveValue;
  }

  get adaptStrategies() {
    return this.adaptStrategiesValue;
  }

  get isDestinationHistoryAware() {
    return this.historyAwareValue;
  }

  get destinationHistory(): readonly ThreePaneScaffoldDestinationItem<T>[] {
    return this.historyValue;
  }

  get currentDestination(): ThreePaneScaffoldDestinationItem<T> | undefined {
    return this.historyValue.at(-1);
  }

  get scaffoldValue(): ThreePaneScaffoldValue {
    return this.calculateScaffoldValue();
  }

  /** Seekable state consumed by navigable scaffold wrappers. */
  get scaffoldState() {
    return this.scaffoldStateValue;
  }

  private historyForCalculation(
    history: readonly ThreePaneScaffoldDestinationItem<T>[] = this.historyValue,
  ) {
    if (this.historyAwareValue) return history;
    const current = history.at(-1);
    return current === undefined ? [] : [current];
  }

  private calculateScaffoldValue(
    history: readonly ThreePaneScaffoldDestinationItem<T>[] = this.historyValue,
  ) {
    return calculateThreePaneScaffoldValueFromDirective(this.directiveValue, {
      adaptStrategies: this.adaptStrategiesValue,
      destinationHistory: this.historyForCalculation(history),
    });
  }

  private replaceUnattachedScaffoldState(value: ThreePaneScaffoldValue) {
    this.scaffoldStateValue = new MutableThreePaneScaffoldState(value);
    this.notify();
  }

  private transitionTo(value: ThreePaneScaffoldValue) {
    if (this.attachedScaffolds === 0) {
      this.replaceUnattachedScaffoldState(value);
      return;
    }
    void this.scaffoldStateValue.animateTo(value);
  }

  /**
   * Wrapper lifecycle hook. Direct ThreePaneScaffold integrations may use this
   * too so navigation performed while unmounted is restored without animation.
   */
  attachScaffold() {
    this.attachedScaffolds += 1;
    if (this.attachedScaffolds === 1) {
      this.transitionTo(this.scaffoldValue);
    }
    return () => {
      this.attachedScaffolds = Math.max(0, this.attachedScaffolds - 1);
    };
  }

  updateConfiguration({
    directive = this.directiveValue,
    adaptStrategies = this.adaptStrategiesValue,
    isDestinationHistoryAware = this.historyAwareValue,
  }: {
    directive?: PaneScaffoldDirective;
    adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
    isDestinationHistoryAware?: boolean;
  }) {
    if (
      directive === this.directiveValue &&
      adaptStrategies === this.adaptStrategiesValue &&
      isDestinationHistoryAware === this.historyAwareValue
    ) {
      return;
    }

    this.directiveValue = directive;
    this.adaptStrategiesValue = adaptStrategies;
    this.historyAwareValue = isDestinationHistoryAware;
    this.notify();

    const target = this.scaffoldValue;
    const session = this.predictiveBackSession;
    if (session !== null) {
      const previous = this.scaffoldValueAtIndex(session.destinationIndex);
      if (this.attachedScaffolds === 0) {
        this.replaceUnattachedScaffoldState(target);
      } else {
        this.scaffoldStateValue.seekTo(session.progress, previous, true);
      }
      return;
    }
    this.transitionTo(target);
  }

  navigateTo(pane: ThreePaneScaffoldRole, contentKey?: T) {
    if (this.predictiveBackSession !== null) this.cancelPredictiveBack();
    this.historyValue = [...this.historyValue, { pane, ...(contentKey === undefined ? {} : { contentKey }) }];
    this.notify();
    this.transitionTo(this.scaffoldValue);
  }

  private scaffoldValueAtIndex(index: number) {
    return this.calculateScaffoldValue(this.historyValue.slice(0, index + 1));
  }

  private findBackDestinationIndex(behavior: BackNavigationBehavior) {
    if (this.historyValue.length <= 1) return -1;
    if (behavior === BackNavigationBehavior.PopLatest) return this.historyValue.length - 2;

    const currentDestination = this.historyValue.at(-1)!;
    const currentScaffoldValue = this.scaffoldValue;

    for (let index = this.historyValue.length - 2; index >= 0; index -= 1) {
      const candidate = this.historyValue[index]!;
      const candidateValue = this.scaffoldValueAtIndex(index);

      if (
        behavior === BackNavigationBehavior.PopUntilScaffoldValueChange &&
        !threePaneScaffoldValuesEqual(currentScaffoldValue, candidateValue)
      ) {
        return index;
      }
      if (
        behavior === BackNavigationBehavior.PopUntilCurrentDestinationChange &&
        candidate.pane !== currentDestination.pane
      ) {
        return index;
      }
      if (
        behavior === BackNavigationBehavior.PopUntilContentChange &&
        (!destinationContentEqual(currentDestination, candidate) ||
          !threePaneScaffoldValuesEqual(currentScaffoldValue, candidateValue))
      ) {
        return index;
      }
    }
    return -1;
  }

  canNavigateBack(
    behavior: BackNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  ) {
    return this.findBackDestinationIndex(behavior) >= 0;
  }

  peekPreviousScaffoldValue(
    behavior: BackNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  ) {
    const index = this.findBackDestinationIndex(behavior);
    return index < 0 ? this.scaffoldValue : this.scaffoldValueAtIndex(index);
  }

  navigateBack(
    behavior: BackNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  ) {
    if (this.predictiveBackSession !== null) this.cancelPredictiveBack();
    const destinationIndex = this.findBackDestinationIndex(behavior);
    if (destinationIndex < 0) return false;

    this.historyValue = this.historyValue.slice(0, destinationIndex + 1);
    this.notify();
    this.transitionTo(this.scaffoldValue);
    return true;
  }

  beginPredictiveBack(
    behavior: BackNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  ) {
    const destinationIndex = this.findBackDestinationIndex(behavior);
    if (destinationIndex < 0) return false;

    this.predictiveBackSession = { behavior, destinationIndex, progress: 0 };
    const previous = this.scaffoldValueAtIndex(destinationIndex);
    if (this.attachedScaffolds > 0) {
      this.scaffoldStateValue.seekTo(0, previous, true);
    } else {
      this.scaffoldStateValue.seekTo(0, previous, true);
    }
    return true;
  }

  updatePredictiveBack(progress: number) {
    const session = this.predictiveBackSession;
    if (session === null) return false;
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
      throw new RangeError(`Predictive-back progress must be between 0 and 1. Got ${progress}`);
    }
    session.progress = progress;
    this.scaffoldStateValue.seekTo(
      progress,
      this.scaffoldValueAtIndex(session.destinationIndex),
      true,
    );
    return true;
  }

  cancelPredictiveBack() {
    if (this.predictiveBackSession === null) return false;
    this.predictiveBackSession = null;
    this.transitionTo(this.scaffoldValue);
    return true;
  }

  commitPredictiveBack() {
    const session = this.predictiveBackSession;
    if (session === null) return false;
    this.predictiveBackSession = null;
    this.historyValue = this.historyValue.slice(0, session.destinationIndex + 1);
    this.notify();
    this.transitionTo(this.scaffoldValue);
    return true;
  }

  connectPredictiveBackSource(
    source: PanePredictiveBackSource,
    behavior: BackNavigationBehavior = BackNavigationBehavior.PopUntilScaffoldValueChange,
  ) {
    return source.subscribe((event) => {
      switch (event.type) {
        case 'start':
          this.beginPredictiveBack(behavior);
          break;
        case 'progress':
          this.updatePredictiveBack(event.progress);
          break;
        case 'cancel':
          this.cancelPredictiveBack();
          break;
        case 'commit':
          this.commitPredictiveBack();
          break;
      }
    });
  }

  snapshot(): ThreePaneScaffoldNavigatorSnapshot<T> {
    return {
      version: 1,
      destinationHistory: this.historyValue.map((destination) => ({ ...destination })),
      isDestinationHistoryAware: this.historyAwareValue,
    };
  }

  restore(snapshot: ThreePaneScaffoldNavigatorSnapshot<T>) {
    if (snapshot.version !== 1) {
      throw new Error(`Unsupported pane navigator snapshot version: ${snapshot.version}`);
    }
    if (this.predictiveBackSession !== null) this.predictiveBackSession = null;
    this.historyValue = snapshot.destinationHistory.map((destination) => ({ ...destination }));
    this.historyAwareValue = snapshot.isDestinationHistoryAware;
    this.notify();
    this.transitionTo(this.scaffoldValue);
  }
}

export function createListDetailPaneScaffoldNavigator<T = unknown>({
  directive,
  adaptStrategies = listDetailPaneScaffoldAdaptStrategies,
  initialDestinationHistory = [{ pane: ListDetailPaneScaffoldRole.List }],
  isDestinationHistoryAware = true,
}: ThreePaneScaffoldNavigatorOptions<T>) {
  return new ThreePaneScaffoldNavigator<T>({
    directive,
    adaptStrategies,
    initialDestinationHistory,
    isDestinationHistoryAware,
  });
}

export function createSupportingPaneScaffoldNavigator<T = unknown>({
  directive,
  adaptStrategies = supportingPaneScaffoldAdaptStrategies,
  initialDestinationHistory = [{ pane: SupportingPaneScaffoldRole.Main }],
  isDestinationHistoryAware = true,
}: ThreePaneScaffoldNavigatorOptions<T>) {
  return new ThreePaneScaffoldNavigator<T>({
    directive,
    adaptStrategies,
    initialDestinationHistory,
    isDestinationHistoryAware,
  });
}
