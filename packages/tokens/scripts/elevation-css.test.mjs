import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

test('generated Elevation CSS serializes canonical shadow geometry through the theme shadow role', async () => {
  const css = await readFile(
    new URL('dist/generated/elevation.css', packageRoot),
    'utf8',
  );

  assert.match(css, /\.elevation, \.elevation-host \{/);
  assert.match(css, /--_elevation-shadow-color: var\(--shadow\);/);
  assert.match(css, /--_elevation-box-shadow: none;/);

  const level0 = css.match(
    /\.elevation\[data-elevation='level0'\], \.elevation-host\[data-elevation='level0'\] \{([\s\S]*?)\n\}/,
  )?.[1];
  assert.ok(level0, 'missing generated level0 elevation rule');
  assert.match(level0, /--_elevation-box-shadow: none;/);
  assert.doesNotMatch(level0, /color-mix\(/);

  assert.match(
    css,
    /\.elevation\[data-elevation='level1'\], \.elevation-host\[data-elevation='level1'\] \{/,
  );
  assert.match(
    css,
    /0px 2px 1px -1px color-mix\(in srgb, var\(--_elevation-shadow-color\) 20%, transparent\)/,
  );
  assert.match(
    css,
    /0px 1px 1px 0px color-mix\(in srgb, var\(--_elevation-shadow-color\) 14[^%]*%, transparent\)/,
  );
  assert.match(
    css,
    /0px 1px 3px 0px color-mix\(in srgb, var\(--_elevation-shadow-color\) 12%, transparent\)/,
  );

  for (const level of ['level0', 'level1', 'level2', 'level3', 'level4', 'level5']) {
    assert.match(
      css,
      new RegExp(
        `\\.elevation\\[data-elevation='${level}'\\], \\.elevation-host\\[data-elevation='${level}'\\] \\{`,
      ),
    );
  }

  assert.doesNotMatch(css, /(^|\s)--shadow\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('generated Elevation CSS preserves the canonical three-layer recipe rather than Material Web two-layer drift', async () => {
  const css = await readFile(
    new URL('dist/generated/elevation.css', packageRoot),
    'utf8',
  );
  const level1 = css.match(
    /\.elevation\[data-elevation='level1'\], \.elevation-host\[data-elevation='level1'\] \{([\s\S]*?)\n\}/,
  )?.[1];

  assert.ok(level1, 'missing generated level1 elevation rule');
  assert.equal(level1.match(/color-mix\(/g)?.length, 3);
  assert.match(level1, /20%/);
  assert.match(level1, /14[^%]*%/);
  assert.match(level1, /12%/);
});
