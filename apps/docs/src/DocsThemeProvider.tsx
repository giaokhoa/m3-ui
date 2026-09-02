'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { ThemeProvider, type ThemeMode } from '@m3-ui/ui';

export type DocsThemePreference = ThemeMode | 'system';

interface DocsThemeContextValue {
  preference: DocsThemePreference;
  resolvedMode: ThemeMode;
  cyclePreference: () => void;
}

const storageKey = 'm3-ui-docs-theme';
const preferences: readonly DocsThemePreference[] = ['system', 'light', 'dark'];
const DocsThemeContext = createContext<DocsThemeContextValue | null>(null);

function storedPreference(): DocsThemePreference {
  if (typeof window === 'undefined') return 'system';
  const value = window.localStorage.getItem(storageKey);
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'system';
}

export function DocsThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<DocsThemePreference>('system');
  // Keep the server and the first client render identical. Browser-only theme
  // sources are applied after hydration so ThemeProvider never hydrates from a
  // different mode than the server rendered.
  const [preferredSystemMode, setPreferredSystemMode] = useState<ThemeMode>('light');

  useEffect(() => {
    setPreference(storedPreference());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemMode = () => setPreferredSystemMode(media.matches ? 'dark' : 'light');
    updateSystemMode();
    media.addEventListener('change', updateSystemMode);
    return () => media.removeEventListener('change', updateSystemMode);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreference((current) => {
      const index = preferences.indexOf(current);
      const next = preferences[(index + 1) % preferences.length] ?? 'system';
      window.localStorage.setItem(storageKey, next);
      return next;
    });
  }, []);

  const resolvedMode =
    preference === 'system' ? preferredSystemMode : preference;
  const value = useMemo(
    () => ({ preference, resolvedMode, cyclePreference }),
    [preference, resolvedMode, cyclePreference],
  );

  return (
    <DocsThemeContext.Provider value={value}>
      <ThemeProvider className="docs-theme" mode={resolvedMode}>
        {children}
      </ThemeProvider>
    </DocsThemeContext.Provider>
  );
}

export function useDocsTheme(): DocsThemeContextValue {
  const context = useContext(DocsThemeContext);
  if (!context) {
    throw new Error('useDocsTheme must be used within DocsThemeProvider');
  }
  return context;
}
