import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
const [review, figma, storybookManifest] = await Promise.all([
  readJson('audit/button-spec-lock-reconciliation.json'),
  readJson('audit/figma-button-evidence.json'),
  JSON.parse(await readFile(new URL('apps/storybook/package.json', repoRoot), 'utf8')),
]);

test('Button spec-lock ownership is layered instead of treating screenshots or UI literals as normative truth', () => {
  assert.equal(review.schemaVersion, 1);
  assert.equal(review.issue, 409);
  assert.equal(review.testOwnership.officialSourceAndCanonicalFacts.owner, 'token/source reconciliation tests');
  assert.match(review.testOwnership.uiRuntimeWiring.rule, /generated @m3-ui\/tokens/);
  assert.match(review.testOwnership.browserContracts.rule, /computed CSS\/state contracts/);
  assert.match(review.testOwnership.visualRegression.rule, /not normative Material-spec oracles/);
});

test('Button runtime and Storybook contract tests consume generated tokens instead of copied Material literals', async () => {
  const [runtimeTest, browserTest] = await Promise.all([
    readFile(new URL('packages/ui/src/components/Button/Button.runtime.test.ts', repoRoot), 'utf8'),
    readFile(new URL('apps/storybook/visual/button.visual.spec.ts', repoRoot), 'utf8'),
  ]);

  assert.match(runtimeTest, /import \* as token from '@m3-ui\/tokens'/);
  assert.doesNotMatch(runtimeTest, /'9999px'|'28px'|'16px'|'12px'|'8px'/);
  assert.doesNotMatch(runtimeTest, /'level[0-5]'/);
  assert.doesNotMatch(runtimeTest, /border-radius 166ms/);

  assert.match(browserTest, /import \* as token from '@m3-ui\/tokens'/);
  assert.match(browserTest, /ComponentButtonSizeExtraSmallHeight/);
  assert.match(browserTest, /ComponentButtonVariantOutlinedDisabledOutlineOpacity/);
  assert.match(browserTest, /token\.ShapeExtraLarge/);
  assert.doesNotMatch(browserTest, /latest active interaction/);
  assert.doesNotMatch(browserTest, /\['Square extra small', '12px', '8px'\]/);
});

test('Storybook declares and CI builds its direct generated-token test dependency', async () => {
  assert.equal(storybookManifest.devDependencies?.['@m3-ui/tokens'], 'workspace:*');
  const workflow = await readFile(new URL('.github/workflows/ci.yml', repoRoot), 'utf8');
  const visualJob = workflow.slice(workflow.indexOf('  visual:'), workflow.indexOf('  docs-browser:'));
  assert.match(visualJob, /Build generated token test dependency/);
  assert.match(visualJob, /pnpm --filter @m3-ui\/tokens build/);
  assert.ok(
    visualJob.indexOf('pnpm --filter @m3-ui/tokens build') <
      visualJob.indexOf('pnpm --filter @m3-ui/storybook exec playwright test'),
    'visual CI must build token dist before Playwright imports @m3-ui/tokens',
  );
});

test('unused Compose-style interaction-order adapter and history snapshots stay removed', async () => {
  for (const path of review.interactionHistoryCleanup.removedFiles) {
    await assert.rejects(access(new URL(path, repoRoot)));
  }
  for (const snapshot of review.interactionHistoryCleanup.removedSnapshots) {
    await assert.rejects(
      access(new URL(`apps/storybook/visual/__screenshots__/button.visual.spec.ts/${snapshot}`, repoRoot)),
    );
  }
  assert.equal(review.interactionHistoryCleanup.disposition, 'removed-dead-compose-ordering-adapter');
});

test('Figma Button audit records #409 as resolved while preserving source evidence ownership', () => {
  const entry = figma.reconciliation.trackedDrift.find((item) => item.id === 'button-storybook-spec-locks');
  assert.equal(entry?.status, 'resolved-layered-spec-locks');
  assert.match(entry?.decision ?? '', /generated tokens as expected values/);
});
