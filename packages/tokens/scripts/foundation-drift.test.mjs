import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { material3Sources } from './sources.mjs';

const audit = JSON.parse(await readFile(new URL('../audit/foundation-drift.json', import.meta.url), 'utf8'));
const generatedUrl = new URL('../dist/generated/tokens.js', import.meta.url);
async function generated() { return import(`${generatedUrl.href}?foundation-drift=${Date.now()}`); }
function drift(section, id) { return audit[section].drift.find((entry) => entry.id === id); }

test('foundation drift fixture is pinned to both Material Web latest-generated and public-adapter generations', () => {
  assert.equal(audit.sources.figma.version, material3Sources.figma.version);
  assert.equal(audit.sources.compose.revision, material3Sources.compose.revision);
  assert.equal(audit.sources.materialWeb.revision, material3Sources.materialWeb.revision);
  assert.equal(audit.sources.materialWeb.latestGeneratedVersion, material3Sources.materialWeb.latestGeneratedVersion);
  assert.equal(audit.sources.materialWeb.publicAdapterVersion, material3Sources.materialWeb.publicAdapterVersion);
});

test('shape scale agrees with current Compose and Material Web latest while older/public representations stay classified', async () => {
  const token = await generated();
  assert.deepEqual([
    token.ShapeCornerNone, token.ShapeCornerExtraSmall, token.ShapeCornerSmall,
    token.ShapeCornerMedium, token.ShapeCornerLarge, token.ShapeCornerLargeIncreased,
    token.ShapeCornerExtraLarge, token.ShapeCornerExtraLargeIncreased, token.ShapeCornerExtraExtraLarge,
  ], ['0px', '4px', '8px', '12px', '16px', '20px', '28px', '32px', '48px']);
  assert.equal(audit.shape.figma.values.full, 1000);
  assert.equal(audit.shape.materialWeb.latestGenerated.values.full, 9999);
  assert.equal(audit.shape.compose.values.full, 'CircleShape');
  assert.equal(drift('shape', 'shape-full-sentinel').classification, 'semantic-equivalent');
  assert.equal(drift('shape', 'shape-figma-new-radii').preferredReference, 'compose+materialWebLatest');
  assert.equal(drift('shape', 'shape-web-public-adapter').classification, 'public-adapter-lag');
});

test('state layer opacities match Compose and Material Web latest, not the older public adapter', async () => {
  const token = await generated();
  assert.deepEqual([token.StateLayerOpacityHover, token.StateLayerOpacityFocus, token.StateLayerOpacityPressed, token.StateLayerOpacityDragged], [0.08, 0.1, 0.1, 0.16]);
  assert.deepEqual(audit.state.materialWeb.latestGenerated, { hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16, disabled: 0.38 });
  assert.equal(audit.state.materialWeb.publicAdapter.focus, 0.12);
  assert.equal(audit.state.materialWeb.publicAdapter.pressed, 0.12);
  assert.equal(drift('state', 'state-web-public-adapter').classification, 'public-adapter-lag');
});

test('emphasized typography follows Figma plus Material Web latest where Compose is explicitly TODO', async () => {
  const token = await generated();
  const roles = ['Display', 'Headline', 'Title', 'Body', 'Label'];
  const sizes = ['Large', 'Medium', 'Small'];
  for (const role of roles) for (const size of sizes) {
    assert.ok(Object.hasOwn(token, `Typography${role}${size}FontSize`));
    assert.ok(Object.hasOwn(token, `Typography${role}${size}EmphasizedFontSize`));
  }
  assert.equal(token.TypefaceWeightSemiBold, 600);
  assert.equal(token.TypographyBodyLargeEmphasizedLetterSpacing, '0.5px');
  assert.equal(token.TypographyDisplayLargeEmphasizedLetterSpacing, '-0.25px');
  assert.equal(token.TypographyLabelLargeEmphasizedFontWeight, 600);
  assert.equal(token.TypographyLabelMediumEmphasizedFontWeight, 600);
  assert.equal(token.TypographyLabelSmallEmphasizedFontWeight, 600);
  assert.equal(token.TypographyTitleMediumEmphasizedFontWeight, 600);
  assert.equal(token.TypographyTitleSmallEmphasizedFontWeight, 600);
  assert.equal(audit.typography.compose.emphasizedBlockMarkedTodo, true);
  assert.equal(audit.typography.materialWeb.latestGenerated.emphasizedStyleCount, 15);
  assert.equal(drift('typography', 'typography-compose-emphasized-todo').preferredReference, 'figma+materialWebLatest');
  assert.equal(drift('typography', 'typography-web-public-adapter').classification, 'public-adapter-lag');
});

