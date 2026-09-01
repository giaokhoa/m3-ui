import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  calculateContainerAdaptiveInfo,
  useContainerAdaptiveInfo,
} from './useContainerAdaptiveInfo';

describe('container adaptive info', () => {
  it.each([
    [0, 'compact'],
    [599.999, 'compact'],
    [600, 'medium'],
    [839.999, 'medium'],
    [840, 'expanded'],
    [1199.999, 'expanded'],
    [1200, 'large'],
    [1599.999, 'large'],
    [1600, 'extra-large'],
  ] as const)('reuses the Material width threshold at %s', (width, expected) => {
    expect(
      calculateContainerAdaptiveInfo({ width, height: 600 }).containerSizeClass.width,
    ).toBe(expected);
  });

  it.each([
    [0, 'compact'],
    [479.999, 'compact'],
    [480, 'medium'],
    [899.999, 'medium'],
    [900, 'expanded'],
  ] as const)('reuses the Material height threshold at %s', (height, expected) => {
    expect(
      calculateContainerAdaptiveInfo({ width: 600, height }).containerSizeClass.height,
    ).toBe(expected);
  });

  it('renders safely on the server with an unmeasured compact container', () => {
    function Probe() {
      const ref = createRef<HTMLDivElement>();
      const info = useContainerAdaptiveInfo(ref);
      return (
        <span>
          {info.containerSize.width}:{info.containerSize.height}:
          {info.containerSizeClass.width}:{info.containerSizeClass.height}
        </span>
      );
    }

    expect(renderToStaticMarkup(<Probe />)).toContain('0:0:compact:compact');
  });

  it('supports a stable server snapshot when the application knows the container size', () => {
    function Probe() {
      const ref = createRef<HTMLDivElement>();
      const info = useContainerAdaptiveInfo(ref, {
        serverSize: { width: 840, height: 900 },
      });
      return (
        <span>
          {info.containerSizeClass.width}:{info.containerSizeClass.height}
        </span>
      );
    }

    expect(renderToStaticMarkup(<Probe />)).toContain('expanded:expanded');
  });
});
