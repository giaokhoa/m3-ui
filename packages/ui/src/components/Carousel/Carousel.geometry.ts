import { carouselDefaults } from './Carousel.defaults';

export type CarouselVariant = 'multi-browse' | 'uncontained' | 'centered-hero';

type CarouselAlignment = 'start' | 'center' | 'end';

export interface CarouselKeyline {
  size: number;
  offset: number;
  unadjustedOffset: number;
  isFocal: boolean;
}

export interface CarouselGeometry {
  itemMainAxisSize: number;
  keylines: CarouselKeyline[];
  availableSpace: number;
}

export interface CarouselItemGeometry {
  size: number;
  translation: number;
  isFocal: boolean;
}

export interface CarouselScrollGeometryOptions {
  maxScrollOffset?: number;
}

interface ArrangementResult {
  large: number;
  medium: number;
  small: number;
  largeCount: number;
  mediumCount: number;
  smallCount: number;
}

function emptyGeometry(availableSpace = 0): CarouselGeometry {
  return { itemMainAxisSize: 0, keylines: [], availableSpace };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fitArrangement(options: {
  availableSpace: number;
  itemSpacing: number;
  targetSmallSize: number;
  minSmallSize: number;
  maxSmallSize: number;
  smallCount: number;
  targetMediumSize: number;
  mediumCount: number;
  targetLargeSize: number;
  largeCount: number;
}): ArrangementResult {
  const {
    availableSpace,
    itemSpacing,
    targetSmallSize,
    minSmallSize,
    maxSmallSize,
    smallCount,
    targetMediumSize,
    mediumCount,
    targetLargeSize,
    largeCount,
  } = options;
  const totalItemCount = largeCount + mediumCount + smallCount;
  const availableWithoutSpacing = availableSpace - Math.max(0, totalItemCount - 1) * itemSpacing;
  let small = clamp(targetSmallSize, minSmallSize, maxSmallSize);
  let medium = targetMediumSize;
  let large = targetLargeSize;
  const totalSpaceTaken = large * largeCount + medium * mediumCount + small * smallCount;
  const delta = availableWithoutSpacing - totalSpaceTaken;

  if (smallCount > 0 && delta > 0) {
    small += Math.min(delta / smallCount, maxSmallSize - small);
  } else if (smallCount > 0 && delta < 0) {
    small += Math.max(delta / smallCount, minSmallSize - small);
  }
  if (smallCount === 0) small = 0;

  large = (
    availableWithoutSpacing - (smallCount + mediumCount / 2) * small
  ) / (largeCount + mediumCount / 2);
  medium = (large + small) / 2;

  if (mediumCount > 0 && large !== targetLargeSize) {
    const targetAdjustment = (targetLargeSize - large) * largeCount;
    const availableMediumFlex = medium * 0.1 * mediumCount;
    const distribute = Math.min(Math.abs(targetAdjustment), availableMediumFlex);
    if (targetAdjustment > 0) {
      medium -= distribute / mediumCount;
      large += distribute / largeCount;
    } else {
      medium += distribute / mediumCount;
      large -= distribute / largeCount;
    }
  }

  return { large, medium, small, largeCount, mediumCount, smallCount };
}

function arrangementIsValid(arrangement: ArrangementResult) {
  const { large, medium, small, largeCount, mediumCount, smallCount } = arrangement;
  if (largeCount > 0 && mediumCount > 0 && smallCount > 0) {
    return large > medium && medium > small;
  }
  if (largeCount > 0 && smallCount > 0) return large > small;
  return true;
}

function findLowestCostArrangement(options: {
  availableSpace: number;
  itemSpacing: number;
  targetSmallSize: number;
  minSmallSize: number;
  maxSmallSize: number;
  smallCounts: readonly number[];
  targetMediumSize: number;
  mediumCounts: readonly number[];
  targetLargeSize: number;
  largeCounts: readonly number[];
}): ArrangementResult | null {
  let best: ArrangementResult | null = null;
  let bestCost = Number.POSITIVE_INFINITY;
  let priority = 1;

  for (const largeCount of options.largeCounts) {
    for (const mediumCount of options.mediumCounts) {
      for (const smallCount of options.smallCounts) {
        const arrangement = fitArrangement({
          ...options,
          largeCount,
          mediumCount,
          smallCount,
        });
        const cost = arrangementIsValid(arrangement)
          ? Math.abs(options.targetLargeSize - arrangement.large) * priority
          : Number.POSITIVE_INFINITY;
        if (best === null || cost < bestCost) {
          best = arrangement;
          bestCost = cost;
          if (cost === 0) return best;
        }
        priority += 1;
      }
    }
  }
  return best;
}

function descendingCounts(max: number, min: number) {
  return Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => max - index);
}

