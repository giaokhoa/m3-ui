import { describe, expect, it } from 'vitest';
import {
  getLoadingIndicatorStyle,
  loadingIndicatorRuntime,
  loadingIndicatorTokens,
} from './LoadingIndicator.defaults';

describe('Material 3 Loading Indicator defaults', () => {
  it('projects the canonical component geometry', () => {
    expect(loadingIndicatorTokens).toMatchObject({
      activeSize: 38,
      containerHeight: 48,
      containerShape: 'full',
      containerWidth: 48,
    });
  });

  it('projects canonical uncontained and contained colors', () => {
    expect(loadingIndicatorTokens.activeColor).toBe('var(--primary)');
    expect(loadingIndicatorTokens.containedActiveColor).toBe(
      'var(--on-primary-container)',
    );
    expect(loadingIndicatorTokens.containedContainerColor).toBe(
      'var(--primary-container)',
    );
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

  it('emits the uncontained canonical style projection', () => {
    const style = getLoadingIndicatorStyle(false);
    expect(style['--_loading-width']).toBe('48px');
    expect(style['--_loading-height']).toBe('48px');
    expect(style['--_loading-active-size']).toBe('38px');
    expect(style['--_loading-container-radius']).toBe('9999px');
    expect(style['--_loading-indicator-color']).toBe('var(--primary)');
    expect(style['--_loading-container-color']).toBe('transparent');
  });

  it('emits contained colors and allows explicit web overrides', () => {
    const style = getLoadingIndicatorStyle(true, {
      indicatorColor: 'hotpink',
      containerColor: 'black',
    });
    expect(style['--_loading-indicator-color']).toBe('hotpink');
    expect(style['--_loading-container-color']).toBe('black');
  });
});
