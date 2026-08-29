import {
  calculateDragToResizeSpringDurationMs,
  sampleDragToResizeSpring,
} from './dragToResizeSpring';

export type DockedEdge = 'top' | 'bottom' | 'start' | 'end';

export const DockedEdge = {
  Top: 'top',
  Bottom: 'bottom',
  Start: 'start',
  End: 'end',
} as const satisfies Record<string, DockedEdge>;

export type DragToResizeValue = 'expanded' | 'collapsed' | 'dragged' | 'default';

export const DragToResizeValue = {
  Expanded: 'expanded',
  Collapsed: 'collapsed',
  Dragged: 'dragged',
  Default: 'default',
} as const satisfies Record<string, DragToResizeValue>;

export interface DragToResizeAnimationContext {
  from: number;
  to: number;
  signal: AbortSignal;
  update: (size: number) => void;
}

export type DragToResizeAnimation = (
  context: DragToResizeAnimationContext,
) => Promise<void>;

export interface DragToResizeStateOptions {
  dockedEdge: DockedEdge;
  /** CSS pixel equivalent of AndroidX minSize. Unspecified defaults to 48dp. */
  minSize?: number;
  /** CSS pixel equivalent of AndroidX maxSize. Unspecified is scaffold-bounded. */
  maxSize?: number;
  /** Web animation driver used for non-default click-to-resize state changes. */
  animation?: DragToResizeAnimation;
}

export interface DragToResizeMeasurement {
  measuringWidth: number;
  measuringHeight: number;
  scaffoldWidth: number;
  scaffoldHeight: number;
  direction?: 'ltr' | 'rtl';
}

export interface DragToResizeSize {
  width: number;
  height: number;
}

const DefaultMinPaneSize = 48;

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
 * Browser driver for the default animation-core spring used by AndroidX
 * DragToResizeState.animateTo. The physics sampler mirrors FloatSpringSpec's
 * whole-millisecond precision and snaps to target at its estimated duration.
 */
