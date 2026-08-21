import type { ColorCssVariable, ColorRole, ColorScheme } from './types';

function camelToKebab(value: string) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function colorRoleToCssVariable(role: ColorRole): ColorCssVariable {
  return `--${camelToKebab(role)}`;
}

export function schemeToCssVariables(
  scheme: ColorScheme,
): Record<ColorCssVariable, string> {
  return Object.fromEntries(
    (Object.entries(scheme) as [ColorRole, string][]).map(([role, color]) => [
      colorRoleToCssVariable(role),
      color,
    ]),
  ) as Record<ColorCssVariable, string>;
}
