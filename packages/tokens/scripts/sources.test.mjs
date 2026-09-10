import assert from 'node:assert/strict';
import test from 'node:test';
import {
  material3Sources,
  materialFreshnessScopes,
  sourceFreshness,
} from './sources.mjs';

test('material.io remains the normative textual spec', () => {
  assert.equal(material3Sources.spec.kind, 'normative-text');
  assert.equal(new URL(material3Sources.spec.origin).hostname, 'm3.material.io');
  for (const url of Object.values(material3Sources.spec.pages)) {
    assert.equal(new URL(url).hostname, 'm3.material.io');
  }
});

test('Figma and implementation corpora remain reference sources, not spec', () => {
  assert.equal(material3Sources.figma.kind, 'design-reference');
  for (const source of [
    material3Sources.compose,
    material3Sources.materialWeb,
    material3Sources.materialComponentsAndroid,
    material3Sources.flutter,
  ]) {
    assert.equal(source.kind, 'implementation-reference');
    assert.notEqual(source.kind, 'normative-text');
  }
  assert.notEqual(material3Sources.figma.kind, 'normative-text');
});

test('source metadata is pinned so freshness decisions are reproducible', () => {
  for (const source of [
    material3Sources.compose,
    material3Sources.materialWeb,
    material3Sources.materialComponentsAndroid,
    material3Sources.flutter,
  ]) {
    assert.match(source.revision, /^[0-9a-f]{40}$/);
    assert.ok(Number.isFinite(sourceFreshness(source)));
  }
  assert.match(material3Sources.figma.version, /^\d+\.\d+$/);
  assert.ok(sourceFreshness(material3Sources.compose) > sourceFreshness(material3Sources.figma));
  assert.ok(sourceFreshness(material3Sources.materialWeb) > sourceFreshness(material3Sources.figma));
  assert.ok(sourceFreshness(material3Sources.materialComponentsAndroid) > sourceFreshness(material3Sources.figma));
  assert.ok(sourceFreshness(material3Sources.flutter) > sourceFreshness(material3Sources.figma));
});

test('freshness scopes reference reviewed pins and only relevant Material paths', () => {
  assert.deepEqual(
    materialFreshnessScopes.map((scope) => scope.id),
    [
      'androidx-material3-core',
      'androidx-material3-adaptive',
      'material-web-generated',
    ],
  );

  for (const scope of materialFreshnessScopes) {
    assert.ok(material3Sources[scope.source]);
    assert.ok(scope.paths.length > 0);
    assert.ok(scope.paths.every((path) => !path.startsWith('/') && !path.includes('..')));
  }

  const core = materialFreshnessScopes.find((scope) => scope.id === 'androidx-material3-core');
  const adaptive = materialFreshnessScopes.find(
    (scope) => scope.id === 'androidx-material3-adaptive',
  );
  const materialWeb = materialFreshnessScopes.find(
    (scope) => scope.id === 'material-web-generated',
  );

  assert.equal(core.source, 'compose');
  assert.equal(core.upstreamRef, 'androidx-main');
  assert.ok(core.paths.includes('compose/material3/material3'));
  assert.ok(core.paths.includes('compose/material3/material3-ripple'));

  assert.equal(adaptive.source, 'compose');
  assert.equal(adaptive.upstreamRef, 'androidx-main');
  assert.deepEqual(adaptive.paths, [
    'compose/material3/adaptive/adaptive',
    'compose/material3/adaptive/adaptive-layout',
    'compose/material3/adaptive/adaptive-navigation',
    'compose/material3/material3-adaptive-navigation-suite',
  ]);

  assert.equal(materialWeb.source, 'materialWeb');
  assert.equal(materialWeb.upstreamRef, 'main');
  assert.deepEqual(materialWeb.paths, [material3Sources.materialWeb.latestGeneratedRoot]);
});
