import assert from 'node:assert/strict';
import test from 'node:test';
import { materialConformanceRegistry } from './adaptive-layout-conformance-registry.mjs';

const lane10Ids = new Set([
  'layout-scaffold',
  'layout-three-pane-scaffold',
  'layout-list-detail-pane-scaffold',
  'layout-supporting-pane-scaffold',
  'layout-navigation-suite-scaffold',
  'layout-adaptive-core',
]);

function lane10Families() {
  return materialConformanceRegistry.families.filter((family) =>
    lane10Ids.has(family.id),
  );
}

function family(id) {
  const match = lane10Families().find((entry) => entry.id === id);
  assert.ok(match, `missing Lane 10 family ${id}`);
  return match;
}

test('Lane 10 families cannot regress to the generic parent gap', () => {
  const families = lane10Families();
  assert.equal(families.length, lane10Ids.size);

  for (const entry of families) {
    for (const [dimension, contract] of Object.entries(entry.dimensions)) {
      assert.notEqual(
        contract.gapIssue,
        296,
        `${entry.id}.${dimension} must keep concrete Lane 10 evidence or explicit classification`,
      );
      if (contract.status === 'required') {
        assert.ok(
          Array.isArray(contract.evidence) && contract.evidence.length > 0,
          `${entry.id}.${dimension} must retain automated evidence`,
        );
      }
      if (contract.status === 'adapted') {
        assert.ok(contract.reason?.trim(), `${entry.id}.${dimension} needs an adaptation reason`);
        assert.ok(
          Array.isArray(contract.evidence) && contract.evidence.length > 0,
          `${entry.id}.${dimension} adaptation must retain automated evidence`,
        );
      }
      if (contract.status === 'not-applicable') {
        assert.ok(contract.reason?.trim(), `${entry.id}.${dimension} N/A needs an ownership reason`);
      }
    }
  }
});

test('Lane 10 source ownership remains non-overlapping', () => {
  const prefixes = new Map();
  for (const entry of lane10Families()) {
    for (const prefix of entry.sourcePrefixes) {
      assert.equal(
        prefixes.has(prefix),
        false,
        `${prefix} is claimed by both ${prefixes.get(prefix)} and ${entry.id}`,
      );
      prefixes.set(prefix, entry.id);
    }
  }

  assert.deepEqual(family('layout-scaffold').sourcePrefixes, [
    'packages/ui/src/layout/components/Scaffold/',
  ]);
  assert.deepEqual(family('layout-three-pane-scaffold').sourcePrefixes, [
    'packages/ui/src/layout/components/ThreePaneScaffold/',
  ]);
  assert.deepEqual(family('layout-list-detail-pane-scaffold').sourcePrefixes, [
    'packages/ui/src/layout/components/ListDetailPaneScaffold/',
  ]);
  assert.deepEqual(family('layout-supporting-pane-scaffold').sourcePrefixes, [
    'packages/ui/src/layout/components/SupportingPaneScaffold/',
  ]);
  assert.deepEqual(family('layout-navigation-suite-scaffold').sourcePrefixes, [
    'packages/ui/src/layout/components/NavigationSuiteScaffold/',
  ]);
  assert.deepEqual(family('layout-adaptive-core').sourcePrefixes, [
    'packages/ui/src/layout/adaptive/',
  ]);
});

test('pure adaptive core cannot acquire theme or DOM accessibility ownership', () => {
  const dimensions = family('layout-adaptive-core').dimensions;
  assert.equal(dimensions.theme.status, 'not-applicable');
  assert.match(dimensions.theme.reason, /no paint|no.*colors/i);
  assert.equal(dimensions.accessibility.status, 'not-applicable');
  assert.match(dimensions.accessibility.reason, /ThreePaneScaffold|DOM/i);
});

test('NavigationSuite keeps its synchronous visibility adaptation explicit', () => {
  const motion = family('layout-navigation-suite-scaffold').dimensions.motion;
  assert.equal(motion.status, 'adapted');
  assert.match(motion.reason, /synchronous/i);
  assert.match(motion.reason, /isAnimating is false/i);
});

test('canonical pane wrappers do not pretend to own renderer paint or motion', () => {
  for (const id of [
    'layout-list-detail-pane-scaffold',
    'layout-supporting-pane-scaffold',
  ]) {
    const dimensions = family(id).dimensions;
    assert.equal(dimensions.tokensVisuals.status, 'not-applicable');
    assert.equal(dimensions.theme.status, 'not-applicable');
    assert.equal(dimensions.motion.status, 'not-applicable');
    assert.equal(dimensions.accessibility.status, 'not-applicable');
  }
});

test('Scaffold keeps browser measurement separate from Material motion and semantics', () => {
  const dimensions = family('layout-scaffold').dimensions;
  assert.equal(dimensions.browser.status, 'required');
  assert.equal(dimensions.ssr.status, 'required');
  assert.equal(dimensions.motion.status, 'not-applicable');
  assert.match(dimensions.motion.reason, /ResizeObserver.*measurement/i);
  assert.equal(dimensions.accessibility.status, 'not-applicable');
});
