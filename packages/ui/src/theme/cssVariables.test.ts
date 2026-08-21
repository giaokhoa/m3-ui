import { describe, expect, it } from 'vitest';
import { lightColorScheme } from './baseline';
import { colorRoleToCssVariable, schemeToCssVariables } from './cssVariables';

describe('color CSS variables', () => {
  it('uses role names directly without Material prefixes', () => {
    expect(colorRoleToCssVariable('primary')).toBe('--primary');
    expect(colorRoleToCssVariable('onPrimary')).toBe('--on-primary');
    expect(colorRoleToCssVariable('surfaceContainerHigh')).toBe(
      '--surface-container-high',
    );
  });

  it('serializes every baseline role and never emits --md-sys-*', () => {
    const variables = schemeToCssVariables(lightColorScheme);

    expect(Object.keys(variables)).toHaveLength(Object.keys(lightColorScheme).length);
    expect(variables['--primary']).toBe('#6750a4');
    expect(variables['--on-primary']).toBe('#ffffff');
    expect(variables['--surface-container-high']).toBe('#ece6f0');
    expect(Object.keys(variables).some((key) => key.startsWith('--md-sys-'))).toBe(
      false,
    );
  });
});
