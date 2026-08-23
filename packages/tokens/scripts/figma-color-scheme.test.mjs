import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(resolve(scriptDir, path), 'utf8'));

const [figmaEvidence, referenceEvidence, colorDoc, baselineDoc, paletteDoc, foundationDrift] = await Promise.all([
  readJson('../audit/figma-color-scheme-evidence.json'),
  readJson('../audit/color-light-on-container-reference-evidence.json'),
  readJson('../tokens/core/color.json'),
  readJson('../tokens/core/baseline-scheme.json'),
  readJson('../tokens/core/palette.json'),
  readJson('../audit/foundation-drift.json'),
]);

const normalizeHex = (value) => typeof value === 'string' ? value.toUpperCase() : value;
const canonicalRoot = { ...paletteDoc, ...baselineDoc };

function atPath(root, path) {
  return path.split('.').reduce((value, segment) => value?.[segment], root);
}

function resolveCanonical(value, seen = new Set()) {
  const raw = value && typeof value === 'object' && '$value' in value ? value.$value : value;
  if (typeof raw !== 'string') return raw;
  const match = raw.match(/^\{(.+)\}$/);
  if (!match) return raw;
  if (seen.has(match[1])) throw new Error(`Alias cycle while resolving ${match[1]}`);
  const next = atPath(canonicalRoot, match[1]);
  if (next === undefined) throw new Error(`Missing canonical alias target ${match[1]}`);
  return resolveCanonical(next, new Set([...seen, match[1]]));
}

function aliasPath(value) {
  const raw = value?.$value;
  const match = typeof raw === 'string' ? raw.match(/^\{(.+)\}$/) : null;
  return match?.[1] ?? null;
}

test('Figma color scheme evidence stays pinned, read-only, and records the complete M3 mode inventory', () => {
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(figmaEvidence.source[field], material3Sources.figma[field], field);
  }
  assert.equal(figmaEvidence.source.verifiedAt, '2026-08-23');
  assert.equal(figmaEvidence.collection.name, 'M3');
  assert.match(figmaEvidence.collection.variableSetKey, /^[0-9a-f]{40}$/);
  assert.equal(figmaEvidence.collection.modeCount, 32);
  assert.equal(figmaEvidence.collection.modes.length, 32);
  assert.deepEqual(figmaEvidence.method.modes, ['Light', 'Dark']);
  assert.ok(figmaEvidence.collection.modes.includes('Light'));
  assert.ok(figmaEvidence.collection.modes.includes('Dark'));
  assert.ok(figmaEvidence.collection.modes.includes('Light High Contrast'));
  assert.ok(figmaEvidence.collection.modes.includes('Dark High Contrast'));
  assert.ok(figmaEvidence.collection.modes.includes('Monochrome LT'));
  assert.ok(figmaEvidence.collection.modes.includes('Purple DT'));
  assert.match(figmaEvidence.method.note, /Read-only/);
  assert.doesNotMatch(JSON.stringify(figmaEvidence), /T4NuERAoU056MwShPtFpGx/);
});