export const defaultDragToResizeAnimation: DragToResizeAnimation = ({
  from,
  to,
  signal,
  update,
}) =>
  new Promise<void>((resolve) => {
    const durationMs = calculateDragToResizeSpringDurationMs(from, to);
    if (signal.aborted || from === to || durationMs === 0) {
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
      update(sampleDragToResizeSpring(from, to, elapsed));
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
 * Web state port of AndroidX DragToResizeState.
 *
 * Pointer deltas stay synchronous. Click/semantic state changes follow the
 * pinned AndroidX behavior: Default -> Expanded snaps immediately, while
 * transitions from Expanded, Collapsed, or Dragged use animation-core's
 * default critically-damped spring.
 */
export class DragToResizeState {
  readonly dockedEdge: DockedEdge;

  private minSize: number | undefined;
  private maxSize: number | undefined;
  private sizeInternal = Number.NaN;
  private valueInternal: DragToResizeValue = DragToResizeValue.Default;
  private rangeStart = 0;
  private rangeEnd = 0;
  private rangeIsEmpty = false;
  private lastMeasuredSize = Number.NaN;
  private lastDraggedSize = Number.NaN;
  private revision = 0;
  private readonly listeners = new Set<() => void>();
  private readonly defaultAnimation: DragToResizeAnimation;
  private animationController: AbortController | null = null;

  constructor({
    dockedEdge,
    minSize,
    maxSize,
    animation = defaultDragToResizeAnimation,
  }: DragToResizeStateOptions) {
    if (minSize !== undefined) finiteNonNegative(minSize, 'minSize');
    if (maxSize !== undefined) finiteNonNegative(maxSize, 'maxSize');
    this.dockedEdge = dockedEdge;
    this.minSize = minSize;
    this.maxSize = maxSize;
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
    this.animationController?.abort();
    this.animationController = null;
  }

  get value() {
    return this.valueInternal;
  }

  get size() {
    return this.sizeInternal;
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this.dockedEdge === DockedEdge.Start || this.dockedEdge === DockedEdge.End
      ? 'horizontal'
      : 'vertical';
  }

  get nextValue(): DragToResizeValue {
    if (this.valueInternal === DragToResizeValue.Expanded) {
      return DragToResizeValue.Collapsed;
    }
    if (this.valueInternal === DragToResizeValue.Collapsed) {
      return DragToResizeValue.Default;
    }
    return DragToResizeValue.Expanded;
  }

  setMinSize(minSize?: number) {
    if (minSize !== undefined) finiteNonNegative(minSize, 'minSize');
    this.minSize = minSize;
    this.notify();
  }

  setMaxSize(maxSize?: number) {
    if (maxSize !== undefined) finiteNonNegative(maxSize, 'maxSize');
    this.maxSize = maxSize;
    this.notify();
  }

  private physicalEdge(direction: 'ltr' | 'rtl'): 'top' | 'bottom' | 'left' | 'right' {
    switch (this.dockedEdge) {
      case DockedEdge.Top:
        return 'top';
      case DockedEdge.Bottom:
        return 'bottom';
      case DockedEdge.Start:
        return direction === 'ltr' ? 'left' : 'right';
      case DockedEdge.End:
        return direction === 'ltr' ? 'right' : 'left';
    }
  }

  private convertDelta(delta: number, direction: 'ltr' | 'rtl') {
    const edge = this.physicalEdge(direction);
    return edge === 'right' || edge === 'bottom' ? -delta : delta;
  }

  private setSize(value: number) {
    if (this.animationController !== null) {
      this.setAnimatedSize(value);
      return;
    }
    if (!this.rangeIsEmpty) {
      if (value <= this.rangeStart) {
        this.valueInternal = DragToResizeValue.Collapsed;
        this.sizeInternal = this.rangeStart;
        return;
      }
      if (value >= this.rangeEnd) {
        this.valueInternal = DragToResizeValue.Expanded;
        this.sizeInternal = this.rangeEnd;
        return;
      }
    }
    this.sizeInternal = value;
  }

  private setAnimatedSize(value: number) {
    this.sizeInternal = this.rangeIsEmpty
      ? value
      : clamp(value, this.rangeStart, this.rangeEnd);
  }

  private get defaultSize() {
    return Number.isNaN(this.lastDraggedSize) ? this.lastMeasuredSize : this.lastDraggedSize;
  }

  private targetSize(target: DragToResizeValue) {
    if (target === DragToResizeValue.Expanded) return this.rangeEnd;
    if (target === DragToResizeValue.Collapsed) return this.rangeStart;
    if (target === DragToResizeValue.Default) return this.defaultSize;
    return this.sizeInternal;
  }

  /**
   * Measure/re-coerce the resizable axis and return the pane size for layout.
   * This mirrors AndroidX getDraggedWidth/getDraggedHeight.
   */
  measure({
    measuringWidth,
    measuringHeight,
    scaffoldWidth,
    scaffoldHeight,
    direction = 'ltr',
  }: DragToResizeMeasurement): DragToResizeSize {
    finiteNonNegative(measuringWidth, 'measuringWidth');
    finiteNonNegative(measuringHeight, 'measuringHeight');
    finiteNonNegative(scaffoldWidth, 'scaffoldWidth');
    finiteNonNegative(scaffoldHeight, 'scaffoldHeight');

    const horizontal = this.orientation === 'horizontal';
    const measuringSize = horizontal ? measuringWidth : measuringHeight;
    const scaffoldSize = horizontal ? scaffoldWidth : scaffoldHeight;

    // React can render once before the scaffold has measurable geometry. Do not
    // let that transient zero constraint initialize or coerce persistent resize
    // state; AndroidX receives real layout constraints when this state measures.
    if (scaffoldSize === 0) {
      return { width: measuringWidth, height: measuringHeight };
    }

    // rememberDragToResizeState resolves specified Dp constraints with
    // roundToPx() before getDraggedWidth/getDraggedHeight builds the Float
    // range. Keep drag/spring physics as Float, but quantize these constraints
    // at the same measurement boundary.
    const minimum = this.minSize === undefined ? DefaultMinPaneSize : Math.round(this.minSize);
    const maximum = Math.min(
      this.maxSize === undefined ? Number.POSITIVE_INFINITY : Math.round(this.maxSize),
      scaffoldSize,
    );

    this.rangeStart = minimum;
    this.rangeEnd = maximum;
    this.rangeIsEmpty = minimum > maximum;
    this.lastMeasuredSize = measuringSize;

    const nextSize = Number.isNaN(this.sizeInternal)
      ? this.targetSize(this.valueInternal)
      : this.sizeInternal;
    this.setSize(nextSize);

    // AndroidX keeps the state size as Float for drag/spring physics but returns
    // size.toInt() from getAndUpdateDraggedSize for actual pane measurement.
    const resolvedSize = Math.trunc(this.sizeInternal);
    // Direction is intentionally consumed here so callers can use one measure
    // path for logical Start/End states before dispatching drag deltas.
    void direction;

    return horizontal
      ? { width: resolvedSize, height: measuringHeight }
      : { width: measuringWidth, height: resolvedSize };
  }

  dispatchRawDelta(delta: number, direction: 'ltr' | 'rtl' = 'ltr') {
    if (!Number.isFinite(delta) || Number.isNaN(this.sizeInternal)) return;
    this.cancelAnimation();
    const actualDelta = this.convertDelta(delta, direction);
    this.valueInternal = DragToResizeValue.Dragged;
    this.setSize(this.sizeInternal + actualDelta);
    this.lastDraggedSize = this.sizeInternal;
    this.notify();
  }

  /** Snap immediately to a target and cancel any active click-to-resize motion. */
  snapTo(target: DragToResizeValue) {
    if (this.valueInternal === target || Number.isNaN(this.sizeInternal)) return;
    this.cancelAnimation();
    this.setSize(this.targetSize(target));
    this.valueInternal = target;
    this.notify();
  }

  /** AndroidX DragToResizeState.animateTo analogue. */
  async animateTo(
    target: DragToResizeValue,
    animation: DragToResizeAnimation = this.defaultAnimation,
  ) {
    if (this.valueInternal === target || Number.isNaN(this.sizeInternal)) return;
    this.cancelAnimation();

    const sourceValue = this.valueInternal;
    const targetSize = this.targetSize(target);
    if (sourceValue === DragToResizeValue.Default) {
      this.setSize(targetSize);
      this.valueInternal = target;
      this.notify();
      return;
    }

    const controller = new AbortController();
    this.animationController = controller;
    const from = this.sizeInternal;
    this.valueInternal = target;
    this.notify();

    try {
      await animation({
        from,
        to: targetSize,
        signal: controller.signal,
        update: (size) => {
          if (controller.signal.aborted) return;
          this.setAnimatedSize(size);
          this.notify();
        },
      });
      if (controller.signal.aborted) return;
      this.setAnimatedSize(targetSize);
      this.valueInternal = target;
    } finally {
      if (this.animationController === controller) {
        this.animationController = null;
        this.notify();
      }
    }
  }

  moveToNextState() {
    void this.animateTo(this.nextValue);
  }
}
