import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
}

test('Progress Indicator semantic colors alias canonical runtime roles', async () => {
  const progress = (await readJson('tokens/component/progress-indicator.json')).component.progressIndicator.base;

  assert.equal(progress.activeIndicatorColor.$value, '{color.role.primary}');
  assert.equal(progress.stopColor.$value, '{color.role.primary}');
  assert.equal(progress.trackColor.$value, '{color.role.secondaryContainer}');
});

test('generated Progress Indicator CSS owns immutable defaults', async () => {
  const css = await readFile(new URL('dist/generated/progress-indicator.css', packageRoot), 'utf8');

  assert.match(css, /\.progress-indicator \{/);
  assert.match(css, /--_progress-active-color: var\(--primary\);/);
  assert.match(css, /--_progress-track-color: var\(--secondary-container\);/);
  assert.match(css, /--_progress-stop-color: var\(--primary\);/);
  assert.match(css, /--_progress-active-radius: 9999px;/);
  assert.match(css, /--_progress-linear-active-thickness: 4px;/);
  assert.match(css, /--_progress-linear-track-thickness: 4px;/);
  assert.match(css, /--_progress-linear-gap: 4px;/);
  assert.match(css, /--_progress-linear-stop-size: 4px;/);
  assert.match(css, /--_progress-circular-active-thickness: 4px;/);
  assert.match(css, /--_progress-circular-track-thickness: 4px;/);
  assert.match(css, /--_progress-circular-gap: 4px;/);
  assert.match(css, /--_progress-four-color-1: var\(--primary\);/);
  assert.match(css, /--_progress-four-color-4: var\(--tertiary-container\);/);
  assert.match(css, /\.progress-indicator--linear \{[^}]*--_progress-linear-height: 4px;/s);
  assert.match(css, /\.progress-indicator--linear\.progress-indicator--wavy \{[^}]*--_progress-linear-height: 10px;/s);
  assert.match(css, /\.progress-indicator--circular \{[^}]*--_progress-circular-size: 40px;/s);
  assert.match(css, /--_progress-determinate-easing: cubic-bezier\(0, 0, 0\.2, 1\);/);
  assert.match(css, /\.progress-indicator--circular\.progress-indicator--wavy \{[^}]*--_progress-circular-size: 48px;/s);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});
