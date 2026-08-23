import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(resolve(scriptDir, path), 'utf8'));

const [figmaContrast, figmaBaseline, webContrast, paletteDoc, colorDoc, baselineDoc, colorDrift] = await Promise.all([
  readJson('../audit/figma-color-contrast-evidence.json'),
  readJson('../audit/figma-color-scheme-evidence.json'),
  readJson('../audit/material-web-color-contrast-evidence.json'),
  readJson('../tokens/core/palette.json'),
  readJson('../tokens/core/color.json'),
  readJson('../tokens/core/baseline-scheme.json'),
  readJson('../audit/figma-color-scheme-drift.json'),
]);

const normalizeHex = (value) => value.toUpperCase();

function atPath(root, path) {
  return path.split('.').reduce((value, segment) => value?.[segment], root);
}

function resolveWebRole(modeKey, role, seen = new Set()) {
  const alias = webContrast.modes[modeKey]?.roles?.[role];
  assert.equal(typeof alias, 'string', `${modeKey}.${role} alias`);
  const identity = `${modeKey}.${role}`;
  assert.equal(seen.has(identity), false, `role alias cycle at ${identity}`);
  if (alias.startsWith('role.')) {
    return resolveWebRole(modeKey, alias.slice('role.'.length), new Set([...seen, identity]));
  }
  assert.match(alias, /^palette\./, `${identity} palette alias`);
  const token = atPath(paletteDoc, alias);
  assert.ok(token && typeof token.$value === 'string', `${identity} canonical palette target ${alias}`);
  return normalizeHex(token.$value);
}

const expectedMismatchRoles = {
  lightHigh: [
    'primary', 'primaryContainer', 'primaryFixed', 'primaryFixedDim',
    'secondary', 'secondaryContainer', 'secondaryFixed', 'secondaryFixedDim',
    'tertiary', 'tertiaryContainer', 'tertiaryFixed', 'tertiaryFixedDim',
    'error', 'errorContainer', 'surface', 'surfaceDim', 'surfaceBright',
    'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh',
    'onSurfaceVariant', 'surfaceVariant', 'surfaceTint', 'outline', 'outlineVariant',
    'inversePrimary', 'background', 'onBackground',
  ],
  lightMedium: [
    'primary', 'primaryContainer', 'primaryFixed', 'primaryFixedDim',
    'secondary', 'secondaryContainer', 'secondaryFixed', 'secondaryFixedDim',
    'tertiary', 'tertiaryContainer', 'tertiaryFixed', 'tertiaryFixedDim',
    'error', 'errorContainer', 'surface', 'surfaceDim', 'surfaceBright',
    'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh',
    'onSurface', 'onSurfaceVariant', 'surfaceVariant', 'surfaceTint', 'outline', 'outlineVariant',
    'inverseOnSurface', 'inversePrimary', 'background', 'onBackground',
  ],
  darkHigh: [
    'primary', 'primaryContainer', 'primaryFixed', 'primaryFixedDim', 'onPrimaryFixedVariant',
    'secondary', 'secondaryContainer', 'secondaryFixed', 'secondaryFixedDim', 'onSecondaryFixedVariant',
    'tertiary', 'tertiaryContainer', 'tertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixedVariant',
    'error', 'errorContainer', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
    'onSurfaceVariant', 'surfaceVariant', 'surfaceTint', 'outline', 'outlineVariant',
    'inversePrimary', 'onBackground',
  ],
  darkMedium: [
    'primary', 'onPrimary', 'primaryContainer', 'primaryFixed', 'primaryFixedDim', 'onPrimaryFixed', 'onPrimaryFixedVariant',
    'secondary', 'onSecondary', 'secondaryContainer', 'secondaryFixed', 'secondaryFixedDim', 'onSecondaryFixed', 'onSecondaryFixedVariant',
    'tertiary', 'onTertiary', 'tertiaryContainer', 'tertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixed', 'onTertiaryFixedVariant',
    'error', 'onError', 'errorContainer', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
    'onSurface', 'onSurfaceVariant', 'surfaceVariant', 'surfaceTint', 'outline', 'outlineVariant',
    'inverseOnSurface', 'inversePrimary', 'onBackground',
  ],
};

