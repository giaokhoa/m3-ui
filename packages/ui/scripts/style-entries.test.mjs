import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  publicComponentModules,
  publicComponentStyleSources,
  styleEntries,
} from './style-entries.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rippleCss = 'src/internal/ripple/ripple.css';
const elevationCss = 'src/internal/elevation/elevation.css';

test('every public CSS-bearing component has exactly one modular entry', () => {
  assert.deepEqual(
    Object.keys(styleEntries).sort(),
    Object.keys(publicComponentStyleSources).sort(),
  );
  assert.deepEqual(
    Object.keys(styleEntries).sort(),
    Object.keys(publicComponentModules).sort(),
  );

  for (const [name, ownCss] of Object.entries(publicComponentStyleSources)) {
    const sources = styleEntries[name];
    assert.equal(
      sources.filter((source) => source === ownCss).length,
      1,
      `${name} must include its own CSS exactly once`,
    );
    assert.equal(
      sources.at(-1),
      ownCss,
      `${name} component CSS must come after shared primitive CSS`,
    );
  }
});

test('modular entries include shared primitive CSS used by component source', async () => {
  for (const [name, modulePath] of Object.entries(publicComponentModules)) {
    const source = await readFile(resolve(packageRoot, modulePath), 'utf8');
    const styles = styleEntries[name];

    if (source.includes("../../internal/ripple")) {
      assert.ok(styles.includes(rippleCss), `${name} is missing ripple.css`);
    }
    if (source.includes("../../internal/elevation")) {
      assert.ok(styles.includes(elevationCss), `${name} is missing elevation.css`);
    }
  }
});

test('all declared style sources exist', async () => {
  const sources = new Set(Object.values(styleEntries).flat());
  await Promise.all(
    [...sources].map((source) => readFile(resolve(packageRoot, source), 'utf8')),
  );
});
