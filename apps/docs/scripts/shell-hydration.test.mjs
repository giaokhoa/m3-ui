import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const appDir = resolve(import.meta.dirname, '..');

async function source(path) {
  return readFile(resolve(appDir, path), 'utf8');
}

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
    /\.docs-workspace\s*\{[^}]*inline-size:\s*100%;[^}]*max-inline-size:\s*1760px;[^}]*margin-inline:\s*auto;/s,
    'desktop workspace should stay centered while flexing up to the reviewed wide-layout bound',
  );
  assert.match(
    shellCss,
    /\.docs-main__inner\s*\{[^}]*inline-size:\s*min\(100%,\s*1120px\);[^}]*margin-inline:\s*auto;/s,
    'primary docs content should be balanced inside the available main pane',
  );
  assert.doesNotMatch(
    globalCss,
    /\.docs-permanent-drawer \.docs-workspace,\s*\.docs-permanent-drawer \.docs-main__inner/s,
    'persistent navigation must not pin the primary content pane to the inline-start edge',
  );
  assert.match(
    globalCss,
    /\.docs-article > \.docs-paragraph,\s*\.docs-article > ul,\s*\.docs-article > ol\s*\{[^}]*max-inline-size:\s*74ch;/s,
    'readable prose measure should be bounded independently from wide documentation artifacts',
  );
});
