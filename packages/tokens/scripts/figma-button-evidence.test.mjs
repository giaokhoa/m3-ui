import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(resolve(scriptDir, path), 'utf8'));
const [evidence, sizes, variants, shape, state, materialWebDrift] = await Promise.all([
  readJson('../audit/figma-button-evidence.json'),
  readJson('../tokens/component/button/sizes.json'),
  readJson('../tokens/component/button/variants.json'),
  readJson('../tokens/core/shape.json'),
  readJson('../tokens/core/state.json'),
  readJson('../audit/material-web-button-variant-drift.json'),
]);

const canonicalSizes = sizes.component.button.size;
const canonicalVariants = variants.component.button.variant;
const shapeValues = Object.fromEntries(
  Object.entries(shape.shape.corner)
    .filter(([, value]) => typeof value?.$value === 'object' && 'value' in value.$value)
    .map(([name, value]) => [name, value.$value.value]),
);

const componentKeys = material3Sources.figma.components.button;

function dimensionValue(token) {
  assert.equal(token?.$type, 'dimension');
  assert.equal(token?.$value?.unit, 'px');
  return token.$value.value;
}

function drift(id) {
  return evidence.reconciliation.trackedDrift.find((entry) => entry.id === id);
}

test('Button Figma evidence stays pinned to the reviewed Material 3 Design Kit source', () => {
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(evidence.source[field], material3Sources.figma[field], field);
  }
  assert.equal(evidence.source.verifiedAt, '2026-09-12');
  assert.equal(evidence.method.sourceLibraryReadOnly, true);
  assert.equal(evidence.method.scratchFileKeyPersisted, false);
  assert.match(evidence.method.tool, /search_design_system/);
  assert.match(evidence.method.tool, /use_figma/);
  assert.match(evidence.method.tool, /get_variable_defs/);
  assert.equal(material3Sources.spec.pages.buttonsOverview, 'https://m3.material.io/components/buttons/overview');
  assert.equal(material3Sources.spec.pages.buttonsSpecs, 'https://m3.material.io/components/buttons/specs');

  assert.deepEqual(
    Object.fromEntries(Object.entries(evidence.componentSets).map(([name, value]) => [name, value.key])),
    componentKeys,
  );
  assert.equal(new Set(Object.values(componentKeys)).size, 5);
  for (const key of Object.values(componentKeys)) assert.match(key, /^[0-9a-f]{40}$/);
});

test('Figma Button component sets retain the complete published variant contract', () => {
  assert.deepEqual(evidence.variantContract.types, ['Round', 'Square']);
  assert.deepEqual(evidence.variantContract.sizes, ['XSmall', 'Small', 'Medium', 'Large', 'XLarge']);
  assert.deepEqual(evidence.variantContract.states, ['Enabled', 'Hovered', 'Focused', 'Pressed', 'Disabled']);
  assert.equal(evidence.variantContract.variantsPerSet, 50);
  assert.equal(Object.keys(evidence.componentSets).length, 5);
  assert.equal(evidence.componentSets.outlined.publishedPressedVariantSpelling, 'Presssed');
});

test('reviewed Figma expressive Button size facts match canonical DTCG', () => {
  for (const [size, figma] of Object.entries(evidence.sizes)) {
    const canonical = canonicalSizes[size];
    assert.ok(canonical, `missing canonical Button size ${size}`);
    assert.equal(dimensionValue(canonical.height), figma.containerHeight, `${size}.height`);
    assert.equal(dimensionValue(canonical.padding.block), figma.paddingBlock, `${size}.padding.block`);
    assert.equal(dimensionValue(canonical.padding.inlineStart), figma.paddingInline, `${size}.padding.inlineStart`);
    assert.equal(dimensionValue(canonical.padding.inlineEnd), figma.paddingInline, `${size}.padding.inlineEnd`);
    assert.equal(dimensionValue(canonical.iconSize), figma.iconSize, `${size}.iconSize`);
    assert.equal(dimensionValue(canonical.iconSpacing), figma.iconSpacing, `${size}.iconSpacing`);
    assert.equal(canonical.typography.$value, figma.typography, `${size}.typography`);
  }

  assert.equal(evidence.sizes.extraSmall.outerFrameHeight, 48);
  assert.equal(evidence.sizes.small.outerFrameHeight, 48);
  assert.equal(evidence.sizes.extraSmall.containerHeight, 32);
  assert.equal(evidence.sizes.small.containerHeight, 40);
});

