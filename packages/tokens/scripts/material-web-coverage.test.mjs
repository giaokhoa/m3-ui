import assert from 'node:assert/strict';
import test from 'node:test';
import { loadMaterialWebCoverage } from './material-web-coverage-model.mjs';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Material Web coverage exactly dispositions the pinned 177-module denominator', async () => {
  const coverage = await loadMaterialWebCoverage();
  assert.equal(coverage.counts.all, 177);
  assert.equal(coverage.counts.classified, 177);
  assert.equal(coverage.counts.reconciled, 164);
  assert.equal(coverage.counts.excluded, 13);
  assert.equal(coverage.counts.outsideExcluded, 2);
  assert.equal(coverage.componentSetMatches, true);
  assert.equal(coverage.outsideSetMatches, true);
  assert.deepEqual(coverage.duplicates, []);
  assert.deepEqual(coverage.invalid, []);
});

test('Style Dictionary emits canonical Web-only current-family tokens', async () => {
  const token = await import(`${generatedUrl.href}?materialWeb=${Date.now()}`);
  assert.equal(token.ComponentCarouselItemContainerShape, 'extraLarge');
  assert.equal(token.ComponentSheetSideDockedContainerWidth, '256px');
  assert.equal(token.ComponentDatePickerDockedContainerHeight, '456px');
  assert.equal(token.ComponentDataTableRowItemContainerHeight, '52px');
  assert.equal(token.ComponentBannersBasicContainerHeight, '56px');
  assert.equal(token.ComponentFullScreenDialogHeaderContainerHeight, '56px');
  assert.equal(token.ComponentSelectFilledMenuContainerElevation, 'level2');
  assert.equal(token.ComponentMenuButtonOutlinedOutlineWidth, '1px');
});
