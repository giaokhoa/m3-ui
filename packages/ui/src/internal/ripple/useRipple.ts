import { rippleTokens } from '@m3/tokens/ripple';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { RippleOrigin, RipplePressEvent, RippleWave } from './types';

export interface UseRippleOptions {
  origin?: RippleOrigin;
}

export interface RippleController {
  readonly containerRef: RefObject<HTMLSpanElement | null>;
  readonly waves: readonly RippleWave[];
  onPressStart(event: RipplePressEvent): void;
  onPressEnd(): void;
}

function getWaveGeometry(
  event: RipplePressEvent,
  container: Element,
  origin: RippleOrigin,
) {
  const { width, height } = container.getBoundingClientRect();
  const shouldCenter =
    origin === 'center' ||
    event.pointerType === 'keyboard' ||
    event.pointerType === 'virtual';

  const x = shouldCenter ? width / 2 : event.x;
  const y = shouldCenter ? height / 2 : event.y;
  const radius = Math.hypot(
    Math.max(x, width - x),
    Math.max(y, height - y),
  );

  return { x, y, diameter: radius * 2 };
}

export function useRipple({ origin = 'press' }: UseRippleOptions = {}): RippleController {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [waves, setWaves] = useState<RippleWave[]>([]);
  const nextId = useRef(0);
  const activeWaveId = useRef<number | null>(null);
  const startedAt = useRef(new Map<number, number>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const releaseWave = useCallback(
    (id: number) => {
      setWaves((current) =>
        current.map((wave) =>
          wave.id === id ? { ...wave, isReleasing: true } : wave,
        ),
      );

      schedule(() => {
        setWaves((current) => current.filter((wave) => wave.id !== id));
        startedAt.current.delete(id);
      }, rippleTokens.fadeOutDurationMs);
    },
    [schedule],
  );

  const onPressStart = useCallback(
    (event: RipplePressEvent) => {
      const container = containerRef.current ?? event.target;
      const id = nextId.current++;
      const geometry = getWaveGeometry(event, container, origin);

      activeWaveId.current = id;
      startedAt.current.set(id, Date.now());
      setWaves((current) => [
        ...current,
        { id, ...geometry, isReleasing: false },
      ]);
    },
    [origin],
  );

  const onPressEnd = useCallback(() => {
    const id = activeWaveId.current;
    if (id === null) {
      return;
    }

    activeWaveId.current = null;
    const elapsed = Date.now() - (startedAt.current.get(id) ?? Date.now());
    const remaining = Math.max(
      0,
      rippleTokens.minimumPressDurationMs - elapsed,
    );

    schedule(() => releaseWave(id), remaining);
  }, [releaseWave, schedule]);

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        clearTimeout(timer);
      }
      timers.current.clear();
    },
    [],
  );

  return { containerRef, waves, onPressStart, onPressEnd };
}
