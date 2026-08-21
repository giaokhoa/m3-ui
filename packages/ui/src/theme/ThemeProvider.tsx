import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { getBaselineColorScheme } from './baseline';
import { schemeToCssVariables } from './cssVariables';
import { createDynamicColorScheme } from './dynamic';
import { defaultTypographyThemeStyle } from './typography/cssVariables';
import type { ColorScheme, ThemeMode } from './types';

const defaultFontStylesheet =
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

export type ThemeStyle = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

export interface ThemeProviderProps
  extends PropsWithChildren<
    Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'style'>
  > {
  mode?: ThemeMode;
  sourceColor?: string;
  contrastLevel?: number;
  style?: ThemeStyle;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  sourceColor?: string;
  contrastLevel: number;
  scheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  mode = 'light',
  sourceColor,
  contrastLevel = 0,
  children,
  style,
  ...props
}: ThemeProviderProps) {
  const scheme = useMemo(
    () =>
      sourceColor
        ? createDynamicColorScheme(sourceColor, mode, contrastLevel)
        : getBaselineColorScheme(mode),
    [sourceColor, mode, contrastLevel],
  );

  const themeStyle = useMemo<ThemeStyle>(
    () => ({
      ...schemeToCssVariables(scheme),
      ...defaultTypographyThemeStyle,
      colorScheme: mode,
      ...style,
    }),
    [scheme, mode, style],
  );

  const value = useMemo(
    () => ({ mode, sourceColor, contrastLevel, scheme }),
    [mode, sourceColor, contrastLevel, scheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <link
        href={defaultFontStylesheet}
        precedence="m3-font"
        rel="stylesheet"
      />
      <div {...props} data-theme={mode} style={themeStyle}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
