import { useState } from 'react';
import { bottomSheetRuntime } from './BottomSheet.defaults';

export const SheetValue = {
  Hidden: 'hidden',
  PartiallyExpanded: 'partially-expanded',
  Expanded: 'expanded',
} as const;

export type SheetValue = (typeof SheetValue)[keyof typeof SheetValue];

export type SheetAnchors = Readonly<
  Partial<Record<SheetValue, number>>
>;

export interface SheetStateOptions {
  enabledValues?: Iterable<SheetValue>;
  initialValue?: SheetValue;
  confirmValueChange?: (value: SheetValue) => boolean;
  positionalThreshold?: number;
  velocityThreshold?: number;
}

export interface SheetAnchorOptions {
  viewportHeight: number;
  sheetHeight: number;
  enabledValues?: Iterable<SheetValue>;
  /** Visible height at the PartiallyExpanded anchor. Defaults to half the viewport. */
  partialExpandedHeight?: number;
}

export interface ResolveSheetTargetOptions {
  currentValue: SheetValue;
  offset: number;
  velocity: number;
  anchors: SheetAnchors;
  positionalThreshold?: number;
  velocityThreshold?: number;
}

const allSheetValues = [
  SheetValue.Hidden,
  SheetValue.PartiallyExpanded,
  SheetValue.Expanded,
] as const;

function valueSet(values?: Iterable<SheetValue>): Set<SheetValue> {
  return new Set(values ?? allSheetValues);
}

function assertPositiveFinite(value: number, name: string) {
  if (!(Number.isFinite(value) && value > 0)) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}

function effectiveValue(
  value: SheetValue,
  anchors: SheetAnchors,
): SheetValue {
  if (
    value === SheetValue.PartiallyExpanded &&
    anchors[SheetValue.PartiallyExpanded] !== undefined &&
    anchors[SheetValue.Expanded] !== undefined &&
    Math.abs(
      anchors[SheetValue.PartiallyExpanded]! -
        anchors[SheetValue.Expanded]!,
    ) < 0.5
  ) {
    return SheetValue.Expanded;
  }
  return value;
}

function canonicalAnchorEntries(anchors: SheetAnchors) {
  const entries = allSheetValues
    .flatMap((value) => {
      const offset = anchors[value];
      if (offset === undefined) return [];
      return [{ value: effectiveValue(value, anchors), offset }];
    })
    .sort((a, b) => a.offset - b.offset);

  return entries.filter(
    (entry, index) =>
      index === 0 ||
      Math.abs(entry.offset - entries[index - 1]!.offset) >= 0.5,
  );
}

/**
 * Mirrors AndroidX deterministic anchors. Generic BottomSheet defaults Partial
 * to at most half the viewport; compositions such as BottomSheetScaffold can
 * supply their explicit peek height without introducing a second state model.
 */
export function calculateSheetAnchors({
  viewportHeight,
  sheetHeight,
  enabledValues,
  partialExpandedHeight,
}: SheetAnchorOptions): SheetAnchors {
  if (!(Number.isFinite(viewportHeight) && viewportHeight >= 0)) {
    throw new RangeError('viewportHeight must be a finite non-negative number.');
  }
  if (!(Number.isFinite(sheetHeight) && sheetHeight >= 0)) {
    throw new RangeError('sheetHeight must be a finite non-negative number.');
  }
  if (
    partialExpandedHeight !== undefined &&
    !(Number.isFinite(partialExpandedHeight) && partialExpandedHeight >= 0)
  ) {
    throw new RangeError(
      'partialExpandedHeight must be a finite non-negative number.',
    );
  }

  const enabled = valueSet(enabledValues);
  if (!enabled.has(SheetValue.Expanded)) {
    throw new Error('Expanded must be one of the enabled sheet values.');
  }

  const anchors: Partial<Record<SheetValue, number>> = {};
  if (enabled.has(SheetValue.Hidden)) {
    anchors[SheetValue.Hidden] = viewportHeight;
  }
  if (enabled.has(SheetValue.PartiallyExpanded)) {
    const visibleHeight = Math.min(
      partialExpandedHeight ?? viewportHeight / 2,
      sheetHeight,
      viewportHeight,
    );
    anchors[SheetValue.PartiallyExpanded] = viewportHeight - visibleHeight;
  }
  if (sheetHeight > 0) {
    anchors[SheetValue.Expanded] = Math.max(
      0,
      viewportHeight - sheetHeight,
    );
  }

  return anchors;
}

/**
 * Resolves the next anchor from a released drag. Velocity above the AndroidX
 * threshold advances one anchor in its direction; otherwise the positional
 * threshold measured from the settled anchor decides the transition.
 */
