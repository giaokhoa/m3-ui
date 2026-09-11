import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  defaultScaffoldContainerColor,
  defaultScaffoldContentColor,
  getScaffoldContentColor,
} from './Scaffold.defaults';

describe('Scaffold color defaults', () => {
  it('uses the Material background/onBackground pair by default', () => {
    expect(defaultScaffoldContainerColor).toBe(token.ColorRoleBackground);
    expect(defaultScaffoldContentColor).toBe(token.ColorRoleOnBackground);
    expect(getScaffoldContentColor(undefined, undefined)).toBe(
      token.ColorRoleOnBackground,
    );
  });

  it.each([
    ['primary', token.ColorRolePrimary, token.ColorRoleOnPrimary],
    ['secondary', token.ColorRoleSecondary, token.ColorRoleOnSecondary],
    ['tertiary', token.ColorRoleTertiary, token.ColorRoleOnTertiary],
    ['background', token.ColorRoleBackground, token.ColorRoleOnBackground],
    ['error', token.ColorRoleError, token.ColorRoleOnError],
    [
      'primary container',
      token.ColorRolePrimaryContainer,
      token.ColorRoleOnPrimaryContainer,
    ],
    [
      'secondary container',
      token.ColorRoleSecondaryContainer,
      token.ColorRoleOnSecondaryContainer,
    ],
    [
      'tertiary container',
      token.ColorRoleTertiaryContainer,
      token.ColorRoleOnTertiaryContainer,
    ],
    ['error container', token.ColorRoleErrorContainer, token.ColorRoleOnErrorContainer],
    ['inverse surface', token.ColorRoleInverseSurface, token.ColorRoleInverseOnSurface],
    ['surface', token.ColorRoleSurface, token.ColorRoleOnSurface],
    ['surface variant', token.ColorRoleSurfaceVariant, token.ColorRoleOnSurfaceVariant],
    ['surface bright', token.ColorRoleSurfaceBright, token.ColorRoleOnSurface],
    ['surface container', token.ColorRoleSurfaceContainer, token.ColorRoleOnSurface],
    [
      'surface container high',
      token.ColorRoleSurfaceContainerHigh,
      token.ColorRoleOnSurface,
    ],
    [
      'surface container highest',
      token.ColorRoleSurfaceContainerHighest,
      token.ColorRoleOnSurface,
    ],
    ['surface container low', token.ColorRoleSurfaceContainerLow, token.ColorRoleOnSurface],
    [
      'surface container lowest',
      token.ColorRoleSurfaceContainerLowest,
      token.ColorRoleOnSurface,
    ],
    ['surface dim', token.ColorRoleSurfaceDim, token.ColorRoleOnSurface],
    ['primary fixed', token.ColorRolePrimaryFixed, token.ColorRoleOnPrimaryFixed],
    ['primary fixed dim', token.ColorRolePrimaryFixedDim, token.ColorRoleOnPrimaryFixed],
    ['secondary fixed', token.ColorRoleSecondaryFixed, token.ColorRoleOnSecondaryFixed],
    [
      'secondary fixed dim',
      token.ColorRoleSecondaryFixedDim,
      token.ColorRoleOnSecondaryFixed,
    ],
    ['tertiary fixed', token.ColorRoleTertiaryFixed, token.ColorRoleOnTertiaryFixed],
    [
      'tertiary fixed dim',
      token.ColorRoleTertiaryFixedDim,
      token.ColorRoleOnTertiaryFixed,
    ],
  ])('maps the canonical %s role to its AndroidX content role', (_name, container, content) => {
    expect(getScaffoldContentColor(container, undefined)).toBe(content);
  });

  it('inherits for a custom container and lets an explicit content color win', () => {
    expect(getScaffoldContentColor('#ff0000', undefined)).toBeUndefined();
    expect(getScaffoldContentColor(token.ColorRolePrimary, '#ffffff')).toBe('#ffffff');
    expect(getScaffoldContentColor('#ff0000', '#ffffff')).toBe('#ffffff');
  });
});
