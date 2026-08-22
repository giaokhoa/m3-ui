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

test('Figma, Compose and Material Web remain reference sources, not spec', () => {
  assert.equal(material3Sources.figma.kind, 'design-reference');
  assert.equal(material3Sources.compose.kind, 'implementation-reference');
  assert.equal(material3Sources.materialWeb.kind, 'implementation-reference');
  assert.notEqual(material3Sources.figma.kind, 'normative-text');
  assert.notEqual(material3Sources.compose.kind, 'normative-text');
  assert.notEqual(material3Sources.materialWeb.kind, 'normative-text');
});

test('source metadata is pinned so freshness decisions are reproducible', () => {
  assert.match(material3Sources.compose.revision, /^[0-9a-f]{40}$/);
  assert.match(material3Sources.materialWeb.revision, /^[0-9a-f]{40}$/);
  assert.match(material3Sources.figma.version, /^\d+\.\d+$/);
  assert.ok(sourceFreshness(material3Sources.compose) > sourceFreshness(material3Sources.figma));
  assert.ok(sourceFreshness(material3Sources.materialWeb) > sourceFreshness(material3Sources.figma));
});
