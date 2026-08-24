const TAU = Math.PI * 2;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function progressFraction(
  value: number | undefined,
  minValue = 0,
  maxValue = 1,
): number {
  const min = Number.isFinite(minValue) ? minValue : 0;
  const max = Number.isFinite(maxValue) ? maxValue : 1;
  if (max <= min) return 0;
  const current = Number.isFinite(value) ? (value as number) : min;
  return clamp01((current - min) / (max - min));
}

export function defaultWavyAmplitude(progress: number): number {
  const fraction = clamp01(progress);
  return fraction <= 0.1 || fraction >= 0.95 ? 0 : 1;
}

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}

export function buildLinearWavePath(
  width: number,
  height: number,
  amplitude: number,
  wavelength: number,
  overscan = 0,
): string {
  const resolvedWidth = Math.max(0, width);
  const middle = height / 2;
  const resolvedAmplitude = Math.max(0, amplitude);
  const resolvedWavelength = Math.max(0, wavelength);
  if (resolvedWidth === 0) return '';
  if (resolvedAmplitude === 0 || resolvedWavelength === 0) {
    return `M ${format(-overscan)} ${format(middle)} L ${format(resolvedWidth + overscan)} ${format(middle)}`;
  }

  const start = -Math.max(0, overscan);
  const end = resolvedWidth + Math.max(0, overscan);
  const step = Math.max(0.75, Math.min(2, resolvedWavelength / 12));
  const points: string[] = [];
  for (let x = start; x < end; x += step) {
    const y = middle - resolvedAmplitude * Math.sin((TAU * x) / resolvedWavelength);
    points.push(`${format(x)} ${format(y)}`);
  }
  const endY = middle - resolvedAmplitude * Math.sin((TAU * end) / resolvedWavelength);
  points.push(`${format(end)} ${format(endY)}`);
  return `M ${points.join(' L ')}`;
}

export function buildCircularWavePath(
  size: number,
  strokeWidth: number,
  amplitude: number,
  wavelength: number,
  startFraction = 0,
  endFraction = 1,
  phase = 0,
): string {
  const start = clamp01(startFraction);
  const end = clamp01(endFraction);
  if (end <= start || size <= 0) return '';

  const center = size / 2;
  const baseRadius = Math.max(0, (size - strokeWidth) / 2 - Math.max(0, amplitude));
  const circumference = TAU * Math.max(baseRadius, 1);
  const waveCount = Math.max(1, Math.round(circumference / Math.max(1, wavelength)));
  const span = end - start;
  const segments = Math.max(12, Math.ceil(160 * span));
  const points: string[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const fraction = start + (span * index) / segments;
    const angle = TAU * fraction;
    const radius = baseRadius + amplitude * Math.sin(waveCount * angle + phase);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push(`${format(x)} ${format(y)}`);
  }

  return `M ${points.join(' L ')}`;
}
