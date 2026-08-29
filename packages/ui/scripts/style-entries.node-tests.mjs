import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { expandStyleSources } from './generated-style-dependencies.mjs';
import {
  publicComponentModules,
  publicComponentStyleSources,
  styleEntries,
} from './style-entries.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rippleCss = 'src/internal/ripple/ripple.css';
const elevationCss = 'src/internal/elevation/elevation.css';
const buttonCss = 'src/components/Button/button.css';
const buttonTokenCss = '../tokens/dist/generated/button.css';

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

test('Button CSS consumers inline the generated token adapter first', () => {
  for (const [name, sources] of Object.entries(styleEntries)) {
    if (!sources.includes(buttonCss)) continue;
    const expanded = expandStyleSources(sources);
    const tokenIndex = expanded.indexOf(buttonTokenCss);
    const buttonIndex = expanded.indexOf(buttonCss);
    assert.notEqual(tokenIndex, -1, `${name} is missing the generated Button token adapter`);
    assert.ok(
      tokenIndex < buttonIndex,
      `${name} must load the generated Button token adapter before button.css`,
    );
  }
});

test('all expanded style sources exist', async () => {
  const sources = new Set(
    Object.values(styleEntries).flatMap((sources) => expandStyleSources(sources)),
  );
  await Promise.all(
    [...sources].map((source) => readFile(resolve(packageRoot, source), 'utf8')),
  );
});
