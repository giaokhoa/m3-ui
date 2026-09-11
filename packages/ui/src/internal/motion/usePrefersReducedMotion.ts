import { useSyncExternalStore } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribers = new Set<() => void>();
let mediaQuery: MediaQueryList | null = null;

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  mediaQuery ??= window.matchMedia(reducedMotionQuery);
  return mediaQuery;
}

function notifySubscribers() {
  for (const subscriber of [...subscribers]) subscriber();
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);

  if (subscribers.size === 1) {
    getMediaQuery()?.addEventListener('change', notifySubscribers);
  }

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      mediaQuery?.removeEventListener('change', notifySubscribers);
      mediaQuery = null;
    }
  };
}

function getSnapshot(): boolean {
  return Boolean(getMediaQuery()?.matches);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
