import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import { createContainerSizeStore } from './containerAdaptiveStore';
import {
  calculateWindowSizeClass,
  type WindowSize,
  type WindowSizeClass,
} from './windowSizeClass';

const defaultServerSize: Readonly<WindowSize> = Object.freeze({
  width: 0,
  height: 0,
});

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface ContainerAdaptiveInfo {
  /** Current target border-box size in logical CSS pixels. */
  containerSize: Readonly<WindowSize>;
  /** Material 3 size classes calculated from `containerSize`. */
  containerSizeClass: WindowSizeClass;
}

export interface UseContainerAdaptiveInfoOptions {
  /** Stable size used for the server snapshot during SSR/hydration. */
  serverSize?: WindowSize;
}

/**
 * Calculates Material 3 size classes for an explicitly container-scoped size.
 *
 * This is a web convenience, not an AndroidX `WindowAdaptiveInfo` contract.
 * It deliberately reuses the canonical Material window-size-class selectors so
 * local and screen-level adaptive code share the same semantic thresholds.
 */
export function calculateContainerAdaptiveInfo(
  containerSize: Readonly<WindowSize>,
): ContainerAdaptiveInfo {
  return {
    containerSize,
    containerSizeClass: calculateWindowSizeClass(containerSize),
  };
}

/**
 * Observes a container and returns opt-in, container-scoped Material 3 size
 * classes. Screen-level Material layouts should keep using
 * `useWindowAdaptiveInfo()` as their canonical source of adaptive state.
 *
 * The hook observes the element border box with `ResizeObserver`, handles ref
 * target replacement after React commits, and uses a zero-size compact snapshot
 * when no target is mounted. It is SSR-safe and does not read the DOM during
 * server rendering.
 */
export function useContainerAdaptiveInfo<T extends Element>(
  ref: RefObject<T | null>,
  options: UseContainerAdaptiveInfoOptions = {},
): ContainerAdaptiveInfo {
  const store = useMemo(() => createContainerSizeStore(), []);

  useIsomorphicLayoutEffect(() => {
    store.setTarget(ref.current);
  });

  useIsomorphicLayoutEffect(
    () => () => {
      store.dispose();
    },
    [store],
  );

  const serverWidth = options.serverSize?.width ?? defaultServerSize.width;
  const serverHeight = options.serverSize?.height ?? defaultServerSize.height;
  const serverSnapshot = useMemo<Readonly<WindowSize>>(
    () => Object.freeze({ width: serverWidth, height: serverHeight }),
    [serverHeight, serverWidth],
  );
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);
  const containerSize = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );

  return useMemo(
    () => calculateContainerAdaptiveInfo(containerSize),
    [containerSize],
  );
}
