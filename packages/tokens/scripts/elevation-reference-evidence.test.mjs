import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/elevation-reference-evidence.json'), 'utf8'));
const foundationDrift = JSON.parse(await readFile(resolve(scriptDir, '../audit/foundation-drift.json'), 'utf8'));
const canonical = JSON.parse(await readFile(resolve(scriptDir, '../tokens/core/elevation.json'), 'utf8')).elevation;

function dimensionValue(token) {
  return token.$value.value;
}

function canonicalSemanticLevels() {
  return Array.from({ length: 6 }, (_, level) => dimensionValue(canonical[`level${level}`]));
}

function canonicalShadow(level) {
  const layers = canonical.shadow[`level${level}`];
  return Object.values(layers).map((layer) => ({
    offsetX: dimensionValue(layer.offsetX),
    offsetY: dimensionValue(layer.offsetY),
    blurRadius: dimensionValue(layer.blurRadius),
    spreadRadius: dimensionValue(layer.spreadRadius),
    opacity: layer.opacity.$value,
  }));
}

function normalizedFigmaRecipe(style) {
  const normalize = (effect) => ({
    offsetX: effect.offsetX,
    offsetY: effect.offsetY,
    blurRadius: effect.blurRadius,
    spreadRadius: effect.spreadRadius,
    opacity: effect.opacity,
  });
  const key = style.effects.find((effect) => effect.opacity === 0.3);
  const ambient = style.effects.find((effect) => effect.opacity === 0.15);
  assert.ok(key, `${style.name} is missing the 0.30 key shadow`);
  assert.ok(ambient, `${style.name} is missing the 0.15 ambient shadow`);
  return { key: normalize(key), ambient: normalize(ambient) };
}

function elevationDrift(id) {
  return foundationDrift.elevation.drift.find((entry) => entry.id === id);
}

test('elevation reference evidence stays pinned, read-only, and outside the canonical build graph', () => {
  assert.equal(evidence.status, 'reference-audit');
  assert.equal(evidence.buildInput, false);
  assert.match(evidence.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);

  for (const field of ['kind', 'name', 'repository', 'revision', 'revisionAt']) {
    assert.equal(evidence.androidxCompose[field], material3Sources.compose[field], `Compose ${field} pin mismatch`);
    assert.equal(evidence.materialWeb[field], material3Sources.materialWeb[field], `Material Web ${field} pin mismatch`);
  }
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(evidence.figmaMaterial3Kit[field], material3Sources.figma[field], `Figma ${field} pin mismatch`);
  }
  assert.equal(evidence.materialWeb.latestGenerated.version, material3Sources.materialWeb.latestGeneratedVersion);
  assert.equal(evidence.materialWeb.publicAdapter.version, material3Sources.materialWeb.publicAdapterVersion);
  assert.equal(evidence.figmaMaterial3Kit.readOnly, true);
  assert.equal(JSON.stringify(evidence).includes('T4NuERAoU056MwShPtFpGx'), false, 'scratch Figma file key must never be persisted');
});

test('canonical semantic elevation levels exactly agree with pinned Compose and Material Web generated values', () => {
  const canonicalLevels = canonicalSemanticLevels();
  assert.deepEqual(canonicalLevels, [0, 1, 3, 6, 8, 12]);
  assert.deepEqual(evidence.androidxCompose.semanticLevelDp, canonicalLevels);
  assert.deepEqual(evidence.materialWeb.latestGenerated.semanticLevelPx, canonicalLevels);
  assert.deepEqual(evidence.materialWeb.publicAdapter.generatedSemanticLevelPx, canonicalLevels);
  assert.deepEqual(evidence.reconciliation.semanticLevels, {
    canonicalVsComposeMatches: 6,
    canonicalVsMaterialWebLatestMatches: 6,
    mismatches: 0,
  });
});

