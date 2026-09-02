import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const providerPath = resolve(
  import.meta.dirname,
  '../src/theme/ThemeProvider.tsx',
);

test('ThemeProvider delays its document portal until after hydration', async () => {
  const source = await readFile(providerPath, 'utf8');

  assert.match(
    source,
    /const \[portalReady, setPortalReady\] = useState\(false\);/,
    'the server and first client render must both omit the portal host',
  );
  assert.match(
    source,
    /useEffect\(\(\) => \{\s*setPortalReady\(true\);\s*\}, \[\]\);/s,
    'the portal host should become available only after hydration',
  );
  assert.match(
    source,
    /portalReady && typeof document !== 'undefined'/,
    'document access must stay behind the post-hydration gate',
  );
  assert.doesNotMatch(
    source,
    /\{typeof document === 'undefined'\s*\?\s*null\s*:\s*createPortal/,
    'server/client environment branching must not change the first rendered tree',
  );
});
