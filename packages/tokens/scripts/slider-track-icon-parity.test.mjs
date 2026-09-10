import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { material3Sources } from './sources.mjs';

async function repoFile(relativePath) {
  return readFile(new URL(`../../../${relativePath}`, import.meta.url), 'utf8');
}

const audit = JSON.parse(
  await repoFile('packages/tokens/audit/slider-track-icon-parity.json'),
);
const coverage = JSON.parse(
  await repoFile('packages/tokens/audit/material-web-coverage/slider-sizes.json'),
);
const sizes = JSON.parse(
  await repoFile('packages/tokens/tokens/component/slider-sizes.json'),
).component.slider.size;
const sliderSource = await repoFile('packages/ui/src/components/Slider/Slider.tsx');
const sliderReadme = await repoFile('packages/ui/src/components/Slider/README.md');

function dimension(token) {
  return `${token.$value.value}${token.$value.unit}`;
}

test('track-icon audit is pinned to the reviewed Material sources', () => {
  assert.equal(audit.issue, 337);
  assert.equal(audit.disposition, 'intentional-web-adaptation');
  assert.equal(audit.compose.revision, material3Sources.compose.revision);
  assert.equal(audit.canonical.materialWeb.revision, material3Sources.materialWeb.revision);
  assert.equal(
    audit.canonical.materialWeb.generatedVersion,
    material3Sources.materialWeb.latestGeneratedVersion,
  );
  assert.equal(audit.canonical.figma.version, material3Sources.figma.version);
  assert.equal(
    coverage.evidence.compose,
    'No size-specific SliderTokens.kt files in the pinned 120-file denominator',
  );
  assert.equal(audit.canonical.composeCoverage, coverage.evidence.compose);
});

test('canonical track-icon geometry stays attributed to Material Web and Figma evidence', () => {
  for (const size of ['medium', 'large', 'xLarge']) {
    assert.equal(
      audit.canonical.iconGeometry[size].iconSize,
      dimension(sizes[size].iconSize),
    );
    assert.equal(
      audit.canonical.iconGeometry[size].iconPadding,
      dimension(sizes[size].iconPadding),
    );
  }

  assert.equal(audit.canonical.iconSpecificColorTokens, false);
  assert.equal(audit.canonical.iconSpecificDisabledTokens, false);
  assert.equal(audit.canonical.iconSpecificRtlTokens, false);
});

test('reviewed Compose evidence classifies track icons as sample-only custom-track paint', () => {
  const findings = audit.compose.findings;
  const sample = findings.singleSliderTrackIconSample;

  assert.equal(findings.dedicatedTrackIconPublicParameter, false);
  assert.equal(findings.sliderDefaultsTrackHasTrackIconParameter, false);
  assert.equal(findings.defaultSliderRendersTrackIcons, false);
  assert.equal(findings.defaultRangeSliderRendersTrackIcons, false);
  assert.equal(findings.sizeSpecificSliderTokenModulesAtReviewedPin, false);
  assert.equal(sample.classification, 'sample-only-custom-track');
  assert.equal(sample.iconSize, '20dp');
  assert.equal(sample.iconPadding, '10dp');
  assert.equal(sample.thumbTrackGapSize, '6dp');
  assert.equal(sample.activeColorSource, 'SliderDefaults.colors().activeTickColor');
  assert.equal(sample.inactiveColorSource, 'SliderDefaults.colors().inactiveTickColor');
  assert.equal(findings.rangeSlider.dedicatedTrackIconPublicParameter, false);
  assert.equal(findings.rangeSlider.trackIconSample, false);
});

test('m3-ui keeps the intentional web API boundary explicit', () => {
  const materialProps = sliderSource.match(
    /interface MaterialSliderProps \{([\s\S]*?)\n\}/,
  );
  assert.ok(materialProps, 'MaterialSliderProps must remain inspectable');
  assert.doesNotMatch(materialProps[1], /\btrackIcon\b/);
  assert.doesNotMatch(materialProps[1], /\bcustomTrack\b/);

  assert.equal(audit.web.dedicatedTrackIconProp, false);
  assert.equal(audit.web.arbitraryComposeTrackComposableProp, false);
  assert.equal(audit.web.publicApiChange, false);
  assert.equal(audit.web.productionRendererChange, false);
  assert.equal(audit.web.canonicalDtcgChange, false);
  assert.equal(audit.web.generatedCssChange, false);
  assert.match(sliderReadme, /Disposition: \*\*intentional web adaptation\*\*/);
  assert.match(sliderReadme, /20dp icon \/ 10dp padding/);
  assert.match(sliderReadme, /Material Web 34\.0\.21 and Figma/);
});
