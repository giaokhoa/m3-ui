import { describe, expect, it } from 'vitest';
import { createDynamicColorScheme } from './dynamic';

// Dynamic Material Color Utilities output intentionally has its own contract.
// It is not expected to be byte-for-byte identical to the static Material 3
// baseline palette, even when the source color is the baseline primary.
describe('dynamic color scheme', () => {
  it('creates all color roles for a source color', () => {
    const scheme = createDynamicColorScheme('#6750a4', 'light');

    expect(scheme.primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(scheme.onPrimary).toMatch(/^#[0-9a-f]{6}$/);
    expect(scheme.surfaceContainerHighest).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(scheme)).toHaveLength(49);
  });

  it('supports dark mode and validates contrast', () => {
    const light = createDynamicColorScheme('#6750a4', 'light');
    const dark = createDynamicColorScheme('#6750a4', 'dark');

    expect(dark.primary).not.toBe(light.primary);
    expect(() => createDynamicColorScheme('#6750a4', 'light', 1.1)).toThrow(
      RangeError,
    );
  });
});