test('Figma exposes the complete 49-role runtime color vocabulary with 98 Light/Dark values and unique published keys', () => {
  const canonicalRoles = Object.keys(colorDoc.color.role).sort();
  const evidenceRoles = figmaEvidence.roles.map((entry) => entry.role).sort();
  assert.equal(canonicalRoles.length, 49);
  assert.deepEqual(evidenceRoles, canonicalRoles);

  const keys = new Set();
  for (const entry of figmaEvidence.roles) {
    assert.equal(entry.name.startsWith('Schemes/'), true, entry.role);
    assert.match(entry.key, /^[0-9a-f]{40}$/, entry.role);
    assert.equal(keys.has(entry.key), false, `duplicate Figma key ${entry.key}`);
    keys.add(entry.key);
    assert.match(entry.light, /^#[0-9A-F]{6}$/, `${entry.role}.light`);
    assert.match(entry.dark, /^#[0-9A-F]{6}$/, `${entry.role}.dark`);
  }
  assert.equal(keys.size, 49);
  assert.equal(figmaEvidence.roles.length * 2, 98);
});

test('Figma baseline Dark matches canonical 48/48 while Light differs only at four on-container roles', () => {
  const evidenceByRole = new Map(figmaEvidence.roles.map((entry) => [entry.role, entry]));
  const baseline = baselineDoc.scheme.baseline;
  const lightRoles = Object.keys(baseline.light).sort();
  const darkRoles = Object.keys(baseline.dark).sort();
  assert.equal(lightRoles.length, 48);
  assert.deepEqual(darkRoles, lightRoles);
  assert.deepEqual(
    figmaEvidence.roles.map((entry) => entry.role).filter((role) => !(role in baseline.light)),
    ['shadow'],
  );

  const mismatches = (mode) => lightRoles.filter((role) => (
    normalizeHex(resolveCanonical(baseline[mode][role])) !== evidenceByRole.get(role)[mode]
  ));
  assert.deepEqual(mismatches('dark'), []);
  assert.deepEqual(mismatches('light'), [
    'onErrorContainer',
    'onPrimaryContainer',
    'onSecondaryContainer',
    'onTertiaryContainer',
  ]);

  assert.deepEqual(
    Object.fromEntries(mismatches('light').map((role) => [role, {
      canonical: normalizeHex(resolveCanonical(baseline.light[role])),
      figma: evidenceByRole.get(role).light,
    }])),
    {
      onErrorContainer: { canonical: '#410E0B', figma: '#852221' },
      onPrimaryContainer: { canonical: '#21005D', figma: '#4F378A' },
      onSecondaryContainer: { canonical: '#1D192B', figma: '#4A4459' },
      onTertiaryContainer: { canonical: '#31111D', figma: '#633B48' },
    },
  );
});

test('pinned generic Web color source and Android config override explain the four-role platform divergence', () => {
  const { materialWeb, materialComponentsAndroid, compose } = referenceEvidence.sources;
  assert.equal(referenceEvidence.buildInput, false);
  assert.equal(materialWeb.repository, material3Sources.materialWeb.repository);
  assert.equal(materialWeb.revision, material3Sources.materialWeb.revision);
  assert.equal(materialWeb.generatedVersion, material3Sources.materialWeb.latestGeneratedVersion);
  assert.equal(materialComponentsAndroid.repository, material3Sources.materialComponentsAndroid.repository);
  assert.equal(materialComponentsAndroid.revision, material3Sources.materialComponentsAndroid.revision);
  assert.equal(materialComponentsAndroid.generatedVersion, material3Sources.materialComponentsAndroid.generatedVersion);
  assert.equal(compose.repository, material3Sources.compose.repository);
  assert.equal(compose.revision, material3Sources.compose.revision);
  assert.equal(compose.generatedVersion, 'v0_210');

  const expectedRoles = ['onPrimaryContainer', 'onSecondaryContainer', 'onTertiaryContainer', 'onErrorContainer'];
  assert.deepEqual(referenceEvidence.roles.map((entry) => entry.role), expectedRoles);

  for (const entry of referenceEvidence.roles) {
    assert.equal(entry.webGenericAlias, entry.androidGeneratedBeforeOverrideAlias, entry.role);
    assert.equal(entry.androidEffectiveAlias, entry.composeEffectiveAlias, entry.role);
    assert.equal(entry.composeEffectiveAlias, entry.canonicalAlias, entry.role);
    assert.equal(aliasPath(baselineDoc.scheme.baseline.light[entry.role]), entry.canonicalAlias, entry.role);
  }

  const figmaByRole = new Map(figmaEvidence.roles.map((entry) => [entry.role, entry]));
  for (const role of expectedRoles) {
    assert.equal(figmaByRole.get(role).light, referenceEvidence.figmaExactLight.values[role], role);
  }
  assert.deepEqual(
    expectedRoles.filter((role) => referenceEvidence.figmaExactLight.values[role] !== referenceEvidence.webGenericLightHex[role]),
    ['onPrimaryContainer', 'onSecondaryContainer', 'onErrorContainer'],
  );
});

test('foundation drift keeps Android platform override and Figma exact-value drift explicit instead of rewriting canonical colors', () => {
  const records = new Map((foundationDrift.colorRoles?.drift ?? []).map((entry) => [entry.id, entry]));
  assert.equal(records.get('color-light-on-container-platform-override')?.classification, 'implementation-override');
  assert.equal(records.get('color-light-on-container-platform-override')?.preferredReference, 'normative-spec-review');
  assert.equal(records.get('color-light-on-container-figma-exact-drift')?.classification, 'cross-source-color-drift');
  assert.equal(records.get('color-light-on-container-figma-exact-drift')?.preferredReference, 'normative-spec-review');
});
