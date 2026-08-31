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
const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function finiteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function composeRoundToPx(value: number) {
  const floatValue = Math.fround(value);
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.round(floatValue);
}

function composeFloatToInt(value: number) {
  if (Number.isNaN(value)) return 0;
  if (value >= ComposeIntMax) return ComposeIntMax;
  if (value <= ComposeIntMin) return ComposeIntMin;
  return Math.trunc(value);
}

function resolvedConstraint(value: number | undefined, unspecified: number) {
  // AndroidX Dp.Unspecified is NaN and fails isSpecified. Undefined is the
  // normal web representation, but preserve NaN as the same unspecified case.
  return value === undefined || Number.isNaN(value) ? unspecified : composeRoundToPx(value);
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
  private readonly animationControllers = new Set<AbortController>();

  constructor({
    dockedEdge,
    minSize,
    maxSize,
    animation = defaultDragToResizeAnimation,
  }: DragToResizeStateOptions) {
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

  private cancelAnimations() {
    this.animationControllers.forEach((controller) => controller.abort());
    this.animationControllers.clear();
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
    this.minSize = minSize;
    this.notify();
  }

  setMaxSize(maxSize?: number) {
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
   * Measure/re-coerce the resizable axis and return the raw pane size used by
   * AndroidX for levitated alignment before PaneMeasurable clamps measurement
   * bounds to non-negative dimensions. Before the scaffold has a real
   * resizable-axis constraint, no drag override is available yet.
   */
  measure({
    measuringWidth,
    measuringHeight,
    scaffoldWidth,
    scaffoldHeight,
    direction = 'ltr',
  }: DragToResizeMeasurement): DragToResizeSize | undefined {
    finiteNonNegative(measuringWidth, 'measuringWidth');
    finiteNonNegative(measuringHeight, 'measuringHeight');
    finiteNonNegative(scaffoldWidth, 'scaffoldWidth');
    finiteNonNegative(scaffoldHeight, 'scaffoldHeight');

    const horizontal = this.orientation === 'horizontal';
    const measuringSize = horizontal ? measuringWidth : measuringHeight;
    const scaffoldSize = horizontal ? scaffoldWidth : scaffoldHeight;

    // React can render once before the scaffold has measurable geometry. Do not
    // let that transient zero constraint initialize or coerce persistent resize
    // state, and do not expose it as a measured preferred-size override.
    if (scaffoldSize === 0) {
      return undefined;
    }

    const minimum = resolvedConstraint(this.minSize, DefaultMinPaneSize);
    const maximum = Math.min(
      resolvedConstraint(this.maxSize, ComposeIntMax),
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

    // AndroidX keeps the state size as Float for drag/spring physics and uses
    // Float.toInt() for the raw IntSize that participates in alignment.
    const resolvedSize = composeFloatToInt(this.sizeInternal);
    // Direction is intentionally consumed here so callers can use one measure
    // path for logical Start/End states before dispatching drag deltas.
    void direction;

    return horizontal
      ? { width: resolvedSize, height: measuringHeight }
      : { width: measuringWidth, height: resolvedSize };
  }

  dispatchRawDelta(delta: number, direction: 'ltr' | 'rtl' = 'ltr') {
    // AndroidX only ignores a drag while the state itself is still NaN. Raw
    // deltas then flow through the Float range setter without extra validation.
    if (Number.isNaN(this.sizeInternal)) return;
    const actualDelta = this.convertDelta(delta, direction);
    this.valueInternal = DragToResizeValue.Dragged;
    this.setSize(this.sizeInternal + actualDelta);
    this.lastDraggedSize = this.sizeInternal;
    this.notify();
  }

  /** Snap immediately to a target and cancel any active click-to-resize motion. */
  snapTo(target: DragToResizeValue) {
    if (this.valueInternal === target || Number.isNaN(this.sizeInternal)) return;
    this.cancelAnimations();
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

    const sourceValue = this.valueInternal;
    const targetSize = this.targetSize(target);
    if (sourceValue === DragToResizeValue.Default) {
      this.setSize(targetSize);
      this.valueInternal = target;
      this.notify();
      return;
    }

    const controller = new AbortController();
    this.animationControllers.add(controller);
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
          this.setSize(size);
          this.notify();
        },
      });
      if (controller.signal.aborted) return;
      this.setSize(targetSize);
    } finally {
      this.animationControllers.delete(controller);
      this.notify();
    }
  }

  moveToNextState() {
    void this.animateTo(this.nextValue);
  }
}
