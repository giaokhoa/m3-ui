import { createContext, useContext } from 'react';

export const ThemePortalContainerContext = createContext<HTMLDivElement | null>(null);

/** Internal bridge for overlays that must preserve ThemeProvider CSS-variable scope across portals. */
export function useThemePortalContainer(): HTMLDivElement | null {
  return useContext(ThemePortalContainerContext);
}
