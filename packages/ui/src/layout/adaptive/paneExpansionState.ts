import {
  calculatePaneMotionSpringDurationMs,
  samplePaneMotionSpring,
} from './paneMotionSpring';

export const PaneExpansionUnspecified = -1;
const AnchoringVelocityThreshold = 200;
const AnchoringVisibilityThreshold = 1;

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

export const PaneExpansionAnchor = Object.freeze({
  proportion(proportion: number): PaneExpansionAnchor {
    if (!Number.isFinite(proportion) || proportion < 0 || proportion > 1) {
      throw new RangeError('Proportion value needs to be in [0, 1]');
    }
    return Object.freeze({ type: 'proportion', proportion });
  },
  fromStart(offset: number): PaneExpansionAnchor {
    finiteNonNegative(offset, 'offset');
    return Object.freeze({ type: 'offset', direction: 'start', offset });
  },
  fromEnd(offset: number): PaneExpansionAnchor {
    finiteNonNegative(offset, 'offset');
    return Object.freeze({ type: 'offset', direction: 'end', offset });
  },
});

export interface PaneExpansionLayoutState {
  firstPaneWidth: number;
  firstPaneProportion: number;
  currentDraggingOffset: number;
  isDraggingOrSettling: boolean;
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
  if (a.type !== b.type) return false;
  if (a.type === 'proportion' && b.type === 'proportion') {
    return a.proportion === b.proportion;
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
    offset = Math.round(totalSize * anchor.proportion);
  } else if (anchor.direction === 'start') {
    offset = anchor.offset;
  } else {
    offset = totalSize - anchor.offset;
  }
  const coerced = clamp(Math.round(offset), 0, totalSize);
  return direction === 'rtl' ? totalSize - coerced : coerced;
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
  private animationController: AbortController | null = null;
  private restoreInterruptibleAnimationController: AbortController | null = null;
  private animationTargetOffset = PaneExpansionUnspecified;

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

  private cancelAnimation() {
    const controller = this.animationController;
    if (controller === null) return false;
    if (this.restoreInterruptibleAnimationController === controller) {
      this.restoreInterruptibleAnimationController = null;
    }
    this.animationController = null;
    this.animationTargetOffset = PaneExpansionUnspecified;
    controller.abort();
    const wasSettling = this.settling;
    this.settling = false;
    return wasSettling;
  }

  private cancelRestoreInterruptibleAnimation() {
    const controller = this.restoreInterruptibleAnimationController;
    if (controller === null || this.animationController !== controller) return false;
    const targetOffset = this.animationTargetOffset;
    this.restoreInterruptibleAnimationController = null;
    this.animationController = null;
    this.animationTargetOffset = PaneExpansionUnspecified;
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
    const offset = clamp(Math.trunc(value), 0, this.maxExpansionWidth);
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
    if (currentOffset === PaneExpansionUnspecified) return positions[0]!.anchor;
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
    if (
      !Number.isFinite(firstPaneProportion) ||
      firstPaneProportion < 0 ||
      firstPaneProportion > 1
    ) {
      throw new RangeError('Proportion value needs to be in [0, 1]');
    }
    this.firstPaneWidthState = PaneExpansionUnspecified;
    this.currentDraggingOffsetState = PaneExpansionUnspecified;
    this.firstPaneProportionState = firstPaneProportion;
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

    this.cancelRestoreInterruptibleAnimation();
    const nextAnchors = [...anchors];
    const matchedCurrentAnchor =
      this.currentAnchorState === null
        ? undefined
        : nextAnchors.find((anchor) => anchorEquals(anchor, this.currentAnchorState!));
    const initialAnchorForCurrentAnchors =
      initialAnchoredIndex === -1 ? null : nextAnchors[initialAnchoredIndex] ?? null;

    this.anchors = nextAnchors;
    this.initialAnchoredIndexState = initialAnchoredIndex;
    this.currentAnchorState = matchedCurrentAnchor ?? initialAnchorForCurrentAnchors;
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
      const offset = anchorPosition(this.currentAnchorState, nextWidth, direction);
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
    const cancelledSettling = this.cancelAnimation();
    if (this.dragging && !cancelledSettling) return;
    this.dragging = true;
    this.notify();
  }

