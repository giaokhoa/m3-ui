import { useState } from 'react';

export const NavigationSuiteScaffoldValue = {
  Visible: 'visible',
  Hidden: 'hidden',
} as const;

export type NavigationSuiteScaffoldValue =
  (typeof NavigationSuiteScaffoldValue)[keyof typeof NavigationSuiteScaffoldValue];

export interface NavigationSuiteScaffoldStateOptions {
  initialValue?: NavigationSuiteScaffoldValue;
}

/**
 * Observable browser state for NavigationSuiteScaffold visibility.
 *
 * AndroidX exposes suspend/animated state changes. The browser contract keeps
 * the same observable show/hide/toggle/snap capability synchronously; renderer
 * motion can evolve independently without leaking Compose coroutine mechanics.
 */
export class NavigationSuiteScaffoldState {
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private value: NavigationSuiteScaffoldValue;

  constructor({
    initialValue = NavigationSuiteScaffoldValue.Visible,
  }: NavigationSuiteScaffoldStateOptions = {}) {
    this.value = initialValue;
  }

  get currentValue(): NavigationSuiteScaffoldValue {
    return this.value;
  }

  get targetValue(): NavigationSuiteScaffoldValue {
    return this.value;
  }

  get isAnimating(): boolean {
    return false;
  }

  get isVisible(): boolean {
    return this.value === NavigationSuiteScaffoldValue.Visible;
  }

  get isHidden(): boolean {
    return this.value === NavigationSuiteScaffoldValue.Hidden;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.revision;

  private emit() {
    this.revision += 1;
    for (const listener of this.listeners) listener();
  }

  snapTo(value: NavigationSuiteScaffoldValue): boolean {
    if (value === this.value) return true;
    this.value = value;
    this.emit();
    return true;
  }

  show(): boolean {
    return this.snapTo(NavigationSuiteScaffoldValue.Visible);
  }

  hide(): boolean {
    return this.snapTo(NavigationSuiteScaffoldValue.Hidden);
  }

  toggle(): boolean {
    return this.snapTo(
      this.isVisible
        ? NavigationSuiteScaffoldValue.Hidden
        : NavigationSuiteScaffoldValue.Visible,
    );
  }
}

export function useNavigationSuiteScaffoldState(
  initialValue: NavigationSuiteScaffoldValue = NavigationSuiteScaffoldValue.Visible,
): NavigationSuiteScaffoldState {
  const [state] = useState(
    () => new NavigationSuiteScaffoldState({ initialValue }),
  );
  return state;
}
