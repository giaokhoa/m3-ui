import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './navigation-chrome-conformance-registry.mjs';

const lane8FamilyIds = [
  'navigation-bar',
  'navigation-rail',
  'navigation-drawer',
  'tabs',
  'top-app-bar',
  'bottom-app-bar',
  'floating-toolbar',
  'app-bar-row',
  'app-bar-column',
];

const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

const sharedBrowserEvidence =
  'apps/storybook/visual/navigation-chrome-conformance.visual.spec.ts';
const ssrEvidence = 'packages/ui/src/navigation-chrome.ssr.test.tsx';
const navigationBaselineAudit =
  'packages/tokens/scripts/audit-material-web-navigation-baseline.mjs';
const navigationExpressiveAudit =
  'packages/tokens/scripts/audit-material-web-navigation-expressive.mjs';
const appBarAudit = 'packages/tokens/scripts/audit-material-web-app-bar.mjs';
const toolbarAudit = 'packages/tokens/scripts/audit-material-web-toolbar.mjs';

test('Lane 8 navigation/chrome families classify every dimension without parent gap #296', () => {
  for (const familyId of lane8FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 8 family: ${familyId}`);

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

test('Lane 8 shared dynamic-theme Chromium and deterministic SSR evidence stay required', () => {
  for (const familyId of lane8FamilyIds) {
    const dimensions = familyById.get(familyId).dimensions;
    assert.equal(dimensions.theme.status, 'required');
    assert.equal(dimensions.browser.status, 'required');
    assert.equal(dimensions.ssr.status, 'required');
    assert.ok(dimensions.theme.evidence.includes(sharedBrowserEvidence));
    assert.ok(dimensions.browser.evidence.includes(sharedBrowserEvidence));
    assert.ok(dimensions.ssr.evidence.includes(ssrEvidence));
  }
});

test('Lane 8 keeps family-owned motion distinct from shared Ripple/Menu motion', () => {
  for (const familyId of [
    'navigation-rail',
    'navigation-drawer',
    'tabs',
    'top-app-bar',
    'bottom-app-bar',
    'floating-toolbar',
  ]) {
    assert.equal(
      familyById.get(familyId).dimensions.motion.status,
      'required',
      `${familyId}.motion must remain family-owned`,
    );
  }

  for (const familyId of ['navigation-bar', 'app-bar-row', 'app-bar-column']) {
    const motion = familyById.get(familyId).dimensions.motion;
    assert.equal(motion.status, 'not-applicable');
    assert.ok(motion.reason.length > 0);
  }
});

test('Lane 8 token/visual evidence remains tied to canonical navigation, app-bar and toolbar audits', () => {
  for (const familyId of ['navigation-bar', 'navigation-rail']) {
    const evidence = familyById.get(familyId).dimensions.tokensVisuals.evidence;
    assert.ok(evidence.includes(navigationBaselineAudit));
    assert.ok(evidence.includes(navigationExpressiveAudit));
  }

  const drawerEvidence = familyById.get('navigation-drawer').dimensions.tokensVisuals.evidence;
  assert.ok(drawerEvidence.includes(navigationBaselineAudit));

  const tabsEvidence = familyById.get('tabs').dimensions.tokensVisuals.evidence;
  assert.ok(tabsEvidence.includes(navigationBaselineAudit));

  for (const familyId of ['top-app-bar', 'bottom-app-bar']) {
    assert.ok(
      familyById.get(familyId).dimensions.tokensVisuals.evidence.includes(appBarAudit),
    );
  }

  assert.ok(
    familyById
      .get('floating-toolbar')
      .dimensions.tokensVisuals.evidence.includes(toolbarAudit),
  );
});

test('Lane 8 preserves local component ownership and leaves adaptive surface switching to Lane 10', () => {
  for (const familyId of lane8FamilyIds) {
    const family = familyById.get(familyId);
    for (const prefix of family.sourcePrefixes) {
      assert.ok(
        !prefix.startsWith('packages/ui/src/layout/'),
        `${familyId} must not absorb adaptive layout ownership`,
      );
    }
  }
});
