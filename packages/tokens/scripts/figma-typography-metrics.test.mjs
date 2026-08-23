import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { material3Sources } from './sources.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(await readFile(resolve(scriptDir, '../audit/figma-typography-metrics-evidence.json'), 'utf8'));

const expected = Object.freeze({
  displayLarge: [57, 64, 'Regular', 'Medium'],
  displayMedium: [45, 52, 'Regular', 'Medium'],
  displaySmall: [36, 44, 'Regular', 'Medium'],
  headlineLarge: [32, 40, 'Regular', 'Medium'],
  headlineMedium: [28, 36, 'Regular', 'Medium'],
  headlineSmall: [24, 32, 'Regular', 'Medium'],
  titleLarge: [22, 28, 'Regular', 'Medium'],
  titleMedium: [16, 24, 'Medium', 'SemiBold'],
  titleSmall: [14, 20, 'Medium', 'SemiBold'],
  bodyLarge: [16, 24, 'Regular', 'Medium'],
  bodyMedium: [14, 20, 'Regular', 'Medium'],
  bodySmall: [12, 16, 'Regular', 'Medium'],
  labelLarge: [14, 20, 'Medium', 'SemiBold'],
  labelMedium: [12, 16, 'Medium', 'SemiBold'],
  labelSmall: [11, 16, 'Medium', 'SemiBold'],
});

const metricFields = Object.freeze([
  ['size', 'baselineValue', 0],
  ['lineHeight', 'baselineValue', 1],
  ['weight', 'resolvedBaselineValue', 2],
  ['weightEmphasized', 'resolvedBaselineValue', 3],
]);

function isFigmaKey(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

test('Figma typography metrics evidence stays pinned and outside the Style Dictionary source', () => {
  const pinned = material3Sources.figma;
  for (const field of ['kind', 'name', 'libraryKey', 'version', 'releasedAt']) {
    assert.equal(evidence.source?.[field], pinned[field], `Figma source pin mismatch for ${field}`);
  }
  assert.equal(evidence.method?.mode, 'Baseline');
  assert.equal(evidence.method?.scope, 'includeLibraryKeys');
  assert.match(evidence.method?.tool ?? '', /search_design_system/);
  assert.match(evidence.method?.tool ?? '', /importVariableByKeyAsync/);
  assert.ok(!JSON.stringify(evidence).includes('tokens/**/*.json'), 'reference evidence must not claim to be a build input');
});

test('Figma exposes complete 15-role size, line-height, baseline-weight and emphasized-weight evidence', () => {
  assert.equal(evidence.roles?.length, 15);
  const byRole = new Map(evidence.roles.map((entry) => [entry.role, entry]));
  assert.deepEqual([...byRole.keys()].sort(), Object.keys(expected).sort());

  const keys = new Set();
  let values = 0;
  for (const [role, expectedValues] of Object.entries(expected)) {
    const entry = byRole.get(role);
    assert.ok(entry, `missing Figma typography role ${role}`);
    for (const [metric, valueField, expectedIndex] of metricFields) {
      const observation = entry[metric];
      assert.ok(observation, `missing ${role}.${metric}`);
      assert.ok(isFigmaKey(observation.key), `invalid Figma key for ${role}.${metric}`);
      assert.ok(!keys.has(observation.key), `duplicate Figma metric key ${observation.key}`);
      keys.add(observation.key);
      assert.equal(observation[valueField], expectedValues[expectedIndex], `${role}.${metric} drifted from live Figma v1.25 evidence`);
      values += 1;
    }
  }
  assert.equal(keys.size, 60);
  assert.equal(values, 60);
});

test('Figma typography metric sweep agrees with canonical dimensions and weight aliases', async () => {
  const canonical = JSON.parse(await readFile(resolve(scriptDir, '../tokens/core/typography.json'), 'utf8'));
  const weightNumber = { Regular: 400, Medium: 500, SemiBold: 600 };
  const weightAlias = {
    Regular: '{typeface.weight.regular}',
    Medium: '{typeface.weight.medium}',
    SemiBold: '{typeface.weight.semiBold}',
  };

  for (const entry of evidence.roles) {
    const baseline = canonical.typography[entry.role];
    const emphasized = canonical.typography[`${entry.role}Emphasized`];
    assert.ok(baseline, `missing canonical typography.${entry.role}`);
    assert.ok(emphasized, `missing canonical typography.${entry.role}Emphasized`);

    assert.equal(baseline.fontSize.$value.value, entry.size.baselineValue, `${entry.role} size differs from Figma`);
    assert.equal(baseline.lineHeight.$value.value, entry.lineHeight.baselineValue, `${entry.role} line height differs from Figma`);
    assert.equal(emphasized.fontSize.$value.value, entry.size.baselineValue, `${entry.role} emphasized size differs from Figma`);
    assert.equal(emphasized.lineHeight.$value.value, entry.lineHeight.baselineValue, `${entry.role} emphasized line height differs from Figma`);

    const baselineWeight = entry.weight.resolvedBaselineValue;
    const emphasizedWeight = entry.weightEmphasized.resolvedBaselineValue;
    assert.equal(baseline.fontWeight.$value, weightAlias[baselineWeight], `${entry.role} baseline weight alias differs from Figma`);
    assert.equal(emphasized.fontWeight.$value, weightAlias[emphasizedWeight], `${entry.role} emphasized weight alias differs from Figma`);

    const baselineTokenName = baselineWeight === 'Regular' ? 'regular' : 'medium';
    const emphasizedTokenName = emphasizedWeight === 'SemiBold' ? 'semiBold' : 'medium';
    assert.equal(canonical.typeface.weight[baselineTokenName].$value, weightNumber[baselineWeight], `${entry.role} baseline weight number mismatch`);
    assert.equal(canonical.typeface.weight[emphasizedTokenName].$value, weightNumber[emphasizedWeight], `${entry.role} emphasized weight number mismatch`);
  }
});
