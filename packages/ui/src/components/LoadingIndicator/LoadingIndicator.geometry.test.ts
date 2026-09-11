import { describe, expect, it } from 'vitest';
import {
  calculateScaleFactor,
  clampProgress,
  determinateLoadingPolygons,
  indeterminateLoadingPolygons,
  loadingMaterialShapes,
  morphSequence,
  processedMorphPath,
} from './LoadingIndicator.geometry';

describe('Material 3 Loading Indicator geometry', () => {
  it('keeps the current Material shape sequences', () => {
    expect(determinateLoadingPolygons).toHaveLength(2);
    expect(indeterminateLoadingPolygons).toHaveLength(7);
    expect(indeterminateLoadingPolygons).toEqual([
      loadingMaterialShapes.softBurst,
      loadingMaterialShapes.cookie9Sided,
      loadingMaterialShapes.pentagon,
      loadingMaterialShapes.pill,
      loadingMaterialShapes.sunny,
      loadingMaterialShapes.cookie4Sided,
      loadingMaterialShapes.oval,
    ]);
  });

  it('builds one determinate morph and a circular seven-morph sequence', () => {
    expect(morphSequence(determinateLoadingPolygons, false)).toHaveLength(1);
    expect(morphSequence(indeterminateLoadingPolygons, true)).toHaveLength(7);
  });

  it('keeps all normalized shape bounds finite', () => {
    for (const polygon of [
      ...determinateLoadingPolygons,
      ...indeterminateLoadingPolygons,
    ]) {
      const bounds = polygon.calculateBounds([0, 0, 0, 0], false);
      expect(bounds).toHaveLength(4);
      expect(bounds.every(Number.isFinite)).toBe(true);
      expect(bounds[2]).toBeGreaterThan(bounds[0]);
      expect(bounds[3]).toBeGreaterThan(bounds[1]);
    }
  });

  it('computes a finite anti-clipping scale factor', () => {
    const determinate = calculateScaleFactor(determinateLoadingPolygons);
    const indeterminate = calculateScaleFactor(indeterminateLoadingPolygons);
    expect(determinate).toBeGreaterThan(0);
    expect(determinate).toBeLessThanOrEqual(1);
    expect(indeterminate).toBeGreaterThan(0);
    expect(indeterminate).toBeLessThanOrEqual(1);
  });

  it('renders stable finite SVG paths at representative morph progress', () => {
    const morph = morphSequence(determinateLoadingPolygons, false)[0];
    const scale = calculateScaleFactor(determinateLoadingPolygons) * (38 / 48);
    const start = processedMorphPath(morph, 0, 48, scale);
    const middle = processedMorphPath(morph, 0.5, 48, scale);
    const end = processedMorphPath(morph, 1, 48, scale);

    for (const path of [start, middle, end]) {
      expect(path.startsWith('M')).toBe(true);
      expect(path.endsWith('Z')).toBe(true);
      expect(path).not.toMatch(/NaN|Infinity/);
    }
    expect(new Set([start, middle, end]).size).toBe(3);
  });

  it('coerces determinate progress like Compose', () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(2)).toBe(1);
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});
