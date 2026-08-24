import { CornerRounding } from '../../internal/material-shapes/CornerRounding';
import { Matrix } from '../../internal/material-shapes/Matrix';
import { Morph } from '../../internal/material-shapes/Morph';
import { Offset } from '../../internal/material-shapes/Offset';
import { Path } from '../../internal/material-shapes/Path';
import { RoundedPolygon } from '../../internal/material-shapes/RoundedPolygon';
import type { Cubic } from '../../internal/material-shapes/Cubic';

interface PointNRound {
  point: Offset;
  rounding: CornerRounding;
}

const center = new Offset(0.5, 0.5);
const cornerRound15 = new CornerRounding(0.15);
const cornerRound50 = new CornerRounding(0.5);

function point(
  x: number,
  y: number,
  radius = 0,
  smoothing = 0,
): PointNRound {
  return { point: new Offset(x, y), rounding: new CornerRounding(radius, smoothing) };
}

function rotatePoint(source: Offset, angle: number, origin = center): Offset {
  const radians = (angle * Math.PI) / 180;
  const x = source.x - origin.x;
  const y = source.y - origin.y;
  return new Offset(
    x * Math.cos(radians) - y * Math.sin(radians) + origin.x,
    x * Math.sin(radians) + y * Math.cos(radians) + origin.y,
  );
}

function repeatPoints(
  points: PointNRound[],
  reps: number,
  mirroring = false,
  origin = center,
): PointNRound[] {
  if (!mirroring) {
    return Array.from({ length: points.length * reps }, (_, index) => {
      const rep = Math.floor(index / points.length);
      const source = points[index % points.length];
      return {
        point: rotatePoint(source.point, (rep * 360) / reps, origin),
        rounding: source.rounding,
      };
    });
  }

  const angles = points.map((entry) =>
    Math.atan2(entry.point.y - origin.y, entry.point.x - origin.x),
  );
  const distances = points.map((entry) =>
    Math.hypot(entry.point.x - origin.x, entry.point.y - origin.y),
  );
  const actualReps = reps * 2;
  const sectionAngle = (2 * Math.PI) / actualReps;
  const result: PointNRound[] = [];

  for (let i = 0; i < actualReps; i += 1) {
    points.forEach((_, index) => {
      const j = i % 2 === 0 ? index : points.length - 1 - index;
      if (j > 0 || i % 2 === 0) {
        const angle =
          sectionAngle * i +
          (i % 2 === 0
            ? angles[j]
            : sectionAngle - angles[j] + 2 * angles[0]);
        result.push({
          point: new Offset(
            Math.cos(angle) * distances[j] + origin.x,
            Math.sin(angle) * distances[j] + origin.y,
          ),
          rounding: points[j].rounding,
        });
      }
    });
  }

  return result;
}

function customPolygon(
  points: PointNRound[],
  reps: number,
  mirroring = false,
): RoundedPolygon {
  const repeated = repeatPoints(points, reps, mirroring);
  return RoundedPolygon.createFromVertices(
    repeated.flatMap((entry) => [entry.point.x, entry.point.y]),
    CornerRounding.Unrounded,
    repeated.map((entry) => entry.rounding),
    center.x,
    center.y,
  );
}

function rawCircle(numVertices = 8): RoundedPolygon {
  const theta = Math.PI / numVertices;
  const polygonRadius = 1 / Math.cos(theta);
  return RoundedPolygon.createFromNumVertices(
    numVertices,
    polygonRadius,
    0,
    0,
    new CornerRounding(1),
  );
}

function rawStar(
  verticesPerRadius: number,
  innerRadius: number,
  rounding: CornerRounding,
): RoundedPolygon {
  const vertices: number[] = [];
  for (let i = 0; i < verticesPerRadius; i += 1) {
    const outerAngle = (Math.PI * 2 * i) / verticesPerRadius;
    vertices.push(Math.cos(outerAngle), Math.sin(outerAngle));
    const innerAngle = (Math.PI * (2 * i + 1)) / verticesPerRadius;
    vertices.push(
      Math.cos(innerAngle) * innerRadius,
      Math.sin(innerAngle) * innerRadius,
    );
  }
  return RoundedPolygon.createFromVertices(vertices, rounding, undefined, 0, 0);
}

const rotateNegative45 = new Matrix().rotateZ(-45);
const rotateNegative90 = new Matrix().rotateZ(-90);

