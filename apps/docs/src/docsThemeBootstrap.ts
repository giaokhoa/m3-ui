import {
  docsThemeStorageKey,
  legacyDocsThemeStorageKey,
} from './docsThemePreference';

const storageKey = JSON.stringify(docsThemeStorageKey);
const legacyStorageKey = JSON.stringify(legacyDocsThemeStorageKey);

export const docsThemeBootstrapScript = `(() => {
  const storageKey = ${storageKey};
  const legacyStorageKey = ${legacyStorageKey};
  const isPreference = (value) =>
    value === 'system' || value === 'light' || value === 'dark';
  let preference = 'system';

  try {
    let stored = window.localStorage.getItem(storageKey);
    if (!isPreference(stored)) {
      const legacy = window.localStorage.getItem(legacyStorageKey);
      if (isPreference(legacy)) {
        stored = legacy;
        try {
          window.localStorage.setItem(storageKey, legacy);
          window.localStorage.removeItem(legacyStorageKey);
        } catch {}
      }
    }
    if (isPreference(stored)) preference = stored;
  } catch {}

  let systemDark = false;
  try {
    systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {}

  const mode =
    preference === 'dark'
      ? 'dark'
      : preference === 'light'
        ? 'light'
        : systemDark
          ? 'dark'
          : 'light';
  const root = document.documentElement;
  root.setAttribute('data-m3-theme', '');
  root.dataset.theme = mode;
  root.dataset.docsTheme = mode;
  root.dataset.docsThemePreference = preference;

  const applyTheme = (node) => {
    if (!(node instanceof Element)) return;
    if (node.matches('[data-m3-theme]')) node.dataset.theme = mode;
    for (const scope of node.querySelectorAll('[data-m3-theme]')) {
      scope.dataset.theme = mode;
    }
  };

  applyTheme(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) applyTheme(node);
    }
  });
  observer.observe(document, { childList: true, subtree: true });

  const finish = () => {
    applyTheme(root);
    observer.disconnect();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finish, { once: true });
  } else {
    finish();
  }
})();`;
