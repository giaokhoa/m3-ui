import { describe, expect, it } from 'vitest';
import {
  getLoadingIndicatorStyle,
  loadingIndicatorRuntime,
  loadingIndicatorTokens,
} from './LoadingIndicator.defaults';

describe('Material 3 Loading Indicator runtime defaults', () => {
  it('keeps only canonical geometry required by morph arithmetic', () => {
    expect(loadingIndicatorTokens).toEqual({
      activeSize: 38,
      containerHeight: 48,
      containerWidth: 48,
    });
  });

  it('keeps Compose motion mechanics outside canonical DTCG', () => {
    expect(loadingIndicatorRuntime).toEqual({
      globalRotationDurationMs: 4666,
      morphIntervalMs: 650,
      springDampingRatio: 0.6,
      springStiffness: 200,
      springVisibilityThreshold: 0.1,
      quarterRotation: 90,
      determinateRotation: 180,
    });
  });

  it('does not serialize immutable defaults for default rendering', () => {
    expect(getLoadingIndicatorStyle(false)).toEqual({});
    expect(getLoadingIndicatorStyle(true)).toEqual({});
  });

  it('serializes only explicit runtime color overrides', () => {
    expect(getLoadingIndicatorStyle(false, { color: 'hotpink' })).toEqual({
      '--_loading-indicator-color': 'hotpink',
    });
    expect(
      getLoadingIndicatorStyle(true, {
        indicatorColor: 'hotpink',
        containerColor: 'black',
      }),
    ).toEqual({
      '--_loading-indicator-color': 'hotpink',
      '--_loading-container-color': 'black',
    });
  });
});