export const loadingMaterialShapes = {
  circle: rawCircle(10).normalized(),
  softBurst: customPolygon(
    [point(0.193, 0.277, 0.053), point(0.176, 0.055, 0.053)],
    10,
  ).normalized(),
  cookie9Sided: rawStar(9, 0.8, cornerRound50)
    .transformed(rotateNegative90)
    .normalized(),
  pentagon: customPolygon(
    [
      point(0.5, -0.009, 0.172),
      point(1.03, 0.365, 0.164),
      point(0.828, 0.97, 0.169),
    ],
    1,
    true,
  ).normalized(),
  pill: customPolygon(
    [
      point(0.961, 0.039, 0.426),
      point(1.001, 0.428),
      point(1, 0.609, 1),
    ],
    2,
    true,
  ).normalized(),
  sunny: rawStar(8, 0.8, cornerRound15).normalized(),
  cookie4Sided: customPolygon(
    [point(1.237, 1.236, 0.258), point(0.5, 0.918, 0.233)],
    4,
  ).normalized(),
  oval: rawCircle()
    .transformed(new Matrix().scale(1, 0.64))
    .transformed(rotateNegative45)
    .normalized(),
} as const;

export const determinateLoadingPolygons = [
  loadingMaterialShapes.circle.transformed(new Matrix().rotateZ(18)),
  loadingMaterialShapes.softBurst,
] as const;

export const indeterminateLoadingPolygons = [
  loadingMaterialShapes.softBurst,
  loadingMaterialShapes.cookie9Sided,
  loadingMaterialShapes.pentagon,
  loadingMaterialShapes.pill,
  loadingMaterialShapes.sunny,
  loadingMaterialShapes.cookie4Sided,
  loadingMaterialShapes.oval,
] as const;

export function morphSequence(
  polygons: readonly RoundedPolygon[],
  circular: boolean,
): Morph[] {
  const result: Morph[] = [];
  for (let i = 0; i < polygons.length; i += 1) {
    if (i + 1 < polygons.length) {
      result.push(new Morph(polygons[i].normalized(), polygons[i + 1].normalized()));
    } else if (circular) {
      result.push(new Morph(polygons[i].normalized(), polygons[0].normalized()));
    }
  }
  return result;
}

export function calculateScaleFactor(polygons: readonly RoundedPolygon[]): number {
  let scaleFactor = 1;
  for (const polygon of polygons) {
    const bounds = polygon.calculateBounds();
    const maxBounds = polygon.calculateMaxBounds();
    const width = bounds[2] - bounds[0];
    const height = bounds[3] - bounds[1];
    const maxWidth = maxBounds[2] - maxBounds[0];
    const maxHeight = maxBounds[3] - maxBounds[1];
    const scaleX = maxWidth > 0 ? width / maxWidth : 1;
    const scaleY = maxHeight > 0 ? height / maxHeight : 1;
    scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY));
  }
  return scaleFactor;
}

function cubicBounds(cubics: readonly Cubic[]): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const bounds = [0, 0, 0, 0];
  for (const cubic of cubics) {
    cubic.calculateBounds(bounds, false);
    minX = Math.min(minX, bounds[0]);
    minY = Math.min(minY, bounds[1]);
    maxX = Math.max(maxX, bounds[2]);
    maxY = Math.max(maxY, bounds[3]);
  }
  return [minX, minY, maxX, maxY];
}

export function processedMorphPath(
  morph: Morph,
  progress: number,
  size: number,
  scaleFactor: number,
): string {
  const cubics = morph.asCubics(progress);
  if (cubics.length === 0) return '';

  const [minX, minY, maxX, maxY] = cubicBounds(cubics);
  const scale = size * scaleFactor;
  const dx = size / 2 - ((minX + maxX) / 2) * scale;
  const dy = size / 2 - ((minY + maxY) / 2) * scale;
  const tx = (value: number) => value * scale + dx;
  const ty = (value: number) => value * scale + dy;
  const path = new Path();
  path.moveTo(tx(cubics[0].anchor0X), ty(cubics[0].anchor0Y));
  for (const cubic of cubics) {
    path.cubicTo(
      tx(cubic.control0X),
      ty(cubic.control0Y),
      tx(cubic.control1X),
      ty(cubic.control1Y),
      tx(cubic.anchor1X),
      ty(cubic.anchor1Y),
    );
  }
  path.close();
  return path.toSvgPathData();
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function springMorphProgress(elapsedMs: number): number {
  const seconds = Math.max(0, elapsedMs) / 1000;
  const dampingRatio = 0.6;
  const stiffness = 200;
  const naturalFrequency = Math.sqrt(stiffness);
  const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatio ** 2);
  const envelope = Math.exp(-dampingRatio * naturalFrequency * seconds);
  return (
    1 -
    envelope *
      (Math.cos(dampedFrequency * seconds) +
        ((dampingRatio * naturalFrequency) / dampedFrequency) *
          Math.sin(dampedFrequency * seconds))
  );
}
