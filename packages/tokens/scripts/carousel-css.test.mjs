import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('consumed Carousel container color aliases the canonical runtime role', async () => {
  const carousel = (await readJson('tokens/component/carousel.json')).component.carouselItem;
  assert.equal(carousel.containerColor.$value, '{color.role.surface}');
});

test('generated JS resolves Carousel container alias to ThemeProvider runtime expression', async () => {
  const generated = await import(
    `${new URL('dist/generated/tokens.js', packageRoot).href}?carousel=${Date.now()}`
  );

  assert.equal(generated.ComponentCarouselItemContainerColor, 'var(--surface)');
});

test('generated Carousel CSS owns the immutable default with a concrete consumer', async () => {
  const css = await readFile(new URL('dist/generated/carousel.css', packageRoot), 'utf8');

  assert.match(css, /\.carousel \{/);
  assert.match(css, /--_carousel-container-color: var\(--surface\);/);
  assert.doesNotMatch(css, /outline|disabled|state-layer/i);
  assert.doesNotMatch(css, /(^|\s)--surface\s*:/m);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
