import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMaterialConformanceReport,
} from './material-conformance.mjs';
import {
  CONFORMANCE_DIMENSIONS,
} from './adaptive-layout-conformance-registry.mjs';

function nonEmptyStrings(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.trim() !== '')
  );
}

test('completed Material 3 conformance program remains gap-free across actual public exports', () => {
  const { report, errors } = buildMaterialConformanceReport();

  assert.deepEqual(errors, []);
  assert.equal(report.parentIssue, 296);
  assert.deepEqual(report.dimensions, CONFORMANCE_DIMENSIONS);
  assert.ok(report.families.length > 0, 'final report must contain public component/layout families');

  const canonicalDimensions = [...CONFORMANCE_DIMENSIONS].sort();

  for (const family of report.families) {
    assert.ok(
      family.publicSymbols.length > 0,
      `${family.id} must continue to own at least one actual public symbol`,
    );
    assert.deepEqual(
      Object.keys(family.dimensions).sort(),
      canonicalDimensions,
      `${family.id} must classify exactly the canonical ten conformance dimensions`,
    );

    for (const dimension of CONFORMANCE_DIMENSIONS) {
      const contract = family.dimensions[dimension];
      const label = `${family.id}.${dimension}`;

      assert.equal(
        Object.hasOwn(contract, 'gapIssue'),
        false,
        `${label} reintroduced a tracked gap after program completion`,
      );

      if (contract.status === 'required') {
        assert.ok(
          nonEmptyStrings(contract.evidence),
          `${label} must retain concrete automated evidence`,
        );
      } else if (contract.status === 'adapted') {
        assert.ok(
          typeof contract.reason === 'string' && contract.reason.trim() !== '',
          `${label} adaptation must retain its documented reason`,
        );
        assert.ok(
          nonEmptyStrings(contract.evidence),
          `${label} adaptation must retain concrete evidence`,
        );
      } else if (contract.status === 'not-applicable') {
        assert.ok(
          typeof contract.reason === 'string' && contract.reason.trim() !== '',
          `${label} N/A classification must retain its documented reason`,
        );
      } else {
        assert.fail(`${label} has unsupported status ${String(contract.status)}`);
      }
    }
  }

  const capabilityReviewedFamilies = report.families.filter(
    (family) => family.capabilities.length > 0,
  );
  assert.ok(
    capabilityReviewedFamilies.length > 0,
    'completed conformance must retain reviewed upstream capability coverage',
  );
  for (const family of capabilityReviewedFamilies) {
    for (const capability of family.capabilities) {
      const label = `${family.id}.capability.${capability.id}`;
      assert.notEqual(
        capability.status,
        'gap',
        `${label} reintroduced a reviewed public capability gap`,
      );
      assert.ok(
        nonEmptyStrings(capability.evidence),
        `${label} must retain concrete evidence`,
      );
      if (capability.status === 'supported') {
        assert.ok(
          nonEmptyStrings(capability.publicSymbols),
          `${label} must retain a public m3-ui mapping`,
        );
      }
      if (capability.status === 'adapted' || capability.status === 'excluded') {
        assert.ok(
          typeof capability.reason === 'string' && capability.reason.trim() !== '',
          `${label} must retain a concrete ${capability.status} reason`,
        );
      }
    }
  }

  assert.ok(
    report.reviewedReleaseFindings.length > 0,
    'the completed 1.5.x release-note sweep must retain explicit dispositions',
  );
  for (const finding of report.reviewedReleaseFindings) {
    assert.ok(
      ['supported', 'adapted', 'excluded'].includes(finding.status),
      `${finding.id} must retain a final release-note disposition`,
    );
    assert.ok(
      typeof finding.reason === 'string' && finding.reason.trim() !== '',
      `${finding.id} must retain its disposition reason`,
    );
    assert.ok(nonEmptyStrings(finding.evidence), `${finding.id} must retain evidence`);
  }

  assert.ok(
    report.nonComponents.length > 0,
    'public non-component infrastructure must remain explicitly classified',
  );
  for (const classification of report.nonComponents) {
    assert.ok(
      classification.publicSymbols.length > 0,
      `${classification.id} must continue to own at least one actual public symbol`,
    );
    assert.ok(
      typeof classification.reason === 'string' && classification.reason.trim() !== '',
      `${classification.id} must retain its explicit non-component rationale`,
    );
  }
});
