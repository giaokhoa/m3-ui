import assert from 'node:assert/strict';
import test from 'node:test';

const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);

test('Style Dictionary emits current progress and loading indicator families', async () => {
  const token = await import(`${generatedUrl.href}?progress=${Date.now()}`);
  assert.equal(token.ComponentProgressIndicatorBaseActiveIndicatorColor, 'var(--primary)');
  assert.equal(token.ComponentProgressIndicatorBaseTrackColor, 'var(--secondary-container)');
  assert.equal(token.ComponentProgressIndicatorCircularActiveThickness, '4px');
  assert.equal(token.ComponentProgressIndicatorCircularActiveWaveAmplitude, '1.6px');
  assert.equal(token.ComponentProgressIndicatorCircularActiveWaveWavelength, '15px');
  assert.equal(token.ComponentProgressIndicatorCircularWaveSize, '48px');
  assert.equal(token.ComponentProgressIndicatorLinearActiveWaveAmplitude, '3px');
  assert.equal(token.ComponentProgressIndicatorLinearActiveWaveWavelength, '40px');
  assert.equal(token.ComponentProgressIndicatorLinearIndeterminateActiveWaveWavelength, '20px');
  assert.equal(token.ComponentProgressIndicatorLinearWaveHeight, '10px');
  assert.equal(token.ComponentLoadingIndicatorActiveSize, '38px');
  assert.equal(token.ComponentLoadingIndicatorContainedActiveColor, 'var(--on-primary-container)');
  assert.equal(token.ComponentLoadingIndicatorContainerHeight, '48px');
  assert.equal(token.ComponentLoadingIndicatorContainerShape, 'full');
});
