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
import {
  docsThemePreferences,
  docsThemeStorageKey,
  isDocsThemePreference,
  legacyDocsThemeStorageKey,
  type DocsThemePreference,
} from './docsThemePreference';

interface DocsThemeContextValue {
  preference: DocsThemePreference;
  resolvedMode: ThemeMode;
  cyclePreference: () => void;
}

const themePortalId = 'docs-theme-portal';
const DocsThemeContext = createContext<DocsThemeContextValue | null>(null);

function storedPreference(): DocsThemePreference {
  if (typeof window === 'undefined') return 'system';

  try {
    let value = window.localStorage.getItem(docsThemeStorageKey);
    if (!isDocsThemePreference(value)) {
      const legacyValue = window.localStorage.getItem(legacyDocsThemeStorageKey);
      if (isDocsThemePreference(legacyValue)) {
        value = legacyValue;
        try {
          window.localStorage.setItem(docsThemeStorageKey, legacyValue);
          window.localStorage.removeItem(legacyDocsThemeStorageKey);
        } catch {}
      }
    }
    return isDocsThemePreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

function bootstrappedMode(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.docsTheme === 'dark' ? 'dark' : 'light';
}

function persistPreference(preference: DocsThemePreference) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(docsThemeStorageKey, preference);
    window.localStorage.removeItem(legacyDocsThemeStorageKey);
  } catch {}
}

export function DocsThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<DocsThemePreference>('system');
  const [preferredSystemMode, setPreferredSystemMode] =
    useState<ThemeMode>(bootstrappedMode);
  const themePortalContainer =
    typeof document === 'undefined'
      ? null
      : (document.getElementById(themePortalId) as HTMLDivElement | null);

  useEffect(() => {
    setPreference(storedPreference());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemMode = () =>
      setPreferredSystemMode(media.matches ? 'dark' : 'light');
    updateSystemMode();
    media.addEventListener('change', updateSystemMode);
    return () => media.removeEventListener('change', updateSystemMode);
  }, []);

  const cyclePreference = useCallback(() => {
    const index = docsThemePreferences.indexOf(preference);
    const next =
      docsThemePreferences[(index + 1) % docsThemePreferences.length] ??
      'system';
    persistPreference(next);
    setPreference(next);
  }, [preference]);

  const resolvedMode =
    preference === 'system' ? preferredSystemMode : preference;
  const value = useMemo(
    () => ({ preference, resolvedMode, cyclePreference }),
    [preference, resolvedMode, cyclePreference],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedMode;
    root.dataset.docsTheme = resolvedMode;
    root.dataset.docsThemePreference = preference;
    if (themePortalContainer) {
      themePortalContainer.dataset.theme = resolvedMode;
    }
  }, [preference, resolvedMode, themePortalContainer]);

  return (
    <DocsThemeContext.Provider value={value}>
      <ThemeProvider
        className="docs-theme"
        mode={resolvedMode}
        portalContainer={themePortalContainer}
      >
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
