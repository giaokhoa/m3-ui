import { useState } from 'react';

export const WideNavigationRailValue = {
  Collapsed: 'collapsed',
  Expanded: 'expanded',
} as const;

export type WideNavigationRailValue =
  (typeof WideNavigationRailValue)[keyof typeof WideNavigationRailValue];

export interface WideNavigationRailStateOptions {
  initialValue?: WideNavigationRailValue;
}

/**
 * Web state controller corresponding to Compose WideNavigationRailState.
 * Logical state changes synchronously while WideNavigationRail owns renderer motion.
 */
export class WideNavigationRailState {
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private value: WideNavigationRailValue;

  constructor({
    initialValue = WideNavigationRailValue.Collapsed,
  }: WideNavigationRailStateOptions = {}) {
    this.value = initialValue;
  }

  get currentValue(): WideNavigationRailValue {
    return this.value;
  }

  get targetValue(): WideNavigationRailValue {
    return this.value;
  }

  get isExpanded(): boolean {
    return this.value === WideNavigationRailValue.Expanded;
  }

  get isCollapsed(): boolean {
    return this.value === WideNavigationRailValue.Collapsed;
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

  snapTo(value: WideNavigationRailValue): boolean {
    if (value === this.value) return true;
    this.value = value;
    this.emit();
    return true;
  }

  expand(): boolean {
    return this.snapTo(WideNavigationRailValue.Expanded);
  }

  collapse(): boolean {
    return this.snapTo(WideNavigationRailValue.Collapsed);
  }

  toggle(): boolean {
    return this.snapTo(
      this.isExpanded
        ? WideNavigationRailValue.Collapsed
        : WideNavigationRailValue.Expanded,
    );
  }
}

export function useWideNavigationRailState(
  initialValue: WideNavigationRailValue = WideNavigationRailValue.Collapsed,
): WideNavigationRailState {
  const [state] = useState(
    () => new WideNavigationRailState({ initialValue }),
  );
  return state;
}
