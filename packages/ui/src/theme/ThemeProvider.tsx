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
import type { ColorScheme, ThemeMode } from './types';

export interface ThemeProviderProps
  extends PropsWithChildren<Omit<HTMLAttributes<HTMLDivElement>, 'color'>> {
  mode?: ThemeMode;
  sourceColor?: string;
  contrastLevel?: number;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  sourceColor?: string;
  contrastLevel: number;
  scheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeStyle = CSSProperties & Record<`--${string}`, string | number>;

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

  const themeStyle = useMemo(
    () =>
      ({
        ...schemeToCssVariables(scheme),
        colorScheme: mode,
        ...style,
      }) as ThemeStyle,
    [scheme, mode, style],
  );

  const value = useMemo(
    () => ({ mode, sourceColor, contrastLevel, scheme }),
    [mode, sourceColor, contrastLevel, scheme],
  );

  return (
    <ThemeContext.Provider value={value}>
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
