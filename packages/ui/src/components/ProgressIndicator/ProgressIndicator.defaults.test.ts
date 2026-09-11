import { describe, expect, it } from 'vitest';
import {
  getProgressIndicatorStyle,
  progressIndicatorRuntime,
  progressIndicatorTokens,
} from './ProgressIndicator.defaults';
import {
  buildCircularWavePath,
  buildLinearWavePath,
  defaultWavyAmplitude,
  progressFraction,
} from './ProgressIndicator.geometry';

describe('ProgressIndicator runtime projection', () => {
  it('keeps numeric standard geometry required by renderer arithmetic', () => {
    expect(progressIndicatorTokens.linear.height).toBe(4);
    expect(progressIndicatorTokens.linear.activeThickness).toBe(4);
    expect(progressIndicatorTokens.linear.trackActiveSpace).toBe(4);
    expect(progressIndicatorTokens.linear.stopSize).toBe(4);
    expect(progressIndicatorTokens.circular.size).toBe(40);
    expect(progressIndicatorTokens.circular.activeThickness).toBe(4);
  });

  it('keeps numeric expressive geometry required by wave arithmetic', () => {
    expect(progressIndicatorTokens.linear.waveHeight).toBe(10);
    expect(progressIndicatorTokens.linear.waveAmplitude).toBe(3);
    expect(progressIndicatorTokens.linear.waveWavelength).toBe(40);
    expect(progressIndicatorTokens.linear.indeterminateWaveWavelength).toBe(20);
    expect(progressIndicatorTokens.circular.waveSize).toBe(48);
    expect(progressIndicatorTokens.circular.waveAmplitude).toBe(1.6);
    expect(progressIndicatorTokens.circular.waveWavelength).toBe(15);
  });

  it('keeps renderer mechanics outside canonical DTCG', () => {
    expect(progressIndicatorRuntime.linearWidth).toBe(240);
    expect(progressIndicatorRuntime.webLinearMinWidth).toBe(80);
    expect(progressIndicatorRuntime.webLinearDeterminateDuration).toBe('250ms');
    expect(progressIndicatorRuntime.webCircularDeterminateDuration).toBe('500ms');
    expect(progressIndicatorRuntime.webCircularFourColorDuration).toBe('5332ms');
    expect(progressIndicatorRuntime.webLinearIndeterminateDuration).toBe('2000ms');
    expect(progressIndicatorRuntime.composeCircularProgressDuration).toBe('6000ms');
    expect(progressIndicatorRuntime.composeCircularMinProgress).toBe(0.1);
    expect(progressIndicatorRuntime.composeCircularMaxProgress).toBe(0.87);
  });

  it('uses 0..1 Material range math without losing custom ranges', () => {
    expect(progressFraction(0.25)).toBe(0.25);
    expect(progressFraction(50, 0, 100)).toBe(0.5);
    expect(progressFraction(150, 0, 100)).toBe(1);
    expect(progressFraction(Number.NaN, 0, 100)).toBe(0);
  });

  it('matches Compose default determinate amplitude boundaries', () => {
    expect(defaultWavyAmplitude(0.1)).toBe(0);
    expect(defaultWavyAmplitude(0.5)).toBe(1);
    expect(defaultWavyAmplitude(0.95)).toBe(0);
  });

  it('builds finite linear and circular wave paths', () => {
    const linear = buildLinearWavePath(240, 10, 3, 40, 40);
    const circular = buildCircularWavePath(48, 4, 1.6, 15, 0, 0.5);
    expect(linear.startsWith('M ')).toBe(true);
    expect(circular.startsWith('M ')).toBe(true);
    expect(linear).not.toContain('NaN');
    expect(circular).not.toContain('NaN');
  });

  it('serializes only renderer mechanics and live overrides', () => {
    const linear = getProgressIndicatorStyle('linear', true, {
      wavelength: 40,
      waveSpeed: 20,
      color: 'hotpink',
    });
    const circular = getProgressIndicatorStyle('circular', false);

    expect(linear['--_progress-wave-duration']).toBe('2s');
    expect(linear['--_progress-active-color']).toBe('hotpink');
    expect(linear['--_progress-linear-height']).toBeUndefined();
    expect(linear['--_progress-track-color']).toBeUndefined();
    expect(circular['--_progress-circular-size']).toBeUndefined();
    expect(circular['--_progress-active-color']).toBeUndefined();
    expect(circular['--_progress-determinate-easing']).toBeUndefined();
  });
});
