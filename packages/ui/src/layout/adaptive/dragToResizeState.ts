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

export interface DragToResizeStateOptions {
  dockedEdge: DockedEdge;
  /** CSS pixel equivalent of AndroidX minSize. Unspecified defaults to 48dp. */
  minSize?: number;
  /** CSS pixel equivalent of AndroidX maxSize. Unspecified is scaffold-bounded. */
  maxSize?: number;
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

/**
 * Web state port of AndroidX DragToResizeState.
 *
 * The state keeps AndroidX size/state semantics while pointer ownership stays in
 * the React scaffold. Spring interpolation is deliberately left to the motion
 * slice; state changes snap to the same AndroidX target sizes synchronously.
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

  constructor({ dockedEdge, minSize, maxSize }: DragToResizeStateOptions) {
    if (minSize !== undefined) finiteNonNegative(minSize, 'minSize');
    if (maxSize !== undefined) finiteNonNegative(maxSize, 'maxSize');
    this.dockedEdge = dockedEdge;
    this.minSize = minSize;
    this.maxSize = maxSize;
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
    const minimum = this.minSize ?? DefaultMinPaneSize;
    const maximum = Math.min(this.maxSize ?? Number.POSITIVE_INFINITY, scaffoldSize);

    this.rangeStart = minimum;
    this.rangeEnd = maximum;
    this.rangeIsEmpty = minimum > maximum;
    this.lastMeasuredSize = measuringSize;

    const nextSize = Number.isNaN(this.sizeInternal)
      ? this.targetSize(this.valueInternal)
      : this.sizeInternal;
    this.setSize(nextSize);

    const resolvedSize = this.sizeInternal;
    // Direction is intentionally consumed here so callers can use one measure
    // path for logical Start/End states before dispatching drag deltas.
    void direction;

    return horizontal
      ? { width: resolvedSize, height: measuringHeight }
      : { width: measuringWidth, height: resolvedSize };
  }

  dispatchRawDelta(delta: number, direction: 'ltr' | 'rtl' = 'ltr') {
    if (!Number.isFinite(delta) || Number.isNaN(this.sizeInternal)) return;
    const actualDelta = this.convertDelta(delta, direction);
    this.valueInternal = DragToResizeValue.Dragged;
    this.setSize(this.sizeInternal + actualDelta);
    this.lastDraggedSize = this.sizeInternal;
    this.notify();
  }

  /** Synchronous target equivalent of AndroidX animateTo; interpolation is a later motion concern. */
  snapTo(target: DragToResizeValue) {
    if (this.valueInternal === target || Number.isNaN(this.sizeInternal)) return;
    this.setSize(this.targetSize(target));
    this.valueInternal = target;
    this.notify();
  }

  moveToNextState() {
    this.snapTo(this.nextValue);
  }
}
