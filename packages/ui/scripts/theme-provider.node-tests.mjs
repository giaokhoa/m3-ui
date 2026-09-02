import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const providerPath = resolve(
  import.meta.dirname,
  '../src/theme/ThemeProvider.tsx',
);

test('ThemeProvider keeps its portal host in the server and first client tree', async () => {
  const source = await readFile(providerPath, 'utf8');

  assert.doesNotMatch(
    source,
    /createPortal/,
    'the themed portal host must not appear only in the browser render',
  );
  assert.doesNotMatch(
    source,
    /typeof document|typeof window/,
    'portal-host presence must not branch on the rendering environment',
  );
  assert.match(
    source,
    /data-m3-theme-portal=""/,
    'ThemeProvider should render a stable themed portal host in normal markup',
  );
  assert.match(
    source,
    /display:\s*'contents'/,
    'the stable host should preserve theme inheritance without adding a layout box',
  );
});
