import {
  RippleFadeOutDuration,
  RippleMinimumPressDuration,
} from '@m3-ui/tokens';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { msNumber } from '../tokenValues';
import { getRippleWaveGeometry } from './geometry';
import type { RippleOrigin, RipplePressEvent, RippleWave } from './types';

export interface UseRippleOptions {
  origin?: RippleOrigin;
  radius?: number;
}

export interface RipplePressHandlers<Event extends RipplePressEvent = RipplePressEvent> {
  onPressStart?: (event: Event) => void;
  onPressEnd?: (event: Event) => void;
}

export interface RipplePressProps<Event extends RipplePressEvent = RipplePressEvent> {
  onPressStart(event: Event): void;
  onPressEnd(event: Event): void;
}

export interface RippleController {
  readonly containerRef: RefObject<HTMLSpanElement | null>;
  readonly waves: readonly RippleWave[];
  onPressStart(event: RipplePressEvent): void;
  onPressEnd(): void;
  getPressProps<Event extends RipplePressEvent>(
    handlers?: RipplePressHandlers<Event>,
  ): RipplePressProps<Event>;
}

const fadeOutDurationMs = msNumber(RippleFadeOutDuration);
const minimumPressDurationMs = msNumber(RippleMinimumPressDuration);
type BrowserTimer = number;

export function chainRipplePressHandlers<Event extends RipplePressEvent>(
  controller: Pick<RippleController, 'onPressStart' | 'onPressEnd'>,
  handlers: RipplePressHandlers<Event> = {},
): RipplePressProps<Event> {
  return {
    onPressStart(event) {
      controller.onPressStart(event);
      handlers.onPressStart?.(event);
    },
    onPressEnd(event) {
      controller.onPressEnd();
      handlers.onPressEnd?.(event);
    },
  };
}

export function getRippleReleaseDelay(startedAt: number, now: number): number {
  return Math.max(0, minimumPressDurationMs - (now - startedAt));
}

export function clearRippleTimers(timers: Set<BrowserTimer>): void {
  for (const timer of timers) window.clearTimeout(timer);
  timers.clear();
}

export function useRipple({
  origin = 'press',
  radius,
}: UseRippleOptions = {}): RippleController {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [waves, setWaves] = useState<RippleWave[]>([]);
  const nextId = useRef(0);
  const activeWaveId = useRef<number | null>(null);
  const startedAt = useRef(new Map<number, number>());
  const timers = useRef(new Set<BrowserTimer>());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer: BrowserTimer = window.setTimeout(() => {
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
      }, fadeOutDurationMs);
    },
    [schedule],
  );

  const onPressStart = useCallback(
    (event: RipplePressEvent) => {
      const container = containerRef.current ?? event.target;
      const { width, height } = container.getBoundingClientRect();
      const id = nextId.current++;
      const geometry = getRippleWaveGeometry(
        event,
        { width, height },
        origin,
        { radius },
      );

      activeWaveId.current = id;
      startedAt.current.set(id, Date.now());
      setWaves((current) => [
        ...current,
        { id, ...geometry, isReleasing: false },
      ]);
    },
    [origin, radius],
  );

  const onPressEnd = useCallback(() => {
    const id = activeWaveId.current;
    if (id === null) return;

    activeWaveId.current = null;
    const now = Date.now();
    const remaining = getRippleReleaseDelay(startedAt.current.get(id) ?? now, now);
    schedule(() => releaseWave(id), remaining);
  }, [releaseWave, schedule]);

  useEffect(
    () => () => {
      clearRippleTimers(timers.current);
    },
    [],
  );

  const getPressProps = useCallback(
    <Event extends RipplePressEvent>(
      handlers: RipplePressHandlers<Event> = {},
    ): RipplePressProps<Event> =>
      chainRipplePressHandlers(
        { onPressStart, onPressEnd },
        handlers,
      ),
    [onPressEnd, onPressStart],
  );

  return {
    containerRef,
    waves,
    onPressStart,
    onPressEnd,
    getPressProps,
  };
}
