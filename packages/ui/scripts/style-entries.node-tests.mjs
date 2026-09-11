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
const themeTokenCss = '../tokens/dist/generated/theme.css';
const rippleCss = 'src/internal/ripple/ripple.css';
const rippleTokenCss = '../tokens/dist/generated/ripple.css';
const elevationCss = 'src/internal/elevation/elevation.css';
const elevationTokenCss = '../tokens/dist/generated/elevation.css';
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

test('every modular entry starts with the generated theme foundation', () => {
  for (const [name, sources] of Object.entries(styleEntries)) {
    const expanded = expandStyleSources(sources);
    assert.equal(
      expanded[0],
      themeTokenCss,
      `${name} must load the generated theme foundation first`,
    );
  }
});

test('modular entries include shared primitive CSS used by component source', async () => {
  for (const [name, modulePath] of Object.entries(publicComponentModules)) {
    const source = await readFile(resolve(packageRoot, modulePath), 'utf8');
    const styles = expandStyleSources(styleEntries[name]);

    if (source.includes("../../internal/ripple")) {
      assert.ok(styles.includes(rippleCss), `${name} is missing ripple.css`);
    }
    if (source.includes("../../internal/elevation")) {
      assert.ok(styles.includes(elevationCss), `${name} is missing elevation.css`);
    }
  }
});

function assertAdapterBefore(
  name,
  expanded,
  adapter,
  consumer,
  label,
) {
  const adapterIndex = expanded.indexOf(adapter);
  const consumerIndex = expanded.indexOf(consumer);
  assert.notEqual(adapterIndex, -1, `${name} is missing ${label} adapter`);
  assert.notEqual(consumerIndex, -1, `${name} is missing ${consumer}`);
  assert.ok(
    adapterIndex < consumerIndex,
    `${name} must load ${label} adapter before ${consumer}`,
  );
}

test('shared primitive CSS consumers inline generated adapters first', () => {
  for (const [name, sources] of Object.entries(styleEntries)) {
    const expanded = expandStyleSources(sources);
    if (sources.includes(rippleCss)) {
      assertAdapterBefore(name, expanded, rippleTokenCss, rippleCss, 'generated Ripple');
    }
    if (sources.includes(elevationCss)) {
      assertAdapterBefore(
        name,
        expanded,
        elevationTokenCss,
        elevationCss,
        'generated Elevation',
      );
    }
  }
});

test('Button CSS consumers inline Elevation and Button adapters before button.css', () => {
  for (const [name, sources] of Object.entries(styleEntries)) {
    if (!sources.includes(buttonCss)) continue;
    const expanded = expandStyleSources(sources);
    assertAdapterBefore(
      name,
      expanded,
      elevationTokenCss,
      elevationCss,
      'generated Elevation',
    );
    assert.ok(
      expanded.indexOf(elevationCss) < expanded.indexOf(buttonCss),
      `${name} must load elevation.css before button.css`,
    );
    assertAdapterBefore(
      name,
      expanded,
      buttonTokenCss,
      buttonCss,
      'generated Button',
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
