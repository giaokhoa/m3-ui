import assert from 'node:assert/strict';
import test from 'node:test';
import { materialConformanceRegistry } from './material-conformance-registry.mjs';

const expectedReviewedCapabilities = {
  menu: [
    'action-items',
    'selectable-items',
    'checkable-items',
    'groups-vibrant',
    'submenu',
    'exposed-read-only-menu',
    'exposed-combobox',
  ],
  'list-item': ['standard', 'single-selection', 'multiple-selection', 'segmented'],
  tooltip: ['plain', 'rich', 'caret'],
  'search-bar': [
    'collapsed',
    'docked',
    'docked-with-gap',
    'full-screen',
    'full-screen-contained',
    'app-bar-integration',
  ],
  'time-picker': ['dial', 'input', 'scroll', 'raw-input-draft'],
};

const expectedReleaseFindings = [
  'bottom-app-bar-custom-container-color',
  'vertical-slider',
  'pull-to-refresh-indicator-distance',
  'top-app-bar-content-padding',
  'chip-content-padding-spacing',
  'secure-text-obfuscation-plumbing',
  'compose-saveable-state-plumbing',
  'compose-interaction-source-plumbing',
  'compose-scroll-state-holder-plumbing',
];

const families = new Map(
  materialConformanceRegistry.families.map((family) => [family.id, family]),
);

test('reviewed Compose capability families retain the audited semantic groups', () => {
  for (const [familyId, capabilityIds] of Object.entries(expectedReviewedCapabilities)) {
    const family = families.get(familyId);
    assert.ok(family, `missing reviewed family ${familyId}`);
    assert.deepEqual(
      family.capabilities.map((capability) => capability.id),
      capabilityIds,
      `${familyId} must retain the reviewed behavior-level capability inventory`,
    );
    assert.equal(
      family.capabilities.some((capability) => capability.status === 'gap'),
      false,
      `${familyId} must not report complete while a reviewed capability remains a gap`,
    );
  }
});

test('reviewed capability mappings include the remediated public surfaces', () => {
  const capability = (familyId, capabilityId) =>
    families.get(familyId).capabilities.find((item) => item.id === capabilityId);

  assert.deepEqual(capability('menu', 'submenu').publicSymbols, ['MenuSubmenu']);
  assert.deepEqual(capability('menu', 'exposed-read-only-menu').publicSymbols, ['ExposedMenu']);
  assert.deepEqual(capability('menu', 'exposed-combobox').publicSymbols, ['ExposedDropdownMenu']);
  assert.deepEqual(capability('list-item', 'segmented').publicSymbols, ['ListItem', 'SegmentedListItemGroup']);
  assert.deepEqual(capability('tooltip', 'caret').publicSymbols, ['PlainTooltip', 'RichTooltip']);
  assert.deepEqual(capability('search-bar', 'docked-with-gap').publicSymbols, ['ExpandedDockedSearchBarWithGap']);
  assert.deepEqual(capability('search-bar', 'full-screen-contained').publicSymbols, ['ExpandedFullScreenContainedSearchBar']);
  assert.deepEqual(capability('search-bar', 'app-bar-integration').publicSymbols, ['AppBarWithSearch']);
  assert.deepEqual(capability('time-picker', 'scroll').publicSymbols, ['TimeScroll']);
  assert.deepEqual(capability('time-picker', 'raw-input-draft').publicSymbols, ['TimeInput', 'TimeInputDraftValue']);
});

test('the final 1.5.x release-note sweep retains every reviewed disposition', () => {
  assert.deepEqual(
    materialConformanceRegistry.reviewedReleaseFindings.map((finding) => finding.id),
    expectedReleaseFindings,
  );
});
