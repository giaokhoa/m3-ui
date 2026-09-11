export function normalizeScrollFieldIndex(index: number, itemCount: number): number {
  if (!Number.isFinite(itemCount) || itemCount <= 0) return 0;
  const count = Math.floor(itemCount);
  return ((Math.trunc(index) % count) + count) % count;
}

export function settleScrollFieldSteps(offset: number, itemExtent: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(itemExtent) || itemExtent <= 0) return 0;
  return Math.round(offset / itemExtent);
}

export function clampScrollFieldDrag(offset: number, itemExtent: number): number {
  if (!Number.isFinite(offset) || !Number.isFinite(itemExtent) || itemExtent <= 0) return 0;
  return Math.max(-itemExtent * 2, Math.min(itemExtent * 2, offset));
}
