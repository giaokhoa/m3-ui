import * as token from '@m3-ui/tokens';
import type { CSSProperties } from 'react';

export const defaultScaffoldContainerColor = token.ColorRoleBackground;
export const defaultScaffoldContentColor = token.ColorRoleOnBackground;

/**
 * Browser projection of AndroidX ColorScheme.contentColorFor for the canonical
 * Material runtime roles. A custom CSS color has no ColorScheme role identity,
 * so it falls back to the inherited content color just like Color.Unspecified
 * falls back to LocalContentColor in the composable contentColorFor overload.
 */
export function getScaffoldContentColor(
  containerColor: CSSProperties['backgroundColor'] | undefined,
  contentColor: CSSProperties['color'] | undefined,
): CSSProperties['color'] | undefined {
  if (contentColor !== undefined) return contentColor;

  const resolvedContainerColor = containerColor ?? defaultScaffoldContainerColor;
  switch (resolvedContainerColor) {
    case token.ColorRolePrimary:
      return token.ColorRoleOnPrimary;
    case token.ColorRoleSecondary:
      return token.ColorRoleOnSecondary;
    case token.ColorRoleTertiary:
      return token.ColorRoleOnTertiary;
    case token.ColorRoleBackground:
      return token.ColorRoleOnBackground;
    case token.ColorRoleError:
      return token.ColorRoleOnError;
    case token.ColorRolePrimaryContainer:
      return token.ColorRoleOnPrimaryContainer;
    case token.ColorRoleSecondaryContainer:
      return token.ColorRoleOnSecondaryContainer;
    case token.ColorRoleTertiaryContainer:
      return token.ColorRoleOnTertiaryContainer;
    case token.ColorRoleErrorContainer:
      return token.ColorRoleOnErrorContainer;
    case token.ColorRoleInverseSurface:
      return token.ColorRoleInverseOnSurface;
    case token.ColorRoleSurface:
    case token.ColorRoleSurfaceBright:
    case token.ColorRoleSurfaceContainer:
    case token.ColorRoleSurfaceContainerHigh:
    case token.ColorRoleSurfaceContainerHighest:
    case token.ColorRoleSurfaceContainerLow:
    case token.ColorRoleSurfaceContainerLowest:
    case token.ColorRoleSurfaceDim:
      return token.ColorRoleOnSurface;
    case token.ColorRoleSurfaceVariant:
      return token.ColorRoleOnSurfaceVariant;
    case token.ColorRolePrimaryFixed:
    case token.ColorRolePrimaryFixedDim:
      return token.ColorRoleOnPrimaryFixed;
    case token.ColorRoleSecondaryFixed:
    case token.ColorRoleSecondaryFixedDim:
      return token.ColorRoleOnSecondaryFixed;
    case token.ColorRoleTertiaryFixed:
    case token.ColorRoleTertiaryFixedDim:
      return token.ColorRoleOnTertiaryFixed;
    default:
      return undefined;
  }
}
