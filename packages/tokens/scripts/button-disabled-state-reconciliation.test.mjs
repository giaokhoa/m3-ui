import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, packageRoot), 'utf8'));
const [reconciliation, variants, drift, figma] = await Promise.all([
  readJson('audit/button-disabled-state-reconciliation.json'),
  readJson('tokens/component/button/variants.json'),
  readJson('audit/material-web-button-variant-drift.json'),
  readJson('audit/figma-button-evidence.json'),
]);

const canonical = variants.component.button.variant;
const decision = (id) => reconciliation.decisions.find((entry) => entry.id === id);

function webStateFile(variant) {
  const file = variant === 'filledTonal' ? 'web-tonal.json' : `web-${variant}.json`;
  return readJson(`tokens/component/button/${file}`);
}

test('Button disabled-state reconciliation records official sources without promoting unverified Material page values', () => {
  assert.equal(reconciliation.schemaVersion, 1);
  assert.equal(reconciliation.issue, 406);
  assert.equal(reconciliation.reviewedAt, '2026-09-12');
  assert.equal(reconciliation.materialSite.status, 'normative-guidance-present-values-not-text-verified');
  assert.match(reconciliation.materialSite.reason, /not exposed as text-verifiable/);
  assert.equal(reconciliation.sources.figma.version, '1.25');
  assert.equal(reconciliation.sources.compose.revision, '059f5aff7b57aa6dc164065e53c55934bec4ee22');
  assert.equal(reconciliation.sources.materialWeb.revision, 'cac97678831d48d4eb4a606ca50f92673a1dc20c');
  assert.equal(reconciliation.sources.materialWeb.latestGeneratedVersion, '34.0.21');
  assert.equal(reconciliation.sources.materialWeb.publicRuntimeTokenGeneration, 'v0_192');
});

test('canonical disabled Button content targets current web design/runtime evidence', async () => {
  const content = decision('disabled-content-role');
  assert.equal(content.disposition, 'web-platform-reference');
  assert.equal(content.figma, 'onSurface @ 0.38');
  assert.equal(content.materialWebLatest, 'onSurface @ 0.38');
  assert.equal(content.materialWebRuntime, 'onSurface @ 0.38');

  for (const variant of ['filled', 'elevated', 'filledTonal', 'outlined', 'text']) {
    assert.equal(canonical[variant].disabledContentColor.$value, '{color.role.onSurface}', `${variant} canonical disabled content`);
    const web = await webStateFile(variant);
    const state = web.component.button.variant[variant];
    assert.equal(state.disabledIconColor.$value, `{component.button.variant.${variant}.disabledContentColor}`, `${variant} icon alias`);
    assert.equal(state.disabledLabelTextColor.$value, `{component.button.variant.${variant}.disabledContentColor}`, `${variant} label alias`);
  }

  assert.equal(content.compose.filled, 'onSurfaceVariant @ 0.38');
  assert.equal(content.compose.filledTonal, 'onSurface @ 0.38');
});

test('Text and Outlined disabled containers stay transparent because both observable runtimes override design/generated values', () => {
  const containers = decision('text-outlined-disabled-container');
  assert.equal(containers.disposition, 'observable-runtime-override');
  assert.equal(containers.figma, 'onSurface @ 0.10');
  assert.equal(containers.materialWebRuntime, 'transparent');
  assert.equal(containers.composeRuntime, 'transparent');
  assert.equal(canonical.text.disabledContainerColor.$value, 'transparent');
  assert.equal(canonical.outlined.disabledContainerColor.$value, 'transparent');

  const runtimeOverrides = new Map(drift.runtimeOverrides.map((entry) => [entry.id, entry]));
  assert.equal(runtimeOverrides.get('button-text-disabled-container-runtime-override')?.preferredReference, 'composeRuntime+materialWebRuntime');
  assert.equal(runtimeOverrides.get('button-outlined-disabled-container-runtime-override')?.canonical, 'transparent');
});

test('Outlined disabled outline remains an explicit runtime skew instead of pretending Figma, Web, and Compose agree', () => {
  const outline = decision('outlined-disabled-outline');
  assert.equal(outline.disposition, 'compose-runtime-web-adaptation-until-normative-resolution');
  assert.equal(outline.figma, 'outlineVariant @ 1.0');
  assert.equal(outline.materialWebRuntime, 'onSurface @ 0.12 via v0_192 public adapter');
  assert.equal(outline.composeRuntime, 'outlineVariant @ 0.10');
  assert.equal(canonical.outlined.outlineColor.$value, '{color.role.outlineVariant}');
  assert.equal(canonical.outlined.disabledOutlineOpacity.$value, 0.1);
  assert.equal(
    drift.runtimeOverrides.find((entry) => entry.id === 'button-outlined-disabled-outline-runtime-skew')?.preferredReference,
    'composeRuntime-adaptation',
  );
});

test('stale Tonal disabled-content drift is removed because all reviewed sources now converge', () => {
  const ids = new Set(drift.drift.map((entry) => entry.id));
  assert.equal(ids.has('button-tonal-disabled-icon-color'), false);
  assert.equal(ids.has('button-tonal-disabled-label-color'), false);
  const convergence = drift.resolvedConvergence.find((entry) => entry.id === 'button-tonal-disabled-content-color');
  assert.equal(convergence?.composeGenerated, 'on-surface');
  assert.equal(convergence?.composeRuntime, 'on-surface');
  assert.equal(convergence?.canonical, 'on-surface');
});

test('Figma issue-406 findings carry resolved dispositions while later Button audit work stays open', () => {
  const records = new Map(figma.reconciliation.trackedDrift.map((entry) => [entry.id, entry]));
  assert.equal(records.get('button-disabled-content-role')?.status, 'resolved-web-reference');
  assert.equal(records.get('button-text-disabled-container')?.status, 'resolved-runtime-adaptation');
  assert.equal(records.get('button-outlined-disabled-presentation')?.status, 'resolved-mixed-runtime-adaptation');
  assert.equal(records.get('button-default-small-icon-size')?.status, 'resolved-current-small-default');
  assert.equal(records.get('button-square-size-helper')?.status, 'unresolved');
  assert.equal(records.get('button-storybook-spec-locks')?.status, 'unresolved');
});
