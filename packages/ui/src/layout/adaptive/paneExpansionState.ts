export const PaneExpansionUnspecified = -1;
const AnchoringVelocityThreshold = 200;

export type PaneExpansionAnchor =
  | { readonly type: 'proportion'; readonly proportion: number }
  | { readonly type: 'offset'; readonly direction: 'start' | 'end'; readonly offset: number };

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
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

/**
 * Mutable pane-expansion state ported from AndroidX PaneExpansionState.
 *
 * The state owns explicit width/proportion settings, drag offset and anchors.
 * React rendering is notified through subscribe/getSnapshot; animation is kept
 * separate so settling snaps synchronously to the selected AndroidX anchor.
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
  private consumeDragDelta: (delta: number) => number;
  private dragging = false;
  private settling = false;
  private revision = 0;
  private readonly listeners = new Set<() => void>();

  constructor({
    anchors = [],
    initialAnchoredIndex = -1,
    consumeDragDelta = (delta) => delta,
  }: PaneExpansionStateOptions = {}) {
    if (initialAnchoredIndex < -1 || initialAnchoredIndex >= anchors.length) {
      throw new RangeError('initialAnchoredIndex must be -1 or a valid anchor index');
    }
    this.anchors = [...anchors];
    this.currentAnchorState =
      initialAnchoredIndex === -1 ? null : this.anchors[initialAnchoredIndex] ?? null;
    this.consumeDragDelta = consumeDragDelta;
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
    if (this.maxExpansionWidth === PaneExpansionUnspecified || this.anchors.length === 0) {
      return null;
    }
    const currentOffset =
      this.currentDraggingOffsetState === PaneExpansionUnspecified
        ? this.currentMeasuredDraggingOffset
        : this.currentDraggingOffsetState;
    if (currentOffset === PaneExpansionUnspecified) return this.anchors[0] ?? null;
    for (const anchor of this.anchors) {
      if (currentOffset < anchorPosition(anchor, this.maxExpansionWidth, this.measuredDirection)) {
        return anchor;
      }
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

  setAnchors(anchors: readonly PaneExpansionAnchor[]) {
    this.anchors = [...anchors];
    if (this.currentAnchorState !== null) {
      this.currentAnchorState =
        this.anchors.find((anchor) => anchorEquals(anchor, this.currentAnchorState!)) ?? null;
    }
    if (this.maxExpansionWidth !== PaneExpansionUnspecified && this.currentAnchorState !== null) {
      const offset = anchorPosition(
        this.currentAnchorState,
        this.maxExpansionWidth,
        this.measuredDirection,
      );
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    }
    this.notify();
  }

  setConsumeDragDelta(consumeDragDelta: (delta: number) => number) {
    this.consumeDragDelta = consumeDragDelta;
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
    if (this.dragging) return;
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
    const remainingDelta = this.consumeDragDelta(delta);
    const nextOffset = clamp(
      Math.trunc(this.currentMeasuredDraggingOffset + remainingDelta),
      0,
      this.maxExpansionWidth,
    );
    if (nextOffset === this.currentDraggingOffsetState) return;
    this.currentDraggingOffsetState = nextOffset;
    this.currentMeasuredDraggingOffset = nextOffset;
    this.notify();
  }

  endDrag(velocity = 0) {
    if (this.dragging) {
      this.dragging = false;
      this.notify();
    }
    this.settleToAnchorIfNeeded(velocity);
  }

  snapToAnchor(anchor: PaneExpansionAnchor) {
    const matched = this.anchors.find((candidate) => anchorEquals(candidate, anchor));
    if (matched === undefined) {
      throw new RangeError('The provided anchor is not in the anchor list');
    }
    this.currentAnchorState = matched;
    if (this.maxExpansionWidth !== PaneExpansionUnspecified) {
      const offset = anchorPosition(matched, this.maxExpansionWidth, this.measuredDirection);
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    }
    this.notify();
  }

  moveToNextAnchor() {
    const anchor = this.nextAnchor;
    if (anchor !== null) this.snapToAnchor(anchor);
  }

  settleToAnchorIfNeeded(velocity: number) {
    if (
      this.anchors.length === 0 ||
      this.maxExpansionWidth === PaneExpansionUnspecified ||
      this.currentMeasuredDraggingOffset === PaneExpansionUnspecified
    ) {
      return;
    }

    this.settling = true;
    const currentPosition = this.currentMeasuredDraggingOffset;
    let bestAnchor = this.anchors[0];
    let bestScore = Number.POSITIVE_INFINITY;

    for (const anchor of this.anchors) {
      const position = anchorPosition(anchor, this.maxExpansionWidth, this.measuredDirection);
      let score: number;
      if (velocity >= AnchoringVelocityThreshold) {
        const delta = position - currentPosition;
        score = delta < 0 ? this.maxExpansionWidth - delta : delta;
      } else if (velocity <= -AnchoringVelocityThreshold) {
        const delta = currentPosition - position;
        score = delta < 0 ? this.maxExpansionWidth - delta : delta;
      } else {
        score = Math.abs(currentPosition - position);
      }
      if (score < bestScore) {
        bestScore = score;
        bestAnchor = anchor;
      }
    }

    this.currentAnchorState = bestAnchor ?? null;
    if (bestAnchor !== undefined) {
      const offset = anchorPosition(bestAnchor, this.maxExpansionWidth, this.measuredDirection);
      this.currentDraggingOffsetState = offset;
      this.currentMeasuredDraggingOffset = offset;
    }
    this.settling = false;
    this.notify();
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