function keylinesFromSizes(
  sizes: number[],
  availableSpace: number,
  itemSpacing: number,
  alignment: CarouselAlignment,
): CarouselGeometry {
  if (sizes.length === 0) return emptyGeometry(availableSpace);
  const max = Math.max(...sizes);
  const focalStart = sizes.findIndex((size) => size === max);
  const focalEnd = sizes.length - 1 - [...sizes].reverse().findIndex((size) => size === max);
  const focalDistance = focalEnd - focalStart;
  const itemSpacingSplit = itemSpacing === 0 || focalDistance % 2 === 0 ? 0 : itemSpacing / 2;
  const itemSpaceCounts = Math.floor(focalDistance / 2) * itemSpacing;
  const firstFocalOffset = alignment === 'center'
    ? availableSpace / 2 - (max / 2) * focalDistance - itemSpacingSplit - itemSpaceCounts
    : alignment === 'end'
      ? availableSpace - max / 2 - focalDistance * (max + itemSpacing)
      : max / 2;
  const offsets = new Array<number>(sizes.length);
  offsets[focalStart] = firstFocalOffset;
  for (let index = focalStart - 1; index >= 0; index -= 1) {
    offsets[index] = offsets[index + 1] - sizes[index + 1] / 2 - itemSpacing - sizes[index] / 2;
  }
  for (let index = focalStart + 1; index < sizes.length; index += 1) {
    offsets[index] = offsets[index - 1] + sizes[index - 1] / 2 + itemSpacing + sizes[index] / 2;
  }
  return {
    itemMainAxisSize: max,
    availableSpace,
    keylines: sizes.map((size, index) => ({
      size,
      offset: offsets[index],
      unadjustedOffset: firstFocalOffset + (index - focalStart) * (max + itemSpacing),
      isFocal: size === max,
    })),
  };
}

function multiBrowseGeometry(options: {
  availableSpace: number;
  itemCount: number;
  preferredItemWidth: number;
  itemSpacing: number;
  minSmallItemWidth: number;
  maxSmallItemWidth: number;
  anchor: number;
}): CarouselGeometry {
  const {
    availableSpace,
    itemCount,
    preferredItemWidth,
    itemSpacing,
    minSmallItemWidth,
    maxSmallItemWidth,
    anchor,
  } = options;
  if (preferredItemWidth <= 0) return emptyGeometry(availableSpace);
  const targetLargeSize = Math.min(preferredItemWidth, availableSpace);
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemWidth, maxSmallItemWidth);
  const targetMediumSize = (targetLargeSize + targetSmallSize) / 2;
  const smallCounts = availableSpace < minSmallItemWidth * 2 ? [0] : [1];
  const minAvailableLargeSpace = availableSpace - targetMediumSize - maxSmallItemWidth * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(availableSpace / targetLargeSize);
  const largeCounts = descendingCounts(maxLargeCount, minLargeCount);

  let arrangement = findLowestCostArrangement({
    availableSpace,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemWidth,
    maxSmallSize: maxSmallItemWidth,
    smallCounts,
    targetMediumSize,
    mediumCounts: [1, 0],
    targetLargeSize,
    largeCounts,
  });
  if (!arrangement) return emptyGeometry(availableSpace);

  const arrangementCount = arrangement.largeCount + arrangement.mediumCount + arrangement.smallCount;
  if (arrangementCount > itemCount) {
    let surplus = arrangementCount - itemCount;
    let smallCount = arrangement.smallCount;
    let mediumCount = arrangement.mediumCount;
    while (surplus > 0) {
      if (smallCount > 0) smallCount -= 1;
      else if (mediumCount > 1) mediumCount -= 1;
      surplus -= 1;
    }
    arrangement = findLowestCostArrangement({
      availableSpace,
      itemSpacing,
      targetSmallSize,
      minSmallSize: minSmallItemWidth,
      maxSmallSize: maxSmallItemWidth,
      smallCounts: [smallCount],
      targetMediumSize,
      mediumCounts: [mediumCount],
      targetLargeSize,
      largeCounts,
    }) ?? arrangement;
  }

  return keylinesFromSizes([
    anchor,
    ...Array(arrangement.largeCount).fill(arrangement.large),
    ...Array(arrangement.mediumCount).fill(arrangement.medium),
    ...Array(arrangement.smallCount).fill(arrangement.small),
    anchor,
  ], availableSpace, itemSpacing, 'start');
}

