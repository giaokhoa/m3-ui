import { useMemo, useSyncExternalStore } from 'react';
import {
  calculateWindowAdaptiveInfo,
  defaultWindowPosture,
  type WindowAdaptiveInfo,
  type WindowPosture,
} from './paneScaffoldDirective';
import type { WindowSize } from './windowSizeClass';

const defaultServerSize: WindowSize = Object.freeze({ width: 0, height: 0 });

function encodeSize({ width, height }: WindowSize): string {
  return `${width},${height}`;
}

function decodeSize(snapshot: string): WindowSize {
  const [width = '0', height = '0'] = snapshot.split(',');
  return { width: Number(width), height: Number(height) };
}

function readLayoutViewport(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return encodeSize(defaultServerSize);
  }

  const root = document.documentElement;
  return encodeSize({
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  });
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  window.addEventListener('resize', onStoreChange);

  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(onStoreChange);
  observer?.observe(document.documentElement);

  return () => {
    window.removeEventListener('resize', onStoreChange);
    observer?.disconnect();
  };
}

export interface UseWindowAdaptiveInfoOptions {
  /** Explicit posture supplied by a platform/folding-feature adapter. */
  posture?: WindowPosture;
  /** Stable SSR viewport used by `useSyncExternalStore` during server render. */
  serverSize?: WindowSize;
}

/**
 * Tracks the browser layout viewport and returns Material 3 adaptive info.
 *
 * This intentionally reads the layout viewport, not `visualViewport`: browser
 * zoom and virtual keyboards must not masquerade as a different application
 * window class. Folding posture is explicit because the web has no universal
 * API equivalent to Android WindowManager's posture source.
 */
export function useWindowAdaptiveInfo(
  options: UseWindowAdaptiveInfoOptions = {},
): WindowAdaptiveInfo {
  const posture = options.posture ?? defaultWindowPosture;
  const serverSnapshot = encodeSize(options.serverSize ?? defaultServerSize);
  const snapshot = useSyncExternalStore(
    subscribe,
    readLayoutViewport,
    () => serverSnapshot,
  );
  const windowSize = useMemo(() => decodeSize(snapshot), [snapshot]);

  return useMemo(
    () => calculateWindowAdaptiveInfo(windowSize, posture),
    [windowSize, posture],
  );
}
