import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './material-conformance-registry.mjs';

const lane7FamilyIds = ['date-picker', 'time-picker'];
const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

const sharedBrowserEvidence =
  'apps/storybook/visual/picker-conformance.visual.spec.ts';
const ssrEvidence = 'packages/ui/src/pickers.ssr.test.tsx';
const pickerAuditEvidence =
  'packages/tokens/scripts/audit-material-web-pickers.mjs';
const pickerCssEvidence = 'packages/tokens/scripts/pickers-css.test.mjs';

test('Lane 7 picker families classify every conformance dimension without the parent gap', () => {
  for (const familyId of lane7FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 7 family: ${familyId}`);

    for (const dimension of CONFORMANCE_DIMENSIONS) {
      const contract = family.dimensions[dimension];
      assert.ok(contract, `${familyId}.${dimension} is unclassified`);
      assert.notEqual(
        contract.gapIssue,
        296,
        `${familyId}.${dimension} fell back to parent gap #296`,
      );

      if (contract.status === 'required') {
        assert.ok(
          Array.isArray(contract.evidence) && contract.evidence.length > 0,
          `${familyId}.${dimension} requires concrete evidence`,
        );
      } else if (contract.status === 'not-applicable') {
        assert.ok(
          typeof contract.reason === 'string' && contract.reason.trim().length > 0,
          `${familyId}.${dimension} requires an N/A reason`,
        );
      } else {
        assert.fail(`${familyId}.${dimension} has unsupported status ${contract.status}`);
      }
    }
  }
});

test('Lane 7 keeps localization, directionality, motion, theme, browser and SSR as real picker contracts', () => {
  for (const familyId of lane7FamilyIds) {
    const dimensions = familyById.get(familyId).dimensions;
    for (const dimension of [
      'rtlLocalization',
      'motion',
      'theme',
      'browser',
      'ssr',
    ]) {
      assert.equal(
        dimensions[dimension].status,
        'required',
        `${familyId}.${dimension} must remain required`,
      );
    }
  }
});

test('Lane 7 cites shared dynamic-theme Chromium and deterministic SSR evidence', () => {
  for (const familyId of lane7FamilyIds) {
    const dimensions = familyById.get(familyId).dimensions;
    assert.ok(dimensions.theme.evidence.includes(sharedBrowserEvidence));
    assert.ok(dimensions.browser.evidence.includes(sharedBrowserEvidence));
    assert.ok(dimensions.ssr.evidence.includes(ssrEvidence));
  }
});

test('Lane 7 token evidence stays tied to the canonical picker compiler and audited Material Web overlap', () => {
  for (const familyId of lane7FamilyIds) {
    const evidence = familyById.get(familyId).dimensions.tokensVisuals.evidence;
    assert.ok(evidence.includes(pickerAuditEvidence));
    assert.ok(evidence.includes(pickerCssEvidence));
  }
});