function centeredHeroGeometry(options: {
  availableSpace: number;
  itemCount: number;
  maxItemWidth?: number;
  itemSpacing: number;
  minSmallItemWidth: number;
  maxSmallItemWidth: number;
  anchor: number;
}): CarouselGeometry {
  const {
    availableSpace,
    itemCount,
    maxItemWidth,
    itemSpacing,
    minSmallItemWidth,
    maxSmallItemWidth,
    anchor,
  } = options;
  const shouldCenter = itemCount >= 3;
  let smallCounts = itemCount <= 1 ? [0] : shouldCenter ? [2] : [1];
  const targetLargeSize = Math.min(maxItemWidth ?? availableSpace, availableSpace);
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemWidth, maxSmallItemWidth);
  const fullscreenThreshold = minSmallItemWidth * Math.max(...smallCounts) + minSmallItemWidth * 1.25;
  if (availableSpace < fullscreenThreshold) smallCounts = [0];
  const minAvailableLargeSpace = availableSpace - minSmallItemWidth * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(availableSpace / targetLargeSize);
  const arrangement = findLowestCostArrangement({
    availableSpace,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemWidth,
    maxSmallSize: maxSmallItemWidth,
    smallCounts,
    targetMediumSize: 0,
    mediumCounts: [0],
    targetLargeSize,
    largeCounts: descendingCounts(maxLargeCount, minLargeCount),
  });
  if (!arrangement) return emptyGeometry(availableSpace);

  const arrangementCount = arrangement.largeCount + arrangement.smallCount;
  const centered = shouldCenter && itemCount >= arrangementCount;
  const visible = centered
    ? [
        ...Array(Math.floor(arrangement.smallCount / 2)).fill(arrangement.small),
        ...Array(arrangement.largeCount).fill(arrangement.large),
        ...Array(Math.floor(arrangement.smallCount / 2)).fill(arrangement.small),
      ]
    : [
        ...Array(arrangement.largeCount).fill(arrangement.large),
        ...Array(arrangement.smallCount).fill(arrangement.small),
      ];
  return keylinesFromSizes(
    [anchor, ...visible, anchor],
    availableSpace,
    itemSpacing,
    centered ? 'center' : 'start',
  );
}

