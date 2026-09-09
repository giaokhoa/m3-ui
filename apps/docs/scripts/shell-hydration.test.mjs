import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const appDir = resolve(import.meta.dirname, '..');

async function source(path) {
  return readFile(resolve(appDir, path), 'utf8');
}

test('docs theme starts from a deterministic hydration snapshot', async () => {
  const provider = await source('src/DocsThemeProvider.tsx');

  assert.match(
    provider,
    /useState<ThemeMode>\('light'\)/,
    'the server and first client render must resolve system theme from the same initial mode',
  );
  assert.doesNotMatch(
    provider,
    /useState<ThemeMode>\(\s*systemMode/,
    'browser matchMedia must not run as the initial state initializer',
  );
  assert.match(
    provider,
    /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/,
    'system theme should still be observed after hydration',
  );
});

test('docs theme uses a server-rendered portal host on the first client render', async () => {
  const layout = await source('app/layout.tsx');
  const provider = await source('src/DocsThemeProvider.tsx');

  assert.match(layout, /id="docs-theme-portal"/);
  assert.match(layout, /data-m3-theme-portal=""/);
  assert.match(layout, /data-theme="light"/);
  assert.match(provider, /document\.getElementById\(themePortalId\)/);
  assert.match(provider, /portalContainer=\{themePortalContainer\}/);
  assert.match(
    provider,
    /themePortalContainer\.dataset\.theme\s*=\s*resolvedMode/,
    'the external portal scope must follow docs light/dark preference changes',
  );
  assert.doesNotMatch(
    provider,
    /setMounted|setPortalHost/,
    'portal placement must not be deferred until after hydration',
  );
});

test('desktop navigation panes align at a semantic divider', async () => {
  const shellCss = await source('src/docs-shell.css');
  const globalCss = await source('src/styles.css');

  assert.match(shellCss, /\.docs-multi-pane\s*\{[^}]*gap:\s*0;/s);
  assert.match(
    shellCss,
    /\.docs-global-navigation\s*\{[^}]*border-inline-end:\s*1px solid var\(--outline-variant\);/s,
  );
  assert.match(
    shellCss,
    /\.docs-permanent-drawer \.docs-sidebar__header\s*\{[^}]*display:\s*none;/s,
    'persistent contextual navigation must not keep the duplicate modal brand header',
  );
  assert.match(
    shellCss,
    /\.docs-workspace\s*\{[^}]*margin-inline:\s*auto;/s,
    'non-persistent layouts should retain the bounded centered workspace',
  );
  assert.match(
    globalCss,
    /\.docs-permanent-drawer \.docs-workspace,\s*\.docs-permanent-drawer \.docs-main__inner\s*\{[^}]*margin-inline-start:\s*0;[^}]*margin-inline-end:\s*auto;/s,
    'persistent desktop content should anchor to the contextual navigation edge',
  );
});