test('Figma contrast evidence is pinned, read-only, and reuses the complete 49 published scheme keys', () => {
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(figmaContrast.source[field], material3Sources.figma[field], field);
  }
  assert.equal(figmaContrast.source.verifiedAt, '2026-08-23');
  assert.equal(figmaContrast.method.readOnly, true);
  assert.equal(figmaContrast.collection.variableSetKey, figmaBaseline.collection.variableSetKey);
  assert.deepEqual(Object.values(figmaContrast.modes), [
    'Light High Contrast',
    'Light Medium Contrast',
    'Dark High Contrast',
    'Dark Medium Contrast',
  ]);
  assert.equal(figmaContrast.roleCount, 49);
  assert.equal(figmaContrast.valueCount, 196);
  assert.equal(figmaContrast.roles.length, 49);
  assert.deepEqual(
    figmaContrast.roles.map(({ role, key }) => ({ role, key })),
    figmaBaseline.roles.map(({ role, key }) => ({ role, key })),
  );
  assert.doesNotMatch(JSON.stringify(figmaContrast), /T4NuERAoU056MwShPtFpGx/);
  for (const entry of figmaContrast.roles) {
    for (const modeKey of Object.keys(figmaContrast.modes)) {
      assert.match(entry[modeKey], /^#[0-9A-F]{6}$/, `${entry.role}.${modeKey}`);
    }
  }
});

test('Material Web contrast evidence pins all four generated 34.0.21 modules over the same 49-role vocabulary', () => {
  assert.equal(webContrast.source.kind, 'implementation-reference');
  assert.equal(webContrast.source.repository, material3Sources.materialWeb.repository);
  assert.equal(webContrast.source.revision, material3Sources.materialWeb.revision);
  assert.equal(webContrast.source.generatedVersion, material3Sources.materialWeb.latestGeneratedVersion);
  assert.equal(webContrast.method.readOnly, true);
  const expectedModules = {
    lightHigh: 'md-sys-color__high-contrast',
    lightMedium: 'md-sys-color__medium-contrast',
    darkHigh: 'md-sys-color__dark__high-contrast',
    darkMedium: 'md-sys-color__dark__medium-contrast',
  };
  const canonicalRoles = Object.keys(colorDoc.color.role).sort();
  assert.equal(canonicalRoles.length, 49);
  for (const [modeKey, module] of Object.entries(expectedModules)) {
    assert.equal(webContrast.modes[modeKey].module, module);
    assert.deepEqual(Object.keys(webContrast.modes[modeKey].roles).sort(), canonicalRoles, modeKey);
    for (const role of canonicalRoles) resolveWebRole(modeKey, role);
  }
});

test('Figma and Material Web share contrast role identity but use reproducibly different generation models', () => {
  const figmaByRole = new Map(figmaContrast.roles.map((entry) => [entry.role, entry]));
  const summary = {};
  for (const modeKey of Object.keys(figmaContrast.modes)) {
    const mismatches = [];
    let matches = 0;
    for (const role of Object.keys(colorDoc.color.role)) {
      const figma = figmaByRole.get(role)[modeKey];
      const web = resolveWebRole(modeKey, role);
      if (figma === web) matches += 1;
      else mismatches.push(role);
    }
    assert.deepEqual(mismatches, expectedMismatchRoles[modeKey], modeKey);
    summary[modeKey] = { matches, mismatches: mismatches.length };
  }
  assert.deepEqual(summary, {
    lightHigh: { matches: 21, mismatches: 28 },
    lightMedium: { matches: 19, mismatches: 30 },
    darkHigh: { matches: 22, mismatches: 27 },
    darkMedium: { matches: 13, mismatches: 36 },
  });
});

test('contrast-mode evidence remains audit-only and is represented by one source-model drift record', () => {
  assert.deepEqual(Object.keys(baselineDoc.scheme.baseline).sort(), ['dark', 'light']);
  assert.equal('lightHigh' in baselineDoc.scheme.baseline, false);
  assert.equal('darkMedium' in baselineDoc.scheme.baseline, false);
  const drift = (colorDrift.records ?? []).find((entry) => entry.id === 'color-contrast-generation-model');
  assert.equal(drift?.classification, 'source-model-drift');
  assert.equal(drift?.preferredReference, 'normative-spec-review');
  assert.deepEqual(drift?.roles, ['all-49-semantic-color-roles']);
});