function uncontainedGeometry(options: {
  availableSpace: number;
  itemWidth: number;
  itemSpacing: number;
  anchor: number;
}): CarouselGeometry {
  const { availableSpace, itemWidth, itemSpacing, anchor } = options;
  if (itemWidth <= 0) return emptyGeometry(availableSpace);
  const large = Math.min(itemWidth, availableSpace);
  const stride = large + itemSpacing;
  const largeCount = Math.max(1, Math.floor((availableSpace + itemSpacing) / Math.max(stride, 1)));
  const remaining = Math.max(
    0,
    availableSpace - largeCount * large - Math.max(0, largeCount - 1) * itemSpacing,
  );
  let medium = Math.max(anchor, remaining * 1.5);
  const threshold = large * carouselDefaults.mediumLargeItemDiffThreshold;
  if (medium > threshold) medium = Math.min(Math.max(threshold, remaining * 1.2), large);
  const leftAnchor = Math.max(Math.min(anchor, itemWidth), medium * 0.5);
  return keylinesFromSizes([
    leftAnchor,
    ...Array(largeCount).fill(large),
    ...(remaining > 0 ? [medium] : []),
    anchor,
  ], availableSpace, itemSpacing, 'start');
}

export function getCarouselGeometry(options: {
  variant: CarouselVariant;
  availableSpace: number;
  itemCount: number;
  preferredItemWidth?: number;
  itemWidth?: number;
  maxItemWidth?: number;
  itemSpacing?: number;
  minSmallItemWidth?: number;
  maxSmallItemWidth?: number;
}): CarouselGeometry {
  const { variant, availableSpace, itemCount } = options;
  if (availableSpace <= 0 || itemCount <= 0) return emptyGeometry(Math.max(0, availableSpace));
  const itemSpacing = options.itemSpacing ?? 0;
  const minSmallItemWidth = options.minSmallItemWidth ?? carouselDefaults.minSmallItemWidth;
  const maxSmallItemWidth = options.maxSmallItemWidth ?? carouselDefaults.maxSmallItemWidth;
  const anchor = carouselDefaults.anchorSize;

  if (variant === 'uncontained') {
    return uncontainedGeometry({
      availableSpace,
      itemWidth: options.itemWidth ?? availableSpace,
      itemSpacing,
      anchor,
    });
  }
  if (variant === 'centered-hero') {
    return centeredHeroGeometry({
      availableSpace,
      itemCount,
      maxItemWidth: options.maxItemWidth,
      itemSpacing,
      minSmallItemWidth,
      maxSmallItemWidth,
      anchor,
    });
  }
  return multiBrowseGeometry({
    availableSpace,
    itemCount,
    preferredItemWidth: options.preferredItemWidth ?? availableSpace,
    itemSpacing,
    minSmallItemWidth,
    maxSmallItemWidth,
    anchor,
  });
}

function edgeKeylines(
  geometry: CarouselGeometry,
  itemSpacing: number,
  edge: 'start' | 'end',
): CarouselKeyline[] {
  const { keylines, availableSpace } = geometry;
  if (keylines.length <= 2) return keylines;
  const visible = keylines.slice(1, -1);
  const firstFocal = visible.findIndex((keyline) => keyline.isFocal);
  const lastFocal = visible.length - 1 - [...visible].reverse().findIndex((keyline) => keyline.isFocal);
  if (firstFocal < 0 || lastFocal < 0) return keylines;
  if (edge === 'start' && firstFocal === 0) return keylines;
  if (edge === 'end' && lastFocal === visible.length - 1) return keylines;

  const before = visible.slice(0, firstFocal).map((keyline) => keyline.size);
  const focal = visible.slice(firstFocal, lastFocal + 1).map((keyline) => keyline.size);
  const after = visible.slice(lastFocal + 1).map((keyline) => keyline.size);
  const visibleSizes = edge === 'start'
    ? [...focal, ...after, ...before]
    : [...before, ...after.reverse(), ...focal];
  return keylinesFromSizes(
    [keylines[0].size, ...visibleSizes, keylines[keylines.length - 1].size],
    availableSpace,
    itemSpacing,
    edge,
  ).keylines;
}

function lerpKeylines(from: CarouselKeyline[], to: CarouselKeyline[], fraction: number) {
  return from.map((keyline, index) => ({
    size: keyline.size + (to[index].size - keyline.size) * fraction,
    offset: keyline.offset + (to[index].offset - keyline.offset) * fraction,
    unadjustedOffset:
      keyline.unadjustedOffset + (to[index].unadjustedOffset - keyline.unadjustedOffset) * fraction,
    isFocal: fraction < 0.5 ? keyline.isFocal : to[index].isFocal,
  }));
}

