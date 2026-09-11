import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './material-conformance-registry.mjs';

const lane4FamilyIds = ['chip', 'menu', 'list-item', 'badge', 'divider'];
const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

test('Lane 4 families classify every conformance dimension without the parent gap', () => {
  for (const familyId of lane4FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 4 family: ${familyId}`);

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

test('Lane 4 keeps presentational N/A classifications narrow', () => {
  const badge = familyById.get('badge');
  const divider = familyById.get('divider');

  assert.equal(badge.dimensions.behavior.status, 'not-applicable');
  assert.equal(badge.dimensions.motion.status, 'not-applicable');
  assert.equal(badge.dimensions.rtlLocalization.status, 'required');

  assert.equal(divider.dimensions.behavior.status, 'not-applicable');
  assert.equal(divider.dimensions.rtlLocalization.status, 'not-applicable');
  assert.equal(divider.dimensions.motion.status, 'not-applicable');
  assert.equal(divider.dimensions.accessibility.status, 'required');
});

test('Menu evidence includes both RAC Menu and editable ExposedDropdownMenu browser surfaces', () => {
  const menu = familyById.get('menu');
  const browserEvidence = menu.dimensions.browser.evidence;

  assert.ok(browserEvidence.includes('apps/storybook/visual/menu.visual.spec.ts'));
  assert.ok(
    browserEvidence.includes(
      'apps/storybook/visual/exposed-dropdown-menu.visual.spec.ts',
    ),
  );
  assert.ok(
    browserEvidence.includes(
      'apps/storybook/visual/content-primitives-conformance.visual.spec.ts',
    ),
  );
});
