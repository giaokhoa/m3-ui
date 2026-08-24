import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
const spec = JSON.parse(await readFile(new URL('../spec/material-io-homepage.json', import.meta.url), 'utf8'));
const shapes = JSON.parse(await readFile(new URL('../audit/expressive-shapes.json', import.meta.url), 'utf8'));

async function generated() {
  return import(`${generatedUrl.href}?spec=${Date.now()}`);
}

test('normative claims are sourced only from m3.material.io', () => {
  assert.equal(spec.source.kind, 'normative-text');
  assert.equal(new URL(spec.source.url).hostname, 'm3.material.io');
  assert.equal(spec.claims.shapeLibrary.count, 35);
  assert.equal(spec.claims.shapeLibrary.supportsMorph, true);
  assert.equal(spec.claims.motionPhysics.poweredByTokens, true);
});

test('generated corpus contains token-powered Material motion physics', async () => {
  const token = await generated();
  assert.ok(Object.hasOwn(token, 'MotionSpringStandardDefaultSpatialStiffness'));
  assert.ok(Object.hasOwn(token, 'MotionSpringStandardFastEffectsStiffness'));
  assert.ok(Object.hasOwn(token, 'MotionSpringExpressiveDefaultSpatialStiffness'));
  assert.ok(Object.hasOwn(token, 'MotionSpringExpressiveSlowSpatialStiffness'));
});

test('generated corpus covers the expressive component families named by the homepage', async () => {
  const token = await generated();
  assert.ok(Object.hasOwn(token, 'ComponentToolbarDockedContainerHeight'));
  assert.ok(Object.hasOwn(token, 'ComponentSplitButtonSizeSmallContainerHeight'));
  assert.ok(Object.hasOwn(token, 'ComponentProgressIndicatorBaseActiveIndicatorColor'));
  assert.ok(Object.hasOwn(token, 'ComponentButtonGroupSmallContainerHeight'));
});

test('the 35-shape homepage claim is audited as design primitives, not misrepresented as DTCG tokens', () => {
  assert.equal(shapes.spec.expectedCount, spec.claims.shapeLibrary.count);
  assert.equal(shapes.figma.count, 35);
  assert.equal(shapes.compose.count, 35);
  assert.equal(new Set(shapes.figma.shapes).size, 35);
  assert.equal(new Set(shapes.compose.shapes).size, 35);
});