function keylinesForScrollOffset(
  geometry: CarouselGeometry,
  scrollOffset: number,
  maxScrollOffset: number,
  itemSpacing: number,
) {
  if (geometry.keylines.length === 0 || maxScrollOffset <= 0) return geometry.keylines;
  const defaultKeylines = geometry.keylines;
  const startKeylines = edgeKeylines(geometry, itemSpacing, 'start');
  const endKeylines = edgeKeylines(geometry, itemSpacing, 'end');
  const startShiftDistance = Math.max(
    0,
    startKeylines[0].unadjustedOffset - defaultKeylines[0].unadjustedOffset,
  );
  const endShiftDistance = Math.max(
    0,
    defaultKeylines[defaultKeylines.length - 1].unadjustedOffset -
      endKeylines[endKeylines.length - 1].unadjustedOffset,
  );
  const positiveOffset = Math.max(0, scrollOffset);
  const endShiftOffset = Math.max(0, maxScrollOffset - endShiftDistance);

  if (endShiftOffset < startShiftDistance && maxScrollOffset > 0) {
    return lerpKeylines(startKeylines, endKeylines, clamp(positiveOffset / maxScrollOffset, 0, 1));
  }
  if (startShiftDistance > 0 && positiveOffset < startShiftDistance) {
    return lerpKeylines(
      startKeylines,
      defaultKeylines,
      clamp(positiveOffset / startShiftDistance, 0, 1),
    );
  }
  if (endShiftDistance > 0 && positiveOffset > endShiftOffset) {
    return lerpKeylines(
      defaultKeylines,
      endKeylines,
      clamp((positiveOffset - endShiftOffset) / endShiftDistance, 0, 1),
    );
  }
  return defaultKeylines;
}

function surroundingKeylines(keylines: CarouselKeyline[], center: number) {
  let before = keylines[0];
  let after = keylines[keylines.length - 1];
  for (const keyline of keylines) {
    if (keyline.unadjustedOffset < center) before = keyline;
    if (keyline.unadjustedOffset >= center) {
      after = keyline;
      break;
    }
  }
  return { before, after };
}

export function getCarouselItemGeometry(
  geometry: CarouselGeometry,
  itemIndex: number,
  scrollOffset: number,
  itemSpacing = 0,
  options: CarouselScrollGeometryOptions = {},
): CarouselItemGeometry {
  const { itemMainAxisSize } = geometry;
  if (!itemMainAxisSize || geometry.keylines.length === 0) {
    return { size: 0, translation: 0, isFocal: false };
  }
  const keylines = options.maxScrollOffset === undefined
    ? geometry.keylines
    : keylinesForScrollOffset(geometry, scrollOffset, options.maxScrollOffset, itemSpacing);
  const stride = itemMainAxisSize + itemSpacing;
  const center = itemIndex * stride + itemMainAxisSize / 2 - scrollOffset;
  const { before, after } = surroundingKeylines(keylines, center);
  if (before === after) {
    return { size: before.size, translation: before.offset - center, isFocal: before.isFocal };
  }
  const span = after.unadjustedOffset - before.unadjustedOffset;
  const t = span === 0 ? 1 : clamp((center - before.unadjustedOffset) / span, 0, 1);
  const size = before.size + (after.size - before.size) * t;
  const offset = before.offset + (after.offset - before.offset) * t;
  return {
    size,
    translation: offset - center,
    isFocal: t < 0.5 ? before.isFocal : after.isFocal,
  };
}

export function getInterpolatedMaskSize(
  geometry: CarouselGeometry,
  itemIndex: number,
  scrollOffset: number,
): number {
  return getCarouselItemGeometry(geometry, itemIndex, scrollOffset).size;
}
