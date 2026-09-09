import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './material-conformance-registry.mjs';

const lane6FamilyIds = [
  'progress-indicator',
  'loading-indicator',
  'snackbar',
  'tooltip',
];
const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

test('Lane 6 families classify every conformance dimension without the parent gap', () => {
  for (const familyId of lane6FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 6 family: ${familyId}`);

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

test('Lane 6 keeps motion ownership at the components that actually animate', () => {
  for (const familyId of ['progress-indicator', 'loading-indicator', 'tooltip']) {
    assert.equal(familyById.get(familyId).dimensions.motion.status, 'required');
  }

  assert.equal(
    familyById.get('snackbar').dimensions.motion.status,
    'not-applicable',
  );
});

test('Lane 6 keeps directionality ownership explicit', () => {
  assert.equal(
    familyById.get('progress-indicator').dimensions.rtlLocalization.status,
    'required',
  );
  assert.equal(
    familyById.get('loading-indicator').dimensions.rtlLocalization.status,
    'not-applicable',
  );
});

test('Lane 6 dynamic-theme and tooltip portal contracts cite shared Chromium evidence', () => {
  const sharedEvidence =
    'apps/storybook/visual/feedback-status-conformance.visual.spec.ts';

  for (const familyId of lane6FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family.dimensions.theme.evidence.includes(sharedEvidence));
    assert.ok(family.dimensions.browser.evidence.includes(sharedEvidence));
  }
});

test('Lane 6 server-safe families cite focused SSR evidence', () => {
  const ssrEvidence = 'packages/ui/src/feedback-status.ssr.test.tsx';

  for (const familyId of lane6FamilyIds) {
    assert.ok(familyById.get(familyId).dimensions.ssr.evidence.includes(ssrEvidence));
  }
});
