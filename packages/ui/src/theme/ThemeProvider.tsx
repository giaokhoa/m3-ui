import '@m3-ui/tokens/theme.css';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';
import { getBaselineColorScheme } from './baseline';
import { schemeToCssVariables } from './cssVariables';
import { createDynamicColorScheme } from './dynamic';
import { ThemePortalContainerContext } from './ThemePortalContext';
import type { ColorScheme, ThemeMode } from './types';

const defaultFontStylesheet =
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

export type ThemeStyle = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

export type RippleFocusIndication = 'opacity' | 'inset-ring';

export interface ThemeProviderProps
  extends PropsWithChildren<
    Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'style'>
  > {
  mode?: ThemeMode;
  sourceColor?: string;
  contrastLevel?: number;
  /**
   * Stable externally rendered portal target. Pass `null` during SSR and the
   * matching element on the first client render when the host is owned by the
   * application document. The caller is responsible for applying the same
   * theme scope attributes/custom properties to an external container.
   */
  portalContainer?: HTMLDivElement | null;
  /**
   * Global Material ripple focus treatment. `opacity` matches the default
   * AndroidX RippleThemeConfiguration; `inset-ring` maps to
   * RippleDefaults.InsetFocusRingThemeConfiguration.
   */
  rippleFocus?: RippleFocusIndication;
  style?: ThemeStyle;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  sourceColor?: string;
  contrastLevel: number;
  rippleFocus: RippleFocusIndication;
  scheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  mode = 'light',
  sourceColor,
  contrastLevel = 0,
  portalContainer: externalPortalContainer,
  rippleFocus = 'opacity',
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
      ...(sourceColor ? schemeToCssVariables(scheme) : {}),
      ...style,
    }),
    [sourceColor, scheme, style],
  );

  const value = useMemo(
    () => ({ mode, sourceColor, contrastLevel, rippleFocus, scheme }),
    [mode, sourceColor, contrastLevel, rippleFocus, scheme],
  );
  const [internalPortalContainer, setInternalPortalContainer] =
    useState<HTMLDivElement | null>(null);
  const portalContainer =
    externalPortalContainer === undefined
      ? internalPortalContainer
      : externalPortalContainer;

  return (
    <ThemeContext.Provider value={value}>
      <ThemePortalContainerContext.Provider value={portalContainer}>
        <link
          href={defaultFontStylesheet}
          precedence="m3-font"
          rel="stylesheet"
        />
        <div {...props} data-m3-theme="" data-theme={mode} style={themeStyle}>
          {children}
        </div>
        {externalPortalContainer !== undefined || typeof document === 'undefined'
          ? null
          : createPortal(
              <div
                ref={setInternalPortalContainer}
                data-m3-theme=""
                data-m3-theme-portal=""
                data-theme={mode}
                style={themeStyle}
              />,
              document.body,
            )}
      </ThemePortalContainerContext.Provider>
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