test('Material Web public elevation API deliberately remaps semantic dp values to ordinal levels', () => {
  const adapter = evidence.materialWeb.publicAdapter;
  assert.equal(adapter.wrapperPath, 'tokens/_md-sys-elevation.scss');
  assert.equal(adapter.generatedPath, 'tokens/versions/v0_192/_md-sys-elevation.scss');
  assert.deepEqual(adapter.publicLevelApi, [0, 1, 2, 3, 4, 5]);
  assert.equal(adapter.explicitlyRemapsDpToLevelNumber, true);
  assert.deepEqual(evidence.reconciliation.materialWebPublicAdapter, {
    semanticValuesPreservedBehindAdapter: true,
    ordinalApiRemap: true,
  });

  const drift = elevationDrift('elevation-web-level-api');
  assert.ok(drift, 'missing Material Web elevation API drift record');
  assert.equal(drift.classification, 'platform-adaptation');
});

test('all ten Figma Light/Dark elevation effect styles normalize to the five Material Web renderer recipes', () => {
  const figma = evidence.figmaMaterial3Kit;
  const webRecipes = evidence.materialWeb.renderer.normalizedByLevel;
  assert.deepEqual(figma.publishedSearch, { query: 'elevation', variables: 0, styles: 10, effectStyles: 10 });
  assert.equal(figma.effectStyles.length, 10);
  assert.equal(new Set(figma.effectStyles.map((style) => style.key)).size, 10);
  assert.deepEqual(Object.keys(figma.normalizedByLevel), ['1', '2', '3', '4', '5']);
  assert.deepEqual(figma.normalizedByLevel, webRecipes);
  assert.equal(evidence.materialWeb.renderer.shadowLayerCount, 2);
  assert.deepEqual(evidence.materialWeb.renderer.shadowOpacities, [0.3, 0.15]);

  for (const style of figma.effectStyles) {
    assert.match(style.key, /^[a-f0-9]{40}$/);
    assert.equal(style.effects.length, 2, `${style.name} should contain exactly two shadow layers`);
    assert.ok(style.effects.every((effect) => effect.type === 'DROP_SHADOW'));
    assert.deepEqual(normalizedFigmaRecipe(style), webRecipes[String(style.level)], `${style.name} no longer matches Material Web renderer geometry`);
  }

  for (const level of [1, 2, 3, 4, 5]) {
    const light = figma.effectStyles.find((style) => style.theme === 'light' && style.level === level);
    const dark = figma.effectStyles.find((style) => style.theme === 'dark' && style.level === level);
    assert.ok(light && dark, `missing Light/Dark Figma pair for elevation level ${level}`);
    assert.deepEqual(normalizedFigmaRecipe(light), normalizedFigmaRecipe(dark));
  }

  assert.deepEqual(evidence.reconciliation.figmaVsMaterialWebRenderer, {
    publishedEffectStyles: 10,
    styleMatches: 10,
    uniqueLevelRecipeMatches: 5,
    lightDarkEquivalentLevels: 5,
    mismatches: 0,
  });
});

test('canonical three-layer shadow recipes remain explicit cross-source drift pending normative material.io review', () => {
  assert.deepEqual(evidence.canonicalSummary.semanticLevelPx, canonicalSemanticLevels());
  assert.equal(evidence.canonicalSummary.shadowLayerCount, 3);
  assert.deepEqual(evidence.canonicalSummary.shadowOpacities, [0.2, 0.14, 0.12]);

  for (const level of [1, 2, 3, 4, 5]) {
    const canonicalLayers = canonicalShadow(level);
    assert.equal(canonicalLayers.length, 3);
    assert.deepEqual(canonicalLayers.map((layer) => layer.opacity), [0.2, 0.14, 0.12]);
    assert.notDeepEqual(canonicalLayers, Object.values(evidence.materialWeb.renderer.normalizedByLevel[String(level)]));
  }

  assert.deepEqual(evidence.reconciliation.canonicalVsFigmaMaterialWebRenderer, {
    levelsCompared: 5,
    exactRecipeMatches: 0,
    mismatches: 5,
    canonicalLayers: 3,
    referenceLayers: 2,
    canonicalMutationRequired: false,
    preferredReference: 'normative-spec-review',
  });

  const drift = elevationDrift('elevation-figma-shadow-recipe');
  assert.ok(drift, 'missing elevation shadow recipe drift record');
  assert.equal(drift.classification, 'cross-source-value-drift');
  assert.equal(drift.preferredReference, 'normative-spec-review');
});
