import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Divider color aliases the canonical runtime role', async () => {
  const divider = (await readJson('tokens/component/divider.json')).component.divider;
  assert.equal(divider.color.$value, '{color.role.outlineVariant}');
});

test('generated JS resolves Divider semantic alias to ThemeProvider runtime expression', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?divider=${Date.now()}`
  );

  assert.equal(generated.ComponentDividerColor, 'var(--outline-variant)');
  assert.equal(generated.ComponentDividerThickness, '1px');
});

test('generated Divider CSS owns immutable color and thickness', async () => {
  const css = await readFile(new URL('dist/generated/divider.css', packageRoot), 'utf8');

  assert.match(css, /\.divider \{/);
  assert.match(css, /--_divider-color: var\(--outline-variant\);/);
  assert.match(css, /--_divider-thickness: 1px;/);
  assert.doesNotMatch(css, /(^|\s)--outline-variant\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
