import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { material3Sources } from './sources.mjs';

const audit = JSON.parse(await readFile(new URL('../audit/foundation-drift.json', import.meta.url), 'utf8'));
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated() { return import(`${generatedUrl.href}?foundation-drift=${Date.now()}`); }

function drift(section, id) {
  return audit[section].drift.find((entry) => entry.id === id);
}

test('foundation drift fixture is pinned to the audited reference revisions', () => {
  assert.equal(audit.sources.figma.version, material3Sources.figma.version);
  assert.equal(audit.sources.figma.releasedAt, material3Sources.figma.releasedAt);
  assert.equal(audit.sources.compose.revision, material3Sources.compose.revision);
  assert.equal(audit.sources.compose.revisionAt, material3Sources.compose.revisionAt);
  assert.equal(audit.sources.materialWeb.revision, material3Sources.materialWeb.revision);
  assert.equal(audit.sources.materialWeb.revisionAt, material3Sources.materialWeb.revisionAt);
});

test('canonical shape keeps current Compose expressive radii and records reference drift', async () => {
  const token = await generated();
  assert.deepEqual([
    token.ShapeCornerNone,
    token.ShapeCornerExtraSmall,
    token.ShapeCornerSmall,
    token.ShapeCornerMedium,
    token.ShapeCornerLarge,
    token.ShapeCornerLargeIncreased,
    token.ShapeCornerExtraLarge,
    token.ShapeCornerExtraLargeIncreased,
    token.ShapeCornerExtraExtraLarge,
  ], ['0px', '4px', '8px', '12px', '16px', '20px', '28px', '32px', '48px']);
  assert.equal(audit.shape.figma.values.full, 1000);
  assert.equal(audit.shape.materialWeb.values.full, 9999);
  assert.equal(audit.shape.compose.values.full, 'CircleShape');
  assert.equal(drift('shape', 'shape-full-sentinel').classification, 'semantic-equivalent');
  assert.equal(drift('shape', 'shape-large-increased-web').classification, 'source-lag');
  assert.equal(drift('shape', 'shape-extra-large-increased').preferredReference, 'compose');
  assert.equal(drift('shape', 'shape-extra-extra-large').preferredReference, 'compose');
});

test('state layer opacities follow current Compose and classify older Web values as source lag', async () => {
  const token = await generated();
  assert.deepEqual([
    token.StateLayerOpacityHover,
    token.StateLayerOpacityFocus,
    token.StateLayerOpacityPressed,
    token.StateLayerOpacityDragged,
  ], [0.08, 0.1, 0.1, 0.16]);
  assert.deepEqual(audit.materialWeb ?? undefined, undefined);
  assert.equal(audit.state.materialWeb.focus, 0.12);
  assert.equal(audit.state.materialWeb.pressed, 0.12);
  assert.deepEqual(audit.state.figma.observedOpacityVocabulary, [0.08, 0.1, 0.16]);
  assert.equal(drift('state', 'state-focus-pressed-web').classification, 'source-lag');
});

test('typography keeps all 15 baseline and 15 emphasized styles while Web lag stays explicit', async () => {
  const token = await generated();
  const roles = ['Display', 'Headline', 'Title', 'Body', 'Label'];
  const sizes = ['Large', 'Medium', 'Small'];
  let baseline = 0;
  let emphasized = 0;
  for (const role of roles) {
    for (const size of sizes) {
      assert.ok(Object.hasOwn(token, `Typography${role}${size}FontSize`));
      assert.ok(Object.hasOwn(token, `Typography${role}${size}EmphasizedFontSize`));
      baseline += 1;
      emphasized += 1;
    }
  }
  assert.equal(baseline, audit.typography.canonical.baselineStyleCount);
  assert.equal(emphasized, audit.typography.canonical.emphasizedStyleCount);
  assert.equal(audit.typography.figma.emphasizedWeightCount, 15);
  assert.equal(audit.typography.figma.emphasizedTextStyleCount, 15);
  assert.equal(audit.typography.materialWeb.fullEmphasizedStyleVocabularyObserved, false);
  assert.equal(drift('typography', 'typography-emphasized-web').classification, 'source-lag');
});

test('49-role runtime color vocabulary agrees with Figma and Web while Compose partition stays explicit', async () => {
  const token = await generated();
  const roleNames = Object.keys(token).filter((name) => name.startsWith('ColorRole'));
  assert.equal(roleNames.length, 49);
  assert.equal(token.ColorRoleShadow, 'var(--shadow)');
  assert.equal(token.ColorRolePrimaryFixed, 'var(--primary-fixed)');
  assert.equal(token.ColorRoleSurfaceContainerHighest, 'var(--surface-container-highest)');
  assert.equal(audit.colorRoles.figma.schemeVariableCount, 49);
  assert.equal(audit.colorRoles.materialWeb.supportedSystemRoleCount, 49);
  assert.equal(audit.colorRoles.compose.colorSchemeKeyCount, 48);
  assert.equal(drift('colorRoles', 'color-shadow-compose-partition').classification, 'implementation-partition');
});

test('spring physics follows current Compose and does not infer absent Figma or Web tokens', async () => {
  const token = await generated();
  assert.equal(token.MotionSpringStandardDefaultSpatialDampingRatio, 0.9);
  assert.equal(token.MotionSpringStandardDefaultSpatialStiffness, 700);
  assert.equal(token.MotionSpringStandardFastEffectsStiffness, 3800);
  assert.equal(token.MotionSpringExpressiveDefaultSpatialDampingRatio, 0.8);
  assert.equal(token.MotionSpringExpressiveDefaultSpatialStiffness, 380);
  assert.equal(token.MotionSpringExpressiveFastSpatialDampingRatio, 0.6);
  assert.equal(token.MotionSpringExpressiveFastSpatialStiffness, 800);
  assert.equal(token.MotionSpringExpressiveSlowSpatialStiffness, 200);
  assert.equal(drift('motion', 'motion-spring-web').classification, 'source-lag');
  assert.equal(drift('motion', 'motion-spring-figma').classification, 'not-observed');
});

test('elevation separates semantic levels from platform-specific shadow rendering', async () => {
  const token = await generated();
  assert.deepEqual([
    token.ElevationLevel0,
    token.ElevationLevel1,
    token.ElevationLevel2,
    token.ElevationLevel3,
    token.ElevationLevel4,
    token.ElevationLevel5,
  ], ['0px', '1px', '3px', '6px', '8px', '12px']);
  assert.equal(token.ElevationShadowLevel5Layer1Opacity, 0.2);
  assert.equal(token.ElevationShadowLevel5Layer2Opacity, 0.14);
  assert.equal(token.ElevationShadowLevel5Layer3Opacity, 0.12);
  assert.equal(audit.elevation.figma.shadowLayerCount, 2);
  assert.equal(audit.elevation.canonical.shadowLayerCount, 3);
  assert.equal(drift('elevation', 'elevation-web-level-api').classification, 'platform-adaptation');
  assert.equal(drift('elevation', 'elevation-figma-shadow-recipe').classification, 'platform-adaptation');
});
