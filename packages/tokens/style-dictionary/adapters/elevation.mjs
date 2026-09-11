import {
  cssValue,
  defineCssAdapter,
  percent,
  tokenReader,
} from '../adapter-helpers.mjs';

const levels = ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'];
const layers = ['layer1', 'layer2', 'layer3'];

export function createElevationCss(context) {
  const get = tokenReader(context, 'Elevation CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shadowLayer = (level, layer) => {
    const prefix = `elevation.shadow.${level}.${layer}`;
    return [
      get(`${prefix}.offsetX`),
      get(`${prefix}.offsetY`),
      get(`${prefix}.blurRadius`),
      get(`${prefix}.spreadRadius`),
      `color-mix(in srgb, var(--_elevation-shadow-color) ${percent(get(`${prefix}.opacity`))}, transparent)`,
    ].join(' ');
  };
  const shadow = (level) =>
    level === 'level0'
      ? 'none'
      : layers.map((layer) => shadowLayer(level, layer)).join(', ');
  const levelRules = levels.flatMap((level) => [
    '',
    `.elevation[data-elevation='${level}'], .elevation-host[data-elevation='${level}'] {`,
    line('--_elevation-box-shadow', shadow(level)),
    '}',
  ]);
  return [
    '.elevation, .elevation-host {',
    line('--_elevation-shadow-color', 'var(--shadow)'),
    line('--_elevation-box-shadow', 'none'),
    '}',
    ...levelRules,
    '',
  ].join('\n');
}

export default defineCssAdapter('elevation', createElevationCss);
