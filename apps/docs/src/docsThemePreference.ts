export const docsThemeStorageKey = 'm3-ui-docs-theme:v1';
export const legacyDocsThemeStorageKey = 'm3-ui-docs-theme';
export const docsThemePreferences = ['system', 'light', 'dark'] as const;

export type DocsThemePreference = (typeof docsThemePreferences)[number];

export function isDocsThemePreference(
  value: string | null | undefined,
): value is DocsThemePreference {
  return docsThemePreferences.some((preference) => preference === value);
}
