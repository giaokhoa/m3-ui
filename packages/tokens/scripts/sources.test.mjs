import assert from 'node:assert/strict';
import test from 'node:test';
import { material3Sources, sourceFreshness } from './sources.mjs';

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
