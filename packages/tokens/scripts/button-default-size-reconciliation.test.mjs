import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
const [reconciliation, sizes, baseline, figma, uiManifest] = await Promise.all([
  readJson('audit/button-default-size-reconciliation.json'),
  readJson('tokens/component/button/sizes.json'),
  readJson('tokens/component/button/base.json'),
  readJson('audit/figma-button-evidence.json'),
  JSON.parse(await readFile(new URL('../../ui/package.json', import.meta.url), 'utf8')),
]);

function dimension(token) {
  assert.equal(token?.$type, 'dimension');
  assert.equal(token?.$value?.unit, 'px');
  return token.$value.value;
}

test('Button public default-size decision is explicitly pre-public and points to current Small', () => {
  assert.equal(reconciliation.schemaVersion, 1);
  assert.equal(reconciliation.issue, 407);
  assert.equal(reconciliation.decision.publicDefaultSize, 'small');
  assert.equal(reconciliation.decision.disposition, 'current-design-default-before-publication');
  assert.equal(uiManifest.private, true);
  assert.equal(uiManifest.version, '0.0.0');
  assert.equal(uiManifest.publishConfig, undefined);
  assert.deepEqual(reconciliation.decision.packageState, {
    private: true,
    version: '0.0.0',
    published: false,
  });
});

test('Figma authoring default and current Web/Compose expressive Small agree on the public size family', () => {
  for (const defaults of Object.values(figma.defaultProperties)) {
    assert.equal(defaults.size, 'Small');
  }
  assert.deepEqual(reconciliation.figma.allSetsDefault, {
    type: 'Round',
    size: 'Small',
    state: 'Enabled',
  });
  assert.equal(reconciliation.figma.small.containerHeight, 40);
  assert.equal(reconciliation.figma.small.iconSize, 20);
  assert.equal(reconciliation.compose.expressiveSmall.containerHeight, 40);
  assert.equal(reconciliation.compose.expressiveSmall.iconSize, 20);
  assert.equal(reconciliation.materialWeb.latestSmall.containerHeight, 40);
  assert.equal(reconciliation.materialWeb.latestSmall.iconSize, 20);
});

test('canonical Small DTCG matches the reviewed current default without rewriting legacy baseline evidence', () => {
  const small = sizes.component.button.size.small;
  assert.equal(dimension(small.height), reconciliation.canonical.small.containerHeight);
  assert.equal(dimension(small.iconSize), reconciliation.canonical.small.iconSize);
  assert.equal(dimension(small.padding.inlineStart), reconciliation.canonical.small.paddingInline);
  assert.equal(dimension(small.padding.inlineEnd), reconciliation.canonical.small.paddingInline);
  assert.equal(dimension(small.padding.block), reconciliation.canonical.small.paddingBlock);
  assert.equal(dimension(small.iconSpacing), reconciliation.canonical.small.iconSpacing);
  assert.equal(small.typography.$value, reconciliation.canonical.small.typography);

  const legacy = baseline.component.button.baseline;
  assert.equal(reconciliation.canonical.legacyBaselineRetained, true);
  assert.equal(dimension(legacy.minHeight), reconciliation.compose.classic.containerHeight);
  assert.equal(dimension(legacy.iconSize), reconciliation.compose.classic.iconSize);
  assert.equal(dimension(legacy.padding.inlineStart), reconciliation.compose.classic.paddingInline);
  assert.equal(dimension(legacy.padding.block), reconciliation.compose.classic.paddingBlock);
});

test('legacy public Material Web and Compose classic defaults remain source evidence, not current React defaults', () => {
  assert.equal(reconciliation.materialWeb.publicRuntime.tokenGeneration, 'v0_192');
  assert.equal(reconciliation.materialWeb.publicRuntime.sizeProperty, false);
  assert.equal(reconciliation.materialWeb.publicRuntime.iconSize, 18);
  assert.equal(reconciliation.compose.classic.iconSize, 18);
  assert.match(reconciliation.compose.iconSizeTodo, /TODO/);
  assert.equal(reconciliation.canonical.reactDefaultSize, 'small');
  assert.match(reconciliation.canonical.legacyBaselineRole, /not public React default/);
});