  dispatchRawDelta(delta: number) {
    if (
      this.maxExpansionWidth === PaneExpansionUnspecified ||
      this.currentMeasuredDraggingOffset === PaneExpansionUnspecified
    ) {
      return;
    }
    const cancelledSettling = this.cancelAnimation();
    const remainingDelta = this.consumeDragDelta(delta);
    const nextOffset = clamp(
      Math.trunc(this.currentMeasuredDraggingOffset + remainingDelta),
      0,
      this.maxExpansionWidth,
    );
    if (nextOffset === this.currentDraggingOffsetState) {
      if (cancelledSettling) this.notify();
      return;
    }
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

  snapToAnchor(anchor: PaneExpansionAnchor) {
    const matched = this.findAnchor(anchor);
    if (matched === undefined) {
      throw new RangeError('The provided anchor is not in the anchor list');
    }
    this.cancelAnimation();
    this.currentAnchorState = matched;
    if (this.maxExpansionWidth !== PaneExpansionUnspecified) {
      const offset = anchorPosition(matched, this.maxExpansionWidth, this.measuredDirection);
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    }
    this.notify();
  }

  private async animateToMatchedAnchor(
    matched: PaneExpansionAnchor,
    initialVelocity: number,
    restoreInterruptible: boolean,
  ) {
    this.cancelAnimation();
    this.currentAnchorState = matched;
    if (
      this.maxExpansionWidth === PaneExpansionUnspecified ||
      this.currentMeasuredDraggingOffset === PaneExpansionUnspecified
    ) {
      this.notify();
      return;
    }

    const targetOffset = anchorPosition(
      matched,
      this.maxExpansionWidth,
      this.measuredDirection,
    );
    const from = this.currentMeasuredDraggingOffset;
    if (from === targetOffset && initialVelocity === 0) {
      this.setAnimatedOffset(targetOffset);
      this.notify();
      return;
    }

    const controller = new AbortController();
    this.animationController = controller;
    this.animationTargetOffset = targetOffset;
    if (restoreInterruptible) {
      this.restoreInterruptibleAnimationController = controller;
    }
    this.settling = true;
    this.notify();

    try {
      await this.defaultAnimation({
        from,
        to: targetOffset,
        initialVelocity,
        signal: controller.signal,
        update: (offset) => {
          if (controller.signal.aborted) return;
          this.setAnimatedOffset(offset);
          this.notify();
        },
      });
      if (controller.signal.aborted) return;
      this.setAnimatedOffset(targetOffset);
    } finally {
      if (this.animationController === controller) {
        this.animationController = null;
        if (this.restoreInterruptibleAnimationController === controller) {
          this.restoreInterruptibleAnimationController = null;
        }
        this.animationTargetOffset = PaneExpansionUnspecified;
        this.settling = false;
        this.notify();
      }
    }
  }

  /** AndroidX PaneExpansionState.animateTo analogue. */
  async animateTo(anchor: PaneExpansionAnchor, initialVelocity = 0) {
    finite(initialVelocity, 'initialVelocity');
    const matched = this.findAnchor(anchor);
    if (matched === undefined) {
      throw new RangeError('The provided anchor is not in the anchor list');
    }
    await this.animateToMatchedAnchor(matched, initialVelocity, false);
  }

  moveToNextAnchor() {
    const anchor = this.nextAnchor;
    if (anchor !== null) void this.animateTo(anchor);
  }

  async settleToAnchorIfNeeded(velocity: number) {
    finite(velocity, 'velocity');
    const positions = this.getIndexedAnchorPositions();
    if (
      positions.length === 0 ||
      this.currentMeasuredDraggingOffset === PaneExpansionUnspecified
    ) {
      return;
    }

    const currentPosition = this.currentMeasuredDraggingOffset;
    let bestAnchorPosition = positions[0]!;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const anchorPosition of positions) {
      let score: number;
      if (velocity >= AnchoringVelocityThreshold) {
        const delta = anchorPosition.position - currentPosition;
        score = delta < 0 ? this.maxExpansionWidth - delta : delta;
      } else if (velocity <= -AnchoringVelocityThreshold) {
        const delta = currentPosition - anchorPosition.position;
        score = delta < 0 ? this.maxExpansionWidth - delta : delta;
      } else {
        score = Math.abs(currentPosition - anchorPosition.position);
      }
      if (score < bestScore) {
        bestScore = score;
        bestAnchorPosition = anchorPosition;
      }
    }

    await this.animateToMatchedAnchor(bestAnchorPosition.anchor, velocity, true);
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
