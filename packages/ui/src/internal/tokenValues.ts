export function pxNumber(value: string): number {
  if (!value.endsWith('px')) throw new Error(`Expected px token, received ${value}`);
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid px token: ${value}`);
  return parsed;
}

export function msNumber(value: string): number {
  if (!value.endsWith('ms')) throw new Error(`Expected ms token, received ${value}`);
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ms token: ${value}`);
  return parsed;
}
