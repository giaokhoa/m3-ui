import type { WindowSize } from './windowSizeClass';

export interface ContainerResizeObserver {
  observe(target: Element, options?: ResizeObserverOptions): void;
  disconnect(): void;
}

export type ContainerResizeObserverFactory = (
  callback: (entries: readonly ResizeObserverEntry[]) => void,
) => ContainerResizeObserver;

export interface CreateContainerSizeStoreOptions {
  /** Test/platform injection. `null` explicitly disables observation. */
  createResizeObserver?: ContainerResizeObserverFactory | null;
}

const zeroSize: Readonly<WindowSize> = Object.freeze({ width: 0, height: 0 });

function normalizeDimension(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function measureBorderBox(target: Element): WindowSize {
  const bounds = target.getBoundingClientRect();
  return {
    width: normalizeDimension(bounds.width),
    height: normalizeDimension(bounds.height),
  };
}

function defaultResizeObserverFactory(): ContainerResizeObserverFactory | undefined {
  if (typeof ResizeObserver === 'undefined') return undefined;
  return (callback) =>
    new ResizeObserver((entries) => {
      callback(entries);
    });
}

export interface ContainerSizeStore {
  getSnapshot(): Readonly<WindowSize>;
  setTarget(target: Element | null): void;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

/** Internal external-store adapter used by `useContainerAdaptiveInfo`. */
export function createContainerSizeStore(
  options: CreateContainerSizeStoreOptions = {},
): ContainerSizeStore {
  const createResizeObserver =
    options.createResizeObserver === undefined
      ? defaultResizeObserverFactory()
      : options.createResizeObserver ?? undefined;

  let target: Element | null = null;
  let observer: ContainerResizeObserver | undefined;
  let snapshot: Readonly<WindowSize> = zeroSize;
  const listeners = new Set<() => void>();

  const getSnapshot = () => snapshot;

  const publish = (next: WindowSize) => {
    if (snapshot.width === next.width && snapshot.height === next.height) return;
    snapshot = Object.freeze(next);
    listeners.forEach((listener) => listener());
  };

  const disconnectObserver = () => {
    observer?.disconnect();
    observer = undefined;
  };

  const connectObserver = () => {
    if (!target || !createResizeObserver || observer) return;

    observer = createResizeObserver((entries) => {
      if (!target || !entries.some((entry) => entry.target === target)) return;
      publish(measureBorderBox(target));
    });
    observer.observe(target, { box: 'border-box' });
  };

  const setTarget = (nextTarget: Element | null) => {
    if (target === nextTarget) return;

    disconnectObserver();
    target = nextTarget;
    publish(target ? measureBorderBox(target) : { ...zeroSize });
    if (listeners.size > 0) connectObserver();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    connectObserver();

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) disconnectObserver();
    };
  };

  const dispose = () => {
    disconnectObserver();
    target = null;
  };

  return { getSnapshot, setTarget, subscribe, dispose };
}
