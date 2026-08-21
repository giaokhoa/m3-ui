export type RippleOrigin = 'press' | 'center';

export type RipplePointerType =
  | 'mouse'
  | 'pen'
  | 'touch'
  | 'keyboard'
  | 'virtual';

export interface RipplePressEvent {
  readonly pointerType: RipplePointerType;
  readonly target: Element;
  readonly x: number;
  readonly y: number;
}

export interface RippleWave {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly diameter: number;
  readonly isReleasing: boolean;
}
