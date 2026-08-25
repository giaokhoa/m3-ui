import { useState } from 'react';
import { navigationDrawerRuntime } from './NavigationDrawer.defaults';

export const DrawerValue = {
  Closed: 'closed',
  Open: 'open',
} as const;

export type DrawerValue = (typeof DrawerValue)[keyof typeof DrawerValue];

export type DrawerAnchors = Readonly<Record<DrawerValue, number>>;

export interface DrawerStateOptions {
  initialValue?: DrawerValue;
  confirmStateChange?: (value: DrawerValue) => boolean;
  positionalThreshold?: number;
  velocityThreshold?: number;
}

export interface ResolveDrawerTargetOptions {
  currentValue: DrawerValue;
  offset: number;
  velocity: number;
  anchors: DrawerAnchors;
  positionalThreshold?: number;
  velocityThreshold?: number;
}

function assertPositiveFinite(value: number, name: string) {
  if (!(Number.isFinite(value) && value > 0)) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}

function assertThresholdRatio(value: number) {
  if (!(Number.isFinite(value) && value > 0 && value <= 1)) {
    throw new RangeError('positionalThreshold must be in the interval (0, 1].');
  }
}

/** Closed is one drawer width toward the logical start edge; Open is flush at zero. */
export function calculateDrawerAnchors(drawerWidth: number): DrawerAnchors {
  assertPositiveFinite(drawerWidth, 'drawerWidth');
  return {
    [DrawerValue.Closed]: -drawerWidth,
    [DrawerValue.Open]: 0,
  };
}

export function calculateDrawerFraction(
  offset: number,
  anchors: DrawerAnchors,
): number {
  const closed = anchors[DrawerValue.Closed];
  const open = anchors[DrawerValue.Open];
  if (!Number.isFinite(offset) || open === closed) return 0;
  return Math.min(1, Math.max(0, (offset - closed) / (open - closed)));
}

/**
 * Mirrors AndroidX AnchoredDraggable settling: velocity wins above 400px/s;
 * otherwise crossing 50% of the anchor distance advances to the next value.
 * Offset and velocity are logical-axis values, so opening is always positive.
 */
export function resolveDrawerTarget({
  currentValue,
  offset,
  velocity,
  anchors,
  positionalThreshold = navigationDrawerRuntime.positionalThreshold,
  velocityThreshold = navigationDrawerRuntime.velocityThreshold,
}: ResolveDrawerTargetOptions): DrawerValue {
  assertThresholdRatio(positionalThreshold);
  assertPositiveFinite(velocityThreshold, 'velocityThreshold');

  const currentOffset = anchors[currentValue];
  const distance = Math.abs(
    anchors[DrawerValue.Open] - anchors[DrawerValue.Closed],
  );
  const threshold = distance * positionalThreshold;
  const direction =
    Math.abs(velocity) >= velocityThreshold
      ? Math.sign(velocity)
      : Math.abs(offset - currentOffset) >= threshold
        ? Math.sign(offset - currentOffset)
        : 0;

  if (direction > 0) return DrawerValue.Open;
  if (direction < 0) return DrawerValue.Closed;
  return currentValue;
}

/**
 * Web state controller corresponding to Compose DrawerState. Logical state
 * changes synchronously while NavigationDrawer owns CSS motion and drag offset.
 */
export class DrawerState {
  readonly positionalThreshold: number;
  readonly velocityThreshold: number;

  private readonly confirmStateChange: (value: DrawerValue) => boolean;
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private value: DrawerValue;

  constructor({
    initialValue = DrawerValue.Closed,
    confirmStateChange = () => true,
    positionalThreshold = navigationDrawerRuntime.positionalThreshold,
    velocityThreshold = navigationDrawerRuntime.velocityThreshold,
  }: DrawerStateOptions = {}) {
    assertThresholdRatio(positionalThreshold);
    assertPositiveFinite(velocityThreshold, 'velocityThreshold');
    this.value = initialValue;
    this.confirmStateChange = confirmStateChange;
    this.positionalThreshold = positionalThreshold;
    this.velocityThreshold = velocityThreshold;
  }

  get currentValue(): DrawerValue {
    return this.value;
  }

  get targetValue(): DrawerValue {
    return this.value;
  }

  get isOpen(): boolean {
    return this.value === DrawerValue.Open;
  }

  get isClosed(): boolean {
    return this.value === DrawerValue.Closed;
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

  setValue(value: DrawerValue): boolean {
    if (value === this.value) return true;
    if (!this.confirmStateChange(value)) return false;
    this.value = value;
    this.emit();
    return true;
  }

  open(): boolean {
    return this.setValue(DrawerValue.Open);
  }

  close(): boolean {
    return this.setValue(DrawerValue.Closed);
  }

  snapTo(value: DrawerValue): boolean {
    return this.setValue(value);
  }
}

export function useDrawerState(options: DrawerStateOptions = {}): DrawerState {
  const [state] = useState(() => new DrawerState(options));
  return state;
}
