export function pxNumber(value: string): number {
  if (!value.endsWith('px')) throw new Error(`Expected px token, received ${value}`);
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid px token: ${value}`);
  return number;
}

export function msNumber(value: string): number {
  if (!value.endsWith('ms')) throw new Error(`Expected ms token, received ${value}`);
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid ms token: ${value}`);
  return number;
}

/** Compatibility adapter for legacy role-based facades. Canonical/generated colors stay as CSS var() strings. */
export function colorRole(value: string): string {
  if (value === 'transparent') return value;
  const match = value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (!match) throw new Error(`Expected runtime color variable, received ${value}`);
  return match[1].replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}
