import { PaneExpansionState } from '../../adaptive/paneExpansionState';

interface MeasuredPaneExpansionState {
  width: number;
  direction: 'ltr' | 'rtl';
}

/**
 * Internal browser analogue of AndroidX rememberPersistentlyWithKey usage in
 * rememberDefaultPaneExpansionState.
 *
 * AndroidX keeps one PaneExpansionState instance stable while swapping the
 * keyed PaneExpansionStateData behind it. The web state class owns its data,
 * so this cache retains one backing state per scaffold key and exposes one
 * stable PaneExpansionState facade that delegates to the selected backing
 * state.
 */
export class KeyedPaneExpansionStateCache {
  private readonly proxyTarget = new PaneExpansionState();
  private readonly states = new Map<string, PaneExpansionState>();
  private activeState = this.proxyTarget;
  private activeKey: string | null = null;
  private measuredState: MeasuredPaneExpansionState | null = null;
  private activeUnsubscribe: (() => void) | null = null;
  private revision = 0;
  private readonly listeners = new Set<() => void>();

  readonly state: PaneExpansionState;

  constructor() {
    this.state = new Proxy(this.proxyTarget, {
      get: (_target, property) => {
        if (property === 'subscribe') return this.subscribe;
        if (property === 'getSnapshot') return this.getSnapshot;
        if (property === 'onMeasured') return this.onMeasured;

        const value = Reflect.get(this.activeState, property, this.activeState);
        return typeof value === 'function' && property !== 'constructor'
          ? value.bind(this.activeState)
          : value;
      },
    });
  }

  private readonly onActiveStateChanged = () => {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  };

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.revision;

  private readonly onMeasured = (
    measuredWidth: number,
    direction: 'ltr' | 'rtl' = 'ltr',
  ) => {
    this.measuredState = { width: measuredWidth, direction };
    this.activeState.onMeasured(measuredWidth, direction);
  };

  private stateForKey(key: string) {
    const existing = this.states.get(key);
    if (existing !== undefined) return existing;

    // Reuse the real proxy target for the first key so the cache allocates no
    // extra PaneExpansionState until a second key is actually visited.
    const state = this.activeKey === null ? this.proxyTarget : new PaneExpansionState();
    this.states.set(key, state);
    return state;
  }

  select(key: string): PaneExpansionState {
    if (key === this.activeKey) return this.state;

    const nextState = this.stateForKey(key);
    this.activeUnsubscribe?.();
    this.activeState = nextState;
    this.activeKey = key;

    // ThreePaneScaffold's measurement effect depends on the stable facade
    // identity. Seed the selected backing state immediately so drag deltas work
    // when the pane-pair key changes without any scaffold geometry change.
    if (this.measuredState !== null) {
      nextState.onMeasured(this.measuredState.width, this.measuredState.direction);
    }

    this.activeUnsubscribe = nextState.subscribe(this.onActiveStateChanged);
    // Key selection changes the facade snapshot even though it is deliberately
    // not pushed to listeners synchronously from render. The target-value
    // change already caused that render; later backing-state changes notify.
    this.revision += 1;
    return this.state;
  }
}
