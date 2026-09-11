import { describe, expect, it } from 'vitest';
import { carouselDefaults } from './Carousel.defaults';
import { getCarouselGeometry, getCarouselItemGeometry } from './Carousel.geometry';

describe('Carousel geometry', () => {
  it('locks AndroidX renderer defaults separately from canonical item tokens', () => {
    expect(carouselDefaults.minSmallItemWidth).toBe(40);
    expect(carouselDefaults.maxSmallItemWidth).toBe(56);
    expect(carouselDefaults.anchorSize).toBe(10);
    expect(carouselDefaults.mediumLargeItemDiffThreshold).toBe(0.85);
  });

  it('matches the pinned multi-browse 380 / 186 / 8 arrangement exactly', () => {
    const geometry = getCarouselGeometry({
      variant: 'multi-browse',
      availableSpace: 380,
      itemCount: 10,
      preferredItemWidth: 186,
      itemSpacing: 8,
    });
    const firstFocal = geometry.keylines.find((keyline) => keyline.isFocal);
    const lastNonAnchor = geometry.keylines.at(-2);

    expect(geometry.itemMainAxisSize).toBe(186);
    expect(firstFocal?.offset).toBe(93);
    expect(lastNonAnchor?.size).toBe(56);
    expect(lastNonAnchor?.offset).toBe(352);
    expect(geometry.keylines.map((keyline) => keyline.unadjustedOffset)).toEqual([
      -101,
      93,
      287,
      481,
      675,
    ]);
  });

  it('keeps a preferred large size unchanged when the pinned arrangement has enough room', () => {
    const geometry = getCarouselGeometry({
      variant: 'multi-browse',
      availableSpace: 500,
      itemCount: 10,
      preferredItemWidth: 120,
    });
    expect(geometry.itemMainAxisSize).toBe(120);
  });

  it('removes surplus non-focal keylines before resizing focal items for a short list', () => {
    const geometry = getCarouselGeometry({
      variant: 'multi-browse',
      availableSpace: 512,
      itemCount: 3,
      preferredItemWidth: 200,
    });
    expect(geometry.keylines).toHaveLength(5);
    expect(geometry.keylines[1].isFocal).toBe(true);
    expect(geometry.keylines[2].isFocal).toBe(true);
    expect(geometry.keylines[3].size).toBeCloseTo(112, 5);
  });

  it('matches the pinned uncontained one-third cut-off arrangement', () => {
    const geometry = getCarouselGeometry({
      variant: 'uncontained',
      availableSpace: 400,
      itemCount: 8,
      itemWidth: 125,
    });
    expect(geometry.itemMainAxisSize).toBe(125);
    expect(geometry.keylines).toHaveLength(6);
    expect(geometry.keylines[0].size).toBeCloseTo(18.75, 5);
    expect(geometry.keylines[0].offset).toBeCloseTo(-9.375, 5);
    expect(geometry.keylines[4].size).toBeCloseTo(37.5, 5);
    expect(geometry.keylines[4].offset).toBeCloseTo(393.75, 5);
    expect(geometry.keylines[5].size).toBe(10);
    expect(geometry.keylines[5].offset).toBeCloseTo(417.5, 5);
  });

  it('lets the uncontained cut-off item reach large size when the remaining space is large', () => {
    const geometry = getCarouselGeometry({
      variant: 'uncontained',
      availableSpace: 1000,
      itemCount: 8,
      itemWidth: 501,
    });
    expect(geometry.keylines).toHaveLength(4);
    expect(geometry.keylines[0].offset).toBeCloseTo(-125.25, 5);
    expect(geometry.keylines[1].size).toBe(501);
    expect(geometry.keylines[2].size).toBe(501);
    expect(geometry.keylines[3].offset).toBeCloseTo(1007, 5);
  });

  it('centers one 100px hero item between two 40px small items', () => {
    const geometry = getCarouselGeometry({
      variant: 'centered-hero',
      availableSpace: 180,
      itemCount: 6,
    });
    expect(geometry.itemMainAxisSize).toBe(100);
    const focal = geometry.keylines.find((keyline) => keyline.isFocal);
    expect(focal?.offset).toBe(90);
    expect(geometry.keylines[1].size).toBe(40);
    expect(geometry.keylines.at(-2)?.size).toBe(40);
  });

  it('falls back to start alignment when centered hero has fewer than three items', () => {
    const geometry = getCarouselGeometry({
      variant: 'centered-hero',
      availableSpace: 180,
      itemCount: 2,
    });
    expect(geometry.itemMainAxisSize).toBe(140);
    expect(geometry.keylines[1].isFocal).toBe(true);
    expect(geometry.keylines[1].offset).toBe(70);
  });

  it('keeps spaced centered-hero edge small items flush with the container', () => {
    const geometry = getCarouselGeometry({
      variant: 'centered-hero',
      availableSpace: 980,
      itemCount: 7,
      maxItemWidth: 300,
      itemSpacing: 12,
    });
    expect(geometry.itemMainAxisSize).toBe(284);
    expect(geometry.keylines[1].size).toBe(40);
    expect(geometry.keylines[1].offset).toBe(20);
    expect(geometry.keylines.at(-2)?.offset).toBe(960);
  });

  it('shifts centered-hero focal keylines to make the first and last items fully large at edges', () => {
    const geometry = getCarouselGeometry({
      variant: 'centered-hero',
      availableSpace: 400,
      itemCount: 7,
      maxItemWidth: 280,
      itemSpacing: 8,
    });
    const stride = geometry.itemMainAxisSize + 8;
    const maxScrollOffset = 7 * geometry.itemMainAxisSize + 6 * 8 - 400;
    const first = getCarouselItemGeometry(geometry, 0, 0, 8, { maxScrollOffset });
    const middle = getCarouselItemGeometry(geometry, 1, stride - 60, 8, { maxScrollOffset });
    const last = getCarouselItemGeometry(geometry, 6, maxScrollOffset, 8, { maxScrollOffset });

    expect(first.size).toBe(280);
    expect(first.isFocal).toBe(true);
    expect(middle.size).toBe(280);
    expect(middle.isFocal).toBe(true);
    expect(last.size).toBe(280);
    expect(last.isFocal).toBe(true);
  });
});
