import {
  calculatePaneMotionSpringDurationMs,
  samplePaneMotionSpring,
} from './paneMotionSpring';

export const PaneExpansionUnspecified = -1;
const AnchoringVelocityThreshold = 200;
const AnchoringVisibilityThreshold = 1;
const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

export type PaneExpansionAnchor =
  | { readonly type: 'proportion'; readonly proportion: number }
  | { readonly type: 'offset'; readonly direction: 'start' | 'end'; readonly offset: number };

export interface PaneExpansionAnimationContext {
  from: number;
  to: number;
  initialVelocity: number;
  signal: AbortSignal;
  update: (offset: number) => void;
}

export type PaneExpansionAnimation = (
  context: PaneExpansionAnimationContext,
) => Promise<void>;

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function finite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`);
  }
}

function composeFloat(value: number) {
  return Math.fround(value);
}

function nonNegativeAnchorOffset(value: number) {
  const floatOffset = composeFloat(value);
  if (Number.isNaN(floatOffset) || floatOffset < 0) {
    throw new RangeError('Offset must larger than or equal to 0 CSS pixels.');
  }
  return floatOffset;
}

function composeRoundToInt(value: number) {
  if (Number.isNaN(value)) {
    throw new RangeError('Cannot round NaN value.');
  }
  if (value >= ComposeIntMax) return ComposeIntMax;
  if (value <= ComposeIntMin) return ComposeIntMin;
  return Math.round(value);
}

function composeFloatToInt(value: number) {
  const floatValue = composeFloat(value);
  if (Number.isNaN(floatValue)) return 0;
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.trunc(floatValue);
}

function composeIntSubtract(a: number, b: number) {
  return (a - b) | 0;
}

function composeIntAbs(value: number) {
  const intValue = value | 0;
  return intValue === ComposeIntMin ? ComposeIntMin : Math.abs(intValue);
}

export const PaneExpansionAnchor = Object.freeze({
  proportion(proportion: number): PaneExpansionAnchor {
    return Object.freeze({ type: 'proportion', proportion: composeFloat(proportion) });
  },
  fromStart(offset: number): PaneExpansionAnchor {
    return Object.freeze({
      type: 'offset',
      direction: 'start',
      offset: nonNegativeAnchorOffset(offset),
    });
  },
  fromEnd(offset: number): PaneExpansionAnchor {
    return Object.freeze({
      type: 'offset',
      direction: 'end',
      offset: nonNegativeAnchorOffset(offset),
    });
  },
});

export interface PaneExpansionLayoutState {
  firstPaneWidth: number;
  firstPaneProportion: number;
  currentDraggingOffset: number;
  isDraggingOrSettling: boolean;
}

/** The fields saved by AndroidX PaneExpansionStateDataSaver for each persistent key. */
export interface PaneExpansionPersistentData {
  firstPaneWidth: number;
  firstPaneProportion: number;
  currentDraggingOffset: number;
  currentAnchor: PaneExpansionAnchor | null;
}

export interface PaneExpansionStateOptions {
  anchors?: readonly PaneExpansionAnchor[];
  initialAnchoredIndex?: number;
  consumeDragDelta?: (delta: number) => number;
  /** Web animation driver for AndroidX anchoringAnimationSpec. */
  animation?: PaneExpansionAnimation;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function anchorEquals(a: PaneExpansionAnchor, b: PaneExpansionAnchor) {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (a.type === 'proportion' && b.type === 'proportion') {
    return composeFloat(a.proportion) === composeFloat(b.proportion);
  }
  return (
    a.type === 'offset' &&
    b.type === 'offset' &&
    a.direction === b.direction &&
    a.offset === b.offset
  );
}

function anchorPosition(
  anchor: PaneExpansionAnchor,
  totalSize: number,
  direction: 'ltr' | 'rtl',
) {
  let offset: number;
  if (anchor.type === 'proportion') {
    offset = clamp(
      composeRoundToInt(
        composeFloat(composeFloat(totalSize) * composeFloat(anchor.proportion)),
      ),
      0,
      totalSize,
    );
  } else if (anchor.direction === 'start') {
    offset = composeRoundToInt(anchor.offset);
  } else {
    offset = totalSize - composeRoundToInt(anchor.offset);
  }
  return direction === 'rtl' ? totalSize - offset : offset;
}

interface IndexedAnchorPosition {
  readonly anchor: PaneExpansionAnchor;
  readonly index: number;
  readonly position: number;
}

function indexedAnchorPositions(
  anchors: readonly PaneExpansionAnchor[],
  totalSize: number,
  direction: 'ltr' | 'rtl',
): IndexedAnchorPosition[] {
  return anchors
    .map((anchor, index) => ({
      anchor,
      index,
      position: anchorPosition(anchor, totalSize, direction),
    }))
    .sort((a, b) => a.position - b.position || a.index - b.index);
}

function requestFrame(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
  return setTimeout(
    () => callback(globalThis.performance?.now() ?? Date.now()),
    16,
  ) as unknown as number;
}

function cancelFrame(id: number) {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Browser driver for AndroidX PaneExpansionState.DefaultAnchoringAnimationSpec:
 * spring(dampingRatio = 0.8, stiffness = 380, visibilityThreshold = 1f).
 */
export const defaultPaneExpansionAnimation: PaneExpansionAnimation = ({
  from,
  to,
  initialVelocity,
  signal,
  update,
}) =>
  new Promise<void>((resolve) => {
    const durationMs = calculatePaneMotionSpringDurationMs(
      from,
      to,
      AnchoringVisibilityThreshold,
      initialVelocity,
    );
    if (signal.aborted || durationMs === 0) {
      update(to);
      resolve();
      return;
    }

    let frame = 0;
    let startTime: number | undefined;
    const finish = () => {
      signal.removeEventListener('abort', abort);
      resolve();
    };
    const tick = (time: number) => {
      if (signal.aborted) {
        finish();
        return;
      }
      startTime ??= time;
      const elapsed = Math.max(0, time - startTime);
      if (elapsed >= durationMs) {
        update(to);
        finish();
        return;
      }
      update(samplePaneMotionSpring(from, to, elapsed, initialVelocity));
      frame = requestFrame(tick);
    };
    const abort = () => {
      cancelFrame(frame);
      finish();
    };
    signal.addEventListener('abort', abort, { once: true });
    frame = requestFrame(tick);
  });

/**
 * Mutable pane-expansion state ported from AndroidX PaneExpansionState.
 *
 * The state owns explicit width/proportion settings, drag offset and anchors.
 * Anchor changes use the pinned Material anchoring spring; pointer release
 * velocity is treated as the browser analogue of AndroidX's leftover fling
 * velocity instead of porting the platform-specific scrolling spline.
 */
export class PaneExpansionState {
  private firstPaneWidthState = PaneExpansionUnspecified;
  private firstPaneProportionState = Number.NaN;
  private currentDraggingOffsetState = PaneExpansionUnspecified;
  private currentMeasuredDraggingOffset = PaneExpansionUnspecified;
  private maxExpansionWidth = PaneExpansionUnspecified;
  private measuredDirection: 'ltr' | 'rtl' = 'ltr';
  private anchors: readonly PaneExpansionAnchor[];
  private currentAnchorState: PaneExpansionAnchor | null;
  private initialAnchoredIndexState: number;
  private consumeDragDelta: (delta: number) => number;
  private dragging = false;
  private settling = false;
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private defaultAnimation: PaneExpansionAnimation;
  private settleAnimationController: AbortController | null = null;
  private settleAnimationTargetOffset = PaneExpansionUnspecified;

  constructor({
    anchors = [],
    initialAnchoredIndex = -1,
    consumeDragDelta = (delta) => delta,
    animation = defaultPaneExpansionAnimation,
  }: PaneExpansionStateOptions = {}) {
    if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
      throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
    }
    this.anchors = [...anchors];
    this.initialAnchoredIndexState = initialAnchoredIndex;
    this.currentAnchorState =
      initialAnchoredIndex === -1 ? null : this.anchors[initialAnchoredIndex] ?? null;
    this.consumeDragDelta = consumeDragDelta;
    this.defaultAnimation = animation;
  }

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = () => this.revision;

  private notify() {
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
  }

  /** Snapshot only the fields persisted by rememberPersistentlyWithKey. */
  capturePersistentData(): PaneExpansionPersistentData {
    return {
      firstPaneWidth: this.firstPaneWidthState,
      firstPaneProportion: this.firstPaneProportionState,
      currentDraggingOffset: this.currentDraggingOffsetState,
      currentAnchor: this.currentAnchorState,
    };
  }

  /**
   * Restore one key's PaneExpansionStateData into this live state instance.
   * Measurement, direction, drag runtime and listeners intentionally stay on
   * the live object, matching AndroidX's remembered PaneExpansionState.
   */
  restorePersistentData(
    data: PaneExpansionPersistentData,
    anchors: readonly PaneExpansionAnchor[],
    initialAnchoredIndex = this.initialAnchoredIndexState,
  ) {
    if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
      throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
    }

    this.cancelSettlingAnimation();
    this.firstPaneWidthState = data.firstPaneWidth;
    this.firstPaneProportionState = data.firstPaneProportion;
    this.currentDraggingOffsetState = data.currentDraggingOffset;
    this.currentAnchorState = data.currentAnchor;

    const nextAnchors = [...anchors];
    const currentAnchorStillPresent =
      this.currentAnchorState !== null &&
      nextAnchors.some((anchor) => anchorEquals(anchor, this.currentAnchorState!));
    const initialAnchorForCurrentAnchors =
      initialAnchoredIndex === -1 ? null : nextAnchors[initialAnchoredIndex] ?? null;

    this.anchors = nextAnchors;
    this.initialAnchoredIndexState = initialAnchoredIndex;
    if (!currentAnchorStillPresent) {
      this.currentAnchorState = initialAnchorForCurrentAnchors;
    }
    this.notify();
  }

  /**
   * Cancels only a drag-mutex-owned settle operation. Public animateTo calls are
   * independent coroutines upstream and are deliberately left running.
   * animateToInternal snaps its target in finally even when cancellation wins.
   */
  private cancelSettlingAnimation() {
    const controller = this.settleAnimationController;
    if (controller === null) return false;
    const targetOffset = this.settleAnimationTargetOffset;
    this.settleAnimationController = null;
    this.settleAnimationTargetOffset = PaneExpansionUnspecified;
    controller.abort();
    if (targetOffset !== PaneExpansionUnspecified) {
      this.setAnimatedOffset(targetOffset);
    }
    const wasSettling = this.settling;
    this.settling = false;
    return wasSettling;
  }

  private findAnchor(anchor: PaneExpansionAnchor) {
    return this.anchors.find((candidate) => anchorEquals(candidate, anchor));
  }

  private getIndexedAnchorPositions() {
    if (this.maxExpansionWidth === PaneExpansionUnspecified) return [];
    return indexedAnchorPositions(this.anchors, this.maxExpansionWidth, this.measuredDirection);
  }

  private setAnimatedOffset(value: number) {
    if (this.maxExpansionWidth === PaneExpansionUnspecified) return;
    const offset = clamp(composeFloatToInt(value), 0, this.maxExpansionWidth);
    this.currentDraggingOffsetState = offset;
    this.currentMeasuredDraggingOffset = offset;
  }

  get currentAnchor() {
    return this.currentAnchorState;
  }

  get isDragging() {
    return this.dragging;
  }

  get isSettling() {
    return this.settling;
  }

  get isDraggingOrSettling() {
    return this.dragging || this.settling;
  }

  get nextAnchor(): PaneExpansionAnchor | null {
    const positions = this.getIndexedAnchorPositions();
    if (positions.length === 0) return null;
    const currentOffset =
      this.currentDraggingOffsetState === PaneExpansionUnspecified
        ? this.currentMeasuredDraggingOffset
        : this.currentDraggingOffsetState;
    for (const anchorPosition of positions) {
      if (currentOffset < anchorPosition.position) return anchorPosition.anchor;
    }
    return this.anchors[0] ?? null;
  }

  isUnspecified() {
    return (
      this.firstPaneWidthState === PaneExpansionUnspecified &&
      Number.isNaN(this.firstPaneProportionState) &&
      this.currentDraggingOffsetState === PaneExpansionUnspecified
    );
  }

  setFirstPaneWidth(firstPaneWidth: number) {
    this.firstPaneProportionState = Number.NaN;
    this.currentDraggingOffsetState = PaneExpansionUnspecified;
    this.firstPaneWidthState = Math.trunc(firstPaneWidth);
    this.currentAnchorState = null;
    this.notify();
  }

  setFirstPaneProportion(firstPaneProportion: number) {
    const floatProportion = composeFloat(firstPaneProportion);
    if (!Number.isFinite(floatProportion) || floatProportion < 0 || floatProportion > 1) {
      throw new RangeError('Proportion value needs to be in [0, 1]');
    }
    this.firstPaneWidthState = PaneExpansionUnspecified;
    this.currentDraggingOffsetState = PaneExpansionUnspecified;
    this.firstPaneProportionState = floatProportion;
    this.currentAnchorState = null;
    this.notify();
  }

  clear() {
    this.firstPaneWidthState = PaneExpansionUnspecified;
    this.firstPaneProportionState = Number.NaN;
    this.currentDraggingOffsetState = PaneExpansionUnspecified;
    this.notify();
  }

  setAnchors(
    anchors: readonly PaneExpansionAnchor[],
    initialAnchoredIndex = this.initialAnchoredIndexState,
  ) {
    if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
      throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
    }

    // restore() owns the same drag mutex as settleToAnchorIfNeeded. Updating the
    // anchor configuration therefore cancels an active settle, but not a public
    // animateTo coroutine, and the canceled settle snaps its target in finally.
    this.cancelSettlingAnimation();
    const nextAnchors = [...anchors];
    const currentAnchorStillPresent =
      this.currentAnchorState !== null &&
      nextAnchors.some((anchor) => anchorEquals(anchor, this.currentAnchorState!));
    const initialAnchorForCurrentAnchors =
      initialAnchoredIndex === -1 ? null : nextAnchors[initialAnchoredIndex] ?? null;

    this.anchors = nextAnchors;
    this.initialAnchoredIndexState = initialAnchoredIndex;
    if (!currentAnchorStillPresent) {
      this.currentAnchorState = initialAnchorForCurrentAnchors;
    }
    this.notify();
  }

  setConsumeDragDelta(consumeDragDelta: (delta: number) => number) {
    this.consumeDragDelta = consumeDragDelta;
  }

  setAnimation(animation: PaneExpansionAnimation) {
    this.defaultAnimation = animation;
  }

  onMeasured(measuredWidth: number, direction: 'ltr' | 'rtl' = 'ltr') {
    finiteNonNegative(measuredWidth, 'measuredWidth');
    const nextWidth = Math.round(measuredWidth);
    if (nextWidth === this.maxExpansionWidth && direction === this.measuredDirection) return;

    this.maxExpansionWidth = nextWidth;
    this.measuredDirection = direction;
    if (!this.isDraggingOrSettling && this.currentAnchorState !== null) {
      const offset = clamp(
        anchorPosition(this.currentAnchorState, nextWidth, direction),
        0,
        nextWidth,
      );
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    } else if (this.currentDraggingOffsetState !== PaneExpansionUnspecified) {
      const offset = clamp(this.currentDraggingOffsetState, 0, nextWidth);
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    }
    this.notify();
  }

  onExpansionOffsetMeasured(measuredOffset: number) {
    if (!Number.isFinite(measuredOffset)) return;
    this.currentMeasuredDraggingOffset = Math.round(measuredOffset);
  }

  beginDrag() {
    const cancelledSettling = this.cancelSettlingAnimation();
    if (this.dragging && !cancelledSettling) return;
    this.dragging = true;
    this.notify();
  }

  dispatchRawDelta(delta: number) {
    const remainingDelta = composeFloat(this.consumeDragDelta(composeFloat(delta)));
    if (
      this.maxExpansionWidth === PaneExpansionUnspecified ||
      this.currentMeasuredDraggingOffset === PaneExpansionUnspecified
    ) {
      return;
    }
    const nextOffset = clamp(
      composeFloatToInt(
        composeFloat(composeFloat(this.currentMeasuredDraggingOffset) + remainingDelta),
      ),
      0,
      this.maxExpansionWidth,
    );
    if (nextOffset === this.currentDraggingOffsetState) return;
    this.currentDraggingOffsetState = nextOffset;
    this.currentMeasuredDraggingOffset = nextOffset;
    this.notify();
  }

  endDrag(velocity = 0) {
    finite(velocity, 'velocity');
    if (this.dragging) {
      this.dragging = false;
      this.notify();
    }
    void this.settleToAnchorIfNeeded(velocity);
  }

  private async animateToAnchor(
    anchor: PaneExpansionAnchor,
    initialVelocity: number,
    mutexOwned: boolean,
  ) {
    this.currentAnchorState = anchor;
    if (this.maxExpansionWidth === PaneExpansionUnspecified) {
      this.notify();
      return;
    }

    const targetOffset = anchorPosition(
      anchor,
      this.maxExpansionWidth,
      this.measuredDirection,
    );
    const from = this.currentMeasuredDraggingOffset;
    const floatInitialVelocity = composeFloat(initialVelocity);
    if (from === targetOffset && floatInitialVelocity === 0) {
      this.setAnimatedOffset(targetOffset);
      this.notify();
      return;
    }

    const controller = new AbortController();
    if (mutexOwned) {
      this.settleAnimationController = controller;
      this.settleAnimationTargetOffset = targetOffset;
    }
    this.settling = true;
    this.notify();

    try {
      await this.defaultAnimation({
        from,
        to: targetOffset,
        initialVelocity: floatInitialVelocity,
        signal: controller.signal,
        update: (offset) => {
          if (controller.signal.aborted) return;
          this.setAnimatedOffset(offset);
          this.notify();
        },
      });
    } finally {
      // AndroidX animateToInternal assigns the target in finally, including
      // cancellation and animation exceptions.
      this.setAnimatedOffset(targetOffset);
      if (mutexOwned && this.settleAnimationController === controller) {
        this.settleAnimationController = null;
        this.settleAnimationTargetOffset = PaneExpansionUnspecified;
      }
      this.settling = false;
      this.notify();
    }
  }

  /** AndroidX PaneExpansionState.animateTo analogue. */
  async animateTo(anchor: PaneExpansionAnchor, initialVelocity = 0) {
    if (this.findAnchor(anchor) === undefined) {
      throw new RangeError('The provided anchor is not in the anchor list');
    }
    // contains(anchor) is only validation upstream; currentAnchor receives the
    // exact argument object rather than the equal anchor instance from the list.
    await this.animateToAnchor(anchor, initialVelocity, false);
  }

  moveToNextAnchor() {
    const anchor = this.nextAnchor;
    if (anchor !== null) void this.animateTo(anchor);
  }

  async settleToAnchorIfNeeded(velocity: number) {
    finite(velocity, 'velocity');
    const floatVelocity = composeFloat(velocity);
    const positions = this.getIndexedAnchorPositions();
    if (positions.length === 0) return;

    // MutatorMutex starts this operation only after canceling the previous
    // settle/drag mutation. The canceled anchor animation snaps its target in
    // animateToInternal.finally before the next anchor is scored.
    this.cancelSettlingAnimation();
    const currentPosition = this.currentMeasuredDraggingOffset;
    let bestAnchorPosition = positions[0]!;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const anchorPosition of positions) {
      let score: number;
      if (floatVelocity >= AnchoringVelocityThreshold) {
        const delta = composeIntSubtract(anchorPosition.position, currentPosition);
        score = delta < 0 ? composeIntSubtract(this.maxExpansionWidth, delta) : delta;
      } else if (floatVelocity <= -AnchoringVelocityThreshold) {
        const delta = composeIntSubtract(currentPosition, anchorPosition.position);
        score = delta < 0 ? composeIntSubtract(this.maxExpansionWidth, delta) : delta;
      } else {
        score = composeIntAbs(composeIntSubtract(currentPosition, anchorPosition.position));
      }
      if (score < bestScore) {
        bestScore = score;
        bestAnchorPosition = anchorPosition;
      }
    }

    await this.animateToAnchor(bestAnchorPosition.anchor, floatVelocity, true);
  }

  getLayoutState(
    measuredWidth: number,
    direction: 'ltr' | 'rtl' = this.measuredDirection,
  ): PaneExpansionLayoutState {
    const width = Math.max(0, Math.round(measuredWidth));
    let draggingOffset = this.currentDraggingOffsetState;
    if (draggingOffset === PaneExpansionUnspecified && this.currentAnchorState !== null) {
      draggingOffset = anchorPosition(this.currentAnchorState, width, direction);
    }
    if (draggingOffset !== PaneExpansionUnspecified) {
      draggingOffset = clamp(draggingOffset, 0, width);
    }

    return {
      firstPaneWidth:
        this.firstPaneWidthState === PaneExpansionUnspecified
          ? PaneExpansionUnspecified
          : clamp(this.firstPaneWidthState, 0, width),
      firstPaneProportion: this.firstPaneProportionState,
      currentDraggingOffset: draggingOffset,
      isDraggingOrSettling: this.isDraggingOrSettling,
    };
  }
}
