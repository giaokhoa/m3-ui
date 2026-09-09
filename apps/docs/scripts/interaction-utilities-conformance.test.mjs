import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry,
} from './interaction-utilities-conformance-registry.mjs';

const lane9FamilyIds = [
  'carousel',
  'pull-to-refresh',
  'swipe-to-dismiss-box',
  'scroll-field',
  'drag-handle',
  'non-interactive-scrollbar',
];

const familyById = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

const sharedBrowserEvidence =
  'apps/storybook/visual/interaction-utilities-conformance.visual.spec.ts';
const ssrEvidence = 'packages/ui/src/interaction-layout-utilities.ssr.test.tsx';
const carouselCssEvidence = 'packages/tokens/scripts/carousel-css.test.mjs';
const dragHandleCssEvidence = 'packages/tokens/scripts/drag-handle-css.test.mjs';

test('Lane 9 interaction/layout utility families classify every dimension without parent gap #296', () => {
  for (const familyId of lane9FamilyIds) {
    const family = familyById.get(familyId);
    assert.ok(family, `missing Lane 9 family: ${familyId}`);

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

test('Lane 9 deterministic SSR evidence stays required for all six families', () => {
  for (const familyId of lane9FamilyIds) {
    const ssr = familyById.get(familyId).dimensions.ssr;
    assert.equal(ssr.status, 'required', `${familyId}.ssr must remain required`);
    assert.ok(ssr.evidence.includes(ssrEvidence));
  }
});

test('Lane 9 dynamic-theme evidence follows actual family paint ownership', () => {
  for (const familyId of [
    'carousel',
    'pull-to-refresh',
    'scroll-field',
    'drag-handle',
    'non-interactive-scrollbar',
  ]) {
    const theme = familyById.get(familyId).dimensions.theme;
    assert.equal(theme.status, 'required', `${familyId}.theme must remain required`);
    assert.ok(theme.evidence.includes(sharedBrowserEvidence));
  }

  const swipeTheme = familyById.get('swipe-to-dismiss-box').dimensions.theme;
  assert.equal(swipeTheme.status, 'not-applicable');
  assert.match(swipeTheme.reason, /caller-provided content|no family semantic color paint/i);
});

test('Lane 9 motion ownership does not duplicate shared Ripple or fabricate animation', () => {
  for (const familyId of [
    'carousel',
    'pull-to-refresh',
    'swipe-to-dismiss-box',
    'scroll-field',
    'non-interactive-scrollbar',
  ]) {
    assert.equal(
      familyById.get(familyId).dimensions.motion.status,
      'required',
      `${familyId}.motion must remain family-owned`,
    );
  }

  const dragMotion = familyById.get('drag-handle').dimensions.motion;
  assert.equal(dragMotion.status, 'not-applicable');
  assert.match(dragMotion.reason, /Ripple|immediately/i);
});

test('Lane 9 RTL classification stays limited to direction-sensitive utility behavior', () => {
  for (const familyId of ['carousel', 'swipe-to-dismiss-box', 'non-interactive-scrollbar']) {
    assert.equal(
      familyById.get(familyId).dimensions.rtlLocalization.status,
      'required',
      `${familyId}.rtlLocalization must remain required`,
    );
  }

  for (const familyId of ['pull-to-refresh', 'scroll-field', 'drag-handle']) {
    const rtl = familyById.get(familyId).dimensions.rtlLocalization;
    assert.equal(rtl.status, 'not-applicable');
    assert.ok(rtl.reason.length > 0);
  }
});

test('Lane 9 preserves decorative accessibility for NonInteractiveScrollbar', () => {
  const family = familyById.get('non-interactive-scrollbar');
  assert.equal(family.dimensions.accessibility.status, 'required');
  assert.ok(
    family.dimensions.accessibility.evidence.includes(
      'apps/storybook/visual/non-interactive-scrollbar.visual.spec.ts',
    ),
  );
});

test('Lane 9 canonical token evidence remains attached where dedicated audits exist', () => {
  assert.ok(
    familyById.get('carousel').dimensions.tokensVisuals.evidence.includes(carouselCssEvidence),
  );
  assert.ok(
    familyById
      .get('drag-handle')
      .dimensions.tokensVisuals.evidence.includes(dragHandleCssEvidence),
  );
});

test('Lane 9 preserves component-local ownership and leaves adaptive layout to Lane 10', () => {
  for (const familyId of lane9FamilyIds) {
    const family = familyById.get(familyId);
    for (const prefix of family.sourcePrefixes) {
      assert.ok(
        !prefix.startsWith('packages/ui/src/layout/'),
        `${familyId} must not absorb adaptive layout ownership`,
      );
    }
  }
});
