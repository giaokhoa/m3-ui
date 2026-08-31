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

export function useRipple({
  origin = 'press',
  radius,
}: UseRippleOptions = {}): RippleController {
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
    const elapsed = Date.now() - (startedAt.current.get(id) ?? Date.now());
    const remaining = Math.max(0, minimumPressDurationMs - elapsed);
    schedule(() => releaseWave(id), remaining);
  }, [releaseWave, schedule]);

  useEffect(
    () => () => {
      for (const timer of timers.current) clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const controller: RippleController = {
    containerRef,
    waves,
    onPressStart,
    onPressEnd,
    getPressProps<Event extends RipplePressEvent>(
      handlers?: RipplePressHandlers<Event>,
    ) {
      return chainRipplePressHandlers(controller, handlers);
    },
  };

  return controller;
}