test('49-role runtime color vocabulary agrees with Figma and Material Web while Compose partition stays explicit', async () => {
  const token = await generated();
  assert.equal(Object.keys(token).filter((name) => name.startsWith('ColorRole')).length, 49);
  assert.equal(token.ColorRoleShadow, 'var(--shadow)');
  assert.equal(audit.colorRoles.figma.schemeVariableCount, 49);
  assert.equal(audit.colorRoles.materialWeb.latestGeneratedRoleCount, 49);
  assert.equal(audit.colorRoles.compose.colorSchemeKeyCount, 48);
  assert.equal(drift('colorRoles', 'color-shadow-compose-partition').classification, 'implementation-partition');
});

test('motion distinguishes latest Material Web standard springs from missing expressive springs and old adapters', async () => {
  const token = await generated();
  assert.equal(token.MotionSpringStandardDefaultSpatialDampingRatio, 0.9);
  assert.equal(token.MotionSpringStandardDefaultSpatialStiffness, 700);
  assert.equal(token.MotionSpringStandardFastEffectsStiffness, 3800);
  assert.equal(token.MotionSpringExpressiveDefaultSpatialDampingRatio, 0.8);
  assert.equal(token.MotionSpringExpressiveDefaultSpatialStiffness, 380);
  assert.equal(token.MotionSpringExpressiveFastSpatialDampingRatio, 0.6);
  assert.equal(token.MotionSpringExpressiveFastSpatialStiffness, 800);
  assert.equal(token.MotionSpringExpressiveSlowSpatialStiffness, 200);
  assert.equal(audit.motion.materialWeb.latestGenerated.standardSpringFamilies, 6);
  assert.equal(audit.motion.materialWeb.latestGenerated.expressiveSpringFamiliesObserved, 0);
  assert.equal(drift('motion', 'motion-expressive-web-latest').classification, 'source-lag');
  assert.equal(drift('motion', 'motion-web-public-adapter').classification, 'public-adapter-lag');
  assert.equal(drift('motion', 'motion-spring-figma').classification, 'not-observed');
});

test('elevation latest generated semantics match while render/API adaptations stay separate', async () => {
  const token = await generated();
  assert.deepEqual([token.ElevationLevel0, token.ElevationLevel1, token.ElevationLevel2, token.ElevationLevel3, token.ElevationLevel4, token.ElevationLevel5], ['0px', '1px', '3px', '6px', '8px', '12px']);
  assert.deepEqual(audit.elevation.materialWeb.latestGeneratedSemanticLevelDp, [0, 1, 3, 6, 8, 12]);
  assert.deepEqual(audit.elevation.materialWeb.publicAdapterLevelApi, [0, 1, 2, 3, 4, 5]);
  assert.equal(token.ElevationShadowLevel5Layer1Opacity, 0.2);
  assert.equal(token.ElevationShadowLevel5Layer2Opacity, 0.14);
  assert.equal(token.ElevationShadowLevel5Layer3Opacity, 0.12);
  assert.equal(audit.elevation.figma.shadowLayerCount, 2);
  assert.equal(drift('elevation', 'elevation-web-level-api').classification, 'platform-adaptation');
  assert.equal(drift('elevation', 'elevation-figma-shadow-recipe').classification, 'platform-adaptation');
});
