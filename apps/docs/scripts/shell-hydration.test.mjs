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

test('desktop navigation panes align at a semantic divider', async () => {
  const css = await source('src/docs-shell.css');

  assert.match(css, /\.docs-multi-pane\s*\{[^}]*gap:\s*0;/s);
  assert.match(
    css,
    /\.docs-global-rail\s*\{[^}]*border-inline-end:\s*1px solid var\(--outline-variant\);/s,
  );
  assert.match(
    css,
    /\.docs-permanent-drawer \.docs-sidebar__header\s*\{[^}]*display:\s*none;/s,
    'persistent contextual navigation must not keep the duplicate modal brand header',
  );
});
