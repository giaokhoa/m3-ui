import { elevationShadowLayers, type ElevationLevel, type ElevationShadowLayer } from '@m3/tokens/elevation';

const defaultShadowColor = 'var(--shadow)';

function toShadowLayer(layer: ElevationShadowLayer, color: string): string {
  const opacityPercent = layer.opacity * 100;

  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blurRadius}px ${layer.spreadRadius}px color-mix(in srgb, ${color} ${opacityPercent}%, transparent)`;
}

export function getElevationBoxShadow(
  level: ElevationLevel,
  color = defaultShadowColor,
): string {
  return elevationShadowLayers[level]
    .map((layer) => toShadowLayer(layer, color))
    .join(', ');
}
