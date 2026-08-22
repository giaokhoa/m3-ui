import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
const coverage = JSON.parse(
  await readFile(new URL('../audit/material-web-coverage/slider-sizes.json', import.meta.url), 'utf8'),
);

test('Style Dictionary emits all five current Material slider size variants', async () => {
  const token = await import(`${generatedUrl.href}?sliderSizes=${Date.now()}`);
  assert.equal(token.ComponentSliderSizeXSmallActiveTrackHeight, '16px');
  assert.equal(token.ComponentSliderSizeSmallActiveTrackHeight, '24px');
  assert.equal(token.ComponentSliderSizeMediumActiveTrackHeight, '40px');
  assert.equal(token.ComponentSliderSizeLargeActiveTrackHeight, '56px');
  assert.equal(token.ComponentSliderSizeXLargeActiveTrackHeight, '96px');
  assert.equal(token.ComponentSliderSizeXSmallActiveHandleHeight, '44px');
  assert.equal(token.ComponentSliderSizeLargeActiveHandleHeight, '68px');
  assert.equal(token.ComponentSliderSizeXLargeActiveHandleHeight, '108px');
  assert.equal(token.ComponentSliderSizeMediumIconSize, '24px');
  assert.equal(token.ComponentSliderSizeXLargeIconSize, '32px');
});

test('slider size coverage records independent Figma and Material Web evidence', () => {
  assert.equal(coverage.status, 'reconciled');
  assert.equal(coverage.sources.length, 5);
  assert.deepEqual(coverage.evidence.figma.sizeVariants, ['XSmall', 'Small', 'Medium', 'Large', 'XLarge']);
  assert.equal(coverage.evidence.spec, 'not text-verified');
});