test('reviewed Figma Button shape matrix maps to the canonical shape scale', () => {
  for (const [size, matrix] of Object.entries(evidence.shapes)) {
    assert.equal(matrix.round.enabled.semantic, 'full', `${size}.round.enabled`);
    assert.equal(matrix.round.enabled.radius, 100, `${size}.round enabled Figma radius`);
    assert.equal(matrix.round.pressed.radius, shapeValues[matrix.round.pressed.semantic], `${size}.round.pressed`);
    assert.equal(matrix.square.enabled.radius, shapeValues[matrix.square.enabled.semantic], `${size}.square.enabled`);
    assert.equal(matrix.square.pressed.radius, shapeValues[matrix.square.pressed.semantic], `${size}.square.pressed`);
    assert.equal(
      canonicalSizes[size].pressedShape.$value,
      matrix.round.pressed.semantic,
      `${size} canonical pressed-shape semantic differs from Figma`,
    );
  }
});

test('reviewed Figma state-layer opacities match canonical state roles', () => {
  const observed = evidence.smallStates.stateLayerOpacity;
  assert.equal(observed.hovered, state.state.layer.opacity.hover.$value);
  assert.equal(observed.focused, state.state.layer.opacity.focus.$value);
  assert.equal(evidence.smallStates.pressedStaticMock.stateLayerOpacity, state.state.layer.opacity.hover.$value);
  assert.equal(evidence.smallStates.pressedStaticMock.rippleOpacity, state.state.layer.opacity.pressed.$value);
  assert.match(evidence.smallStates.pressedStaticMock.note, /Compose StateTokens\.PressedStateLayerOpacity/);
  assert.match(evidence.smallStates.pressedStaticMock.note, /Material Web/);
});

test('enabled Button variant roles agree between Figma and canonical DTCG', () => {
  const expected = {
    filled: ['primary', 'onPrimary'],
    elevated: ['surfaceContainerLow', 'primary'],
    filledTonal: ['secondaryContainer', 'onSecondaryContainer'],
    outlined: ['transparent', 'onSurfaceVariant'],
    text: ['transparent', 'primary'],
  };
  for (const [variant, [container, content]] of Object.entries(expected)) {
    const observed = evidence.smallStates[variant].enabled;
    const canonical = canonicalVariants[variant];
    assert.equal(observed.containerRole, container, `${variant}.containerRole`);
    assert.equal(observed.contentRole, content, `${variant}.contentRole`);
    const canonicalContainer = String(canonical.containerColor.$value).replace('{color.role.', '').replace('}', '');
    const canonicalContent = String(canonical.contentColor.$value).replace('{color.role.', '').replace('}', '');
    assert.equal(canonicalContainer, container, `${variant}.canonical container`);
    assert.equal(canonicalContent, content, `${variant}.canonical content`);
  }
  assert.equal(evidence.smallStates.outlined.enabled.outlineRole, 'outlineVariant');
  assert.equal(canonicalVariants.outlined.outlineColor.$value, '{color.role.outlineVariant}');
});

test('Button Figma conflicts stay explicit and tracked instead of silently rewriting canonical tokens', () => {
  assert.deepEqual(
    evidence.reconciliation.trackedDrift.map((entry) => [entry.id, entry.issue, entry.status]),
    [
      ['button-disabled-content-role', 406, 'resolved-web-reference'],
      ['button-text-disabled-container', 406, 'resolved-runtime-adaptation'],
      ['button-outlined-disabled-presentation', 406, 'resolved-mixed-runtime-adaptation'],
      ['button-default-small-icon-size', 407, 'unresolved'],
      ['button-square-size-helper', 408, 'unresolved'],
      ['button-storybook-spec-locks', 409, 'unresolved'],
    ],
  );

  assert.equal(drift('button-disabled-content-role').figma, 'onSurface @ 0.38');
  assert.equal(drift('button-text-disabled-container').figma, 'onSurface @ 0.10');
  assert.match(drift('button-outlined-disabled-presentation').figma, /outlineVariant @ 1/);

  const materialWebIds = new Set((materialWebDrift.drift ?? []).map((entry) => entry.id));
  assert.ok(materialWebIds.has('button-filled-disabled-label-color'));
  assert.ok(materialWebIds.has('button-text-disabled-container-color'));
  assert.ok(materialWebIds.has('button-outlined-disabled-label-color'));

  assert.equal(canonicalVariants.filled.disabledContentColor.$value, '{color.role.onSurface}');
  assert.equal(canonicalVariants.text.disabledContainerColor.$value, 'transparent');
  assert.equal(canonicalVariants.outlined.disabledContainerColor.$value, 'transparent');
  assert.equal(canonicalVariants.outlined.disabledOutlineOpacity.$value, 0.1);
});