export function resolveSheetTarget({
  currentValue,
  offset,
  velocity,
  anchors,
  positionalThreshold = bottomSheetRuntime.positionalThreshold,
  velocityThreshold = bottomSheetRuntime.velocityThreshold,
}: ResolveSheetTargetOptions): SheetValue {
  assertPositiveFinite(positionalThreshold, 'positionalThreshold');
  assertPositiveFinite(velocityThreshold, 'velocityThreshold');

  const entries = canonicalAnchorEntries(anchors);
  if (entries.length === 0) return currentValue;

  const normalizedCurrent = effectiveValue(currentValue, anchors);
  let currentIndex = entries.findIndex(
    (entry) => entry.value === normalizedCurrent,
  );
  if (currentIndex < 0) {
    currentIndex = entries.reduce((best, entry, index) => {
      const bestDistance = Math.abs(entries[best]!.offset - offset);
      const distance = Math.abs(entry.offset - offset);
      return distance < bestDistance ? index : best;
    }, 0);
  }

  const current = entries[currentIndex]!;
  const direction =
    Math.abs(velocity) >= velocityThreshold
      ? Math.sign(velocity)
      : Math.abs(offset - current.offset) >= positionalThreshold
        ? Math.sign(offset - current.offset)
        : 0;

  if (direction > 0) {
    return entries[Math.min(entries.length - 1, currentIndex + 1)]!.value;
  }
  if (direction < 0) {
    return entries[Math.max(0, currentIndex - 1)]!.value;
  }
  return current.value;
}

/**
 * Ports AndroidX's near-hidden velocity dampening. This mostly matters when a
 * spring would otherwise overshoot the Hidden anchor.
 */
export function dampenSheetVelocity(
  velocity: number,
  offset: number,
  anchors: SheetAnchors,
): number {
  const hidden = anchors[SheetValue.Hidden];
  if (!(velocity > 0 && hidden !== undefined)) return velocity;

  const distanceToFloor = Math.max(0, hidden - offset);
  if (distanceToFloor >= bottomSheetRuntime.boundaryDampeningZone) {
    return velocity;
  }

  const factor =
    distanceToFloor / bottomSheetRuntime.boundaryDampeningZone;
  let safeVelocity = velocity * factor * factor;
  if (velocity >= bottomSheetRuntime.velocityThreshold) {
    safeVelocity = Math.max(
      safeVelocity,
      bottomSheetRuntime.velocityThreshold,
    );
  }
  return safeVelocity;
}

/**
 * Web state controller corresponding to Compose SheetState. The logical value
 * changes synchronously; BottomSheet owns the visual CSS interpolation between
 * the old and new anchor so imperative calls remain framework-independent.
 */
export class SheetState {
  readonly enabledValues: ReadonlySet<SheetValue>;
  readonly positionalThreshold: number;
  readonly velocityThreshold: number;

  private readonly confirmValueChange: (value: SheetValue) => boolean;
  private readonly listeners = new Set<() => void>();
  private revision = 0;
  private value: SheetValue;

  constructor({
    enabledValues,
    initialValue = SheetValue.Hidden,
    confirmValueChange = () => true,
    positionalThreshold = bottomSheetRuntime.positionalThreshold,
    velocityThreshold = bottomSheetRuntime.velocityThreshold,
  }: SheetStateOptions = {}) {
    const enabled = valueSet(enabledValues);
    if (!enabled.has(SheetValue.Expanded)) {
      throw new Error('Expanded must be one of the enabled sheet values.');
    }
    if (!enabled.has(initialValue)) {
      throw new Error('The initial sheet value must be enabled.');
    }
    assertPositiveFinite(positionalThreshold, 'positionalThreshold');
    assertPositiveFinite(velocityThreshold, 'velocityThreshold');

    this.enabledValues = enabled;
    this.value = initialValue;
    this.confirmValueChange = confirmValueChange;
    this.positionalThreshold = positionalThreshold;
    this.velocityThreshold = velocityThreshold;
  }

  get currentValue(): SheetValue {
    return this.value;
  }

  get targetValue(): SheetValue {
    return this.value;
  }

  get isVisible(): boolean {
    return this.value !== SheetValue.Hidden;
  }

  get hasPartiallyExpandedState(): boolean {
    return this.enabledValues.has(SheetValue.PartiallyExpanded);
  }

  get hasExpandedState(): boolean {
    return this.enabledValues.has(SheetValue.Expanded);
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

  setValue(value: SheetValue): boolean {
    if (!this.enabledValues.has(value)) return false;
    if (value === this.value) return true;
    if (!this.confirmValueChange(value)) return false;
    this.value = value;
    this.emit();
    return true;
  }

  reconcileAnchors(anchors: SheetAnchors): boolean {
    const normalized = effectiveValue(this.value, anchors);
    if (normalized === this.value) return false;
    this.value = normalized;
    this.emit();
    return true;
  }

  show(): boolean {
    return this.setValue(
      this.hasPartiallyExpandedState
        ? SheetValue.PartiallyExpanded
        : SheetValue.Expanded,
    );
  }

  expand(): boolean {
    return this.setValue(SheetValue.Expanded);
  }

  partialExpand(): boolean {
    if (!this.hasPartiallyExpandedState) {
      throw new Error(
        'Attempted to partially expand when PartiallyExpanded is disabled.',
      );
    }
    return this.setValue(SheetValue.PartiallyExpanded);
  }

  hide(): boolean {
    if (!this.enabledValues.has(SheetValue.Hidden)) {
      throw new Error(
        'Attempted to hide when Hidden is not an enabled sheet value.',
      );
    }
    return this.setValue(SheetValue.Hidden);
  }
}

export function useSheetState(options: SheetStateOptions = {}): SheetState {
  const [state] = useState(() => new SheetState(options));
  return state;
}
