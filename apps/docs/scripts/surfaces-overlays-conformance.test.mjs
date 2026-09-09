import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './material-conformance-registry.mjs';

const lane5FamilyIds = ['card', 'surface', 'dialog', 'bottom-sheet', 'scrim'];
const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

test('Lane 5 families classify every conformance dimension without the parent gap', () => {
  for (const familyId of lane5FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 5 family: ${familyId}`);

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

test('Lane 5 keeps motion ownership at the component that actually animates', () => {
  assert.equal(familyById.get('card').dimensions.motion.status, 'required');
  assert.equal(familyById.get('bottom-sheet').dimensions.motion.status, 'required');

  assert.equal(familyById.get('surface').dimensions.motion.status, 'not-applicable');
  assert.equal(familyById.get('dialog').dimensions.motion.status, 'not-applicable');
  assert.equal(familyById.get('scrim').dimensions.motion.status, 'not-applicable');
});

test('Lane 5 portal-sensitive families cite shared Chromium theme evidence', () => {
  const sharedEvidence =
    'apps/storybook/visual/surfaces-overlays-conformance.visual.spec.ts';

  for (const familyId of ['dialog', 'bottom-sheet']) {
    const family = familyById.get(familyId);
    assert.ok(family.dimensions.theme.evidence.includes(sharedEvidence));
    assert.ok(family.dimensions.browser.evidence.includes(sharedEvidence));
  }
});

test('BottomSheet family keeps persistent scaffold evidence in the same public source family', () => {
  const bottomSheet = familyById.get('bottom-sheet');
  const browserEvidence = bottomSheet.dimensions.browser.evidence;

  assert.ok(
    browserEvidence.includes('apps/storybook/visual/bottom-sheet.visual.spec.ts'),
  );
  assert.ok(
    browserEvidence.includes(
      'apps/storybook/visual/bottom-sheet-scaffold.visual.spec.ts',
    ),
  );
  assert.ok(
    bottomSheet.dimensions.api.evidence.includes(
      'packages/ui/src/components/BottomSheetScaffold/BottomSheetScaffold.test.ts',
    ),
  );
});
