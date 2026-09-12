import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
const [review, figma, expressive] = await Promise.all([
  readJson('audit/button-shape-pointer-reconciliation.json'),
  readJson('audit/figma-button-evidence.json'),
  readJson('tokens/component/button/web-expressive.json'),
]);
const canonical = expressive.component.button.size;

const shapeRadius = { full: 9999, small: 8, medium: 12, large: 16, extraLarge: 28 };

test('Button Square helper decision is pinned to all three reviewed official implementation/design sources', () => {
  assert.equal(review.schemaVersion, 1);
  assert.equal(review.issue, 408);
  assert.equal(review.shapeDecision.disposition, 'supported-canonical-helper');
  assert.deepEqual(review.shapeDecision.types, ['round', 'square']);
  assert.deepEqual(review.shapeDecision.sizes, ['extraSmall', 'small', 'medium', 'large', 'extraLarge']);
  assert.equal(review.sources.figma.version, '1.25');
  assert.equal(review.sources.materialWeb.revision, 'cac97678831d48d4eb4a606ca50f92673a1dc20c');
  assert.equal(review.sources.compose.revision, '059f5aff7b57aa6dc164065e53c55934bec4ee22');
});

test('canonical DTCG Square/pressed shapes match Figma radii for all five sizes', () => {
  for (const [size, expected] of Object.entries(review.shapeMatrix)) {
    const figmaShape = figma.shapes[size];
    assert.equal(canonical[size].containerShapeRound.$value, expected.round, `${size}.round`);
    assert.equal(canonical[size].containerShapeSquare.$value, expected.square, `${size}.square`);
    assert.equal(shapeRadius[canonical[size].containerShapeSquare.$value], expected.squareRadiusPx, `${size}.squareRadius`);
    assert.equal(figmaShape.square.enabled.semantic, expected.square, `${size}.figmaSquare`);
    assert.equal(figmaShape.square.enabled.radius, expected.squareRadiusPx, `${size}.figmaSquareRadius`);
    assert.equal(figmaShape.square.pressed.semantic, expected.pressed, `${size}.figmaPressed`);
    assert.equal(figmaShape.square.pressed.radius, expected.pressedRadiusPx, `${size}.figmaPressedRadius`);
  }
});

test('precision-pointer compaction stays an explicit Android device-policy exclusion on web', async () => {
  const decision = review.precisionPointerDecision;
  assert.equal(decision.disposition, 'excluded-android-device-policy');
  assert.equal(decision.composeButtonEffect.smallMinHeightDp.normal, 40);
  assert.equal(decision.composeButtonEffect.smallMinHeightDp.precisionPointer, 36);
  assert.equal(decision.composeButtonEffect.smallVerticalPaddingDp.normal, 10);
  assert.equal(decision.composeButtonEffect.smallVerticalPaddingDp.precisionPointer, 8);
  assert.match(decision.composeTrigger, /keyboard present AND physical mouse present/);
  assert.match(decision.reason, /not semantically equivalent/);

  const [buttonTsx, buttonCss] = await Promise.all([
    readFile(new URL('../../ui/src/components/Button/Button.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../ui/src/components/Button/button.css', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(buttonTsx, /matchMedia|pointerType|precisionPointer/i);
  assert.doesNotMatch(buttonCss, /@media\s*\(\s*(?:any-)?pointer\s*:\s*fine/i);
});

test('Figma #408 tracked drift is resolved without claiming precision-pointer parity', () => {
  const entry = figma.reconciliation.trackedDrift.find((item) => item.id === 'button-square-size-helper');
  assert.equal(entry?.status, 'resolved-square-helper');
  assert.match(entry?.canonical ?? '', /buttonShapesForSize/);
  assert.equal(review.precisionPointerDecision.canonicalWebBehavior, 'no automatic Button density/size change based on pointer hardware');
});
