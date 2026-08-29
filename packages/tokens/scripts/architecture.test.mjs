import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const repoRoot = new URL('../../../', import.meta.url);
const uiSourceRoot = new URL('../ui/src/', packageRoot);

const allowedTokenCssSubpaths = new Set([
  '@m3-ui/tokens/button.css',
  '@m3-ui/tokens/chip.css',
  '@m3-ui/tokens/text-field.css',
  '@m3-ui/tokens/elevation.css',
  '@m3-ui/tokens/ripple.css',
]);

const legacyElevationSerializerCallers = new Set([
  'components/BottomAppBar/BottomAppBar.defaults.ts',
  'components/BottomSheet/BottomSheet.defaults.ts',
  'components/Button/Button.defaults.ts',
  'components/ButtonGroup/ButtonGroup.defaults.ts',
  'components/DatePicker/DatePicker.defaults.ts',
  'components/FloatingToolbar/FloatingToolbar.defaults.ts',
  'components/ListItem/ListItem.defaults.ts',
  'components/Menu/Menu.defaults.ts',
  'components/NavigationDrawer/NavigationDrawer.defaults.ts',
  'components/NavigationRail/NavigationRail.defaults.ts',
  'components/SearchBar/SearchBar.defaults.ts',
  'components/TopAppBar/TopAppBar.defaults.ts',
  'components/WideNavigationRail/ModalWideNavigationRail.defaults.ts',
  'components/WideNavigationRail/WideNavigationRail.defaults.ts',
]);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) files.push(...(await sourceFiles(new URL(`${entry.name}/`, directory))));
    else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) files.push(url);
  }
  return files;
}

function uiRelativePath(file) {
  return decodeURIComponent(file.pathname.split('/packages/ui/src/')[1] ?? '');
}

test('handwritten token runtime and upstream-sync layers stay deleted', async () => {
  await assert.rejects(access(new URL('src/', packageRoot)));
  await assert.rejects(access(new URL('scripts/compose-sync/', repoRoot)));
  const rootManifest = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'));
  for (const [name, command] of Object.entries(rootManifest.scripts ?? {})) {
    assert.doesNotMatch(`${name} ${command}`, /compose:sync|scripts\/compose-sync/, `root script ${name} must not resurrect the legacy sync pipeline`);
  }
});

test('Style Dictionary reads only canonical DTCG and emits reviewed platform artifacts', async () => {
  const configUrl = new URL('style-dictionary.config.mjs', packageRoot);
  const { default: config } = await import(`${configUrl.href}?architecture=${Date.now()}`);
  assert.deepEqual(config.source, ['tokens/**/*.json']);
  assert.equal(Object.hasOwn(config, 'include'), false, 'upstream references must never be Style Dictionary includes');
  assert.deepEqual(Object.keys(config.platforms), ['js', 'css']);
  assert.deepEqual(config.platforms.css.files.map((file) => file.destination), ['button.css', 'chip.css', 'text-field.css', 'elevation.css', 'ripple.css'], 'CSS output must stay explicit and consumer-driven rather than becoming a generic token dump');
});

test('package exposes generated JS root plus reviewed CSS adapters', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
  assert.equal(manifest.main, './dist/generated/tokens.js');
  assert.equal(manifest.module, './dist/generated/tokens.js');
  assert.equal(manifest.types, './dist/generated/tokens.d.ts');
  assert.deepEqual(Object.keys(manifest.exports), ['.', './button.css', './chip.css', './text-field.css', './elevation.css', './ripple.css']);
  for (const name of ['button', 'chip', 'text-field', 'elevation', 'ripple']) assert.equal(manifest.exports[`./${name}.css`], `./dist/generated/${name}.css`);
  assert.doesNotMatch(manifest.scripts.build, /\btsc\b/);
  assert.equal(Object.hasOwn(manifest.scripts, 'typecheck'), false);
});

test('Style Dictionary skill describes runtime color ownership and generated adapters', async () => {
  const skill = await readFile(new URL('.agents/skills/style-dictionary/SKILL.md', repoRoot), 'utf8');
  assert.match(skill, /no handwritten runtime `src\/` layer/i);
  assert.match(skill, /## Runtime color model/i);
  assert.match(skill, /ThemeProvider/i);
  assert.match(skill, /owns (?:the concrete runtime value of|actual) Material color/i);
  assert.match(skill, /component.*reference.*role/is);
  assert.match(skill, /platform adapter/i);
  assert.match(skill, /Do not decode `var\(--role\)`/i);
  assert.match(skill, /elevation/i);
  assert.match(skill, /ripple/i);
  assert.match(skill, /local architecture contract/i);
});

test('foundation docs lock change-local interaction-effect contracts', async () => {
  const architecture = await readFile(new URL('docs/architecture/README.md', repoRoot), 'utf8');
  const elevation = await readFile(new URL('packages/ui/src/internal/elevation/README.md', repoRoot), 'utf8');
  const ripple = await readFile(new URL('packages/ui/src/internal/ripple/README.md', repoRoot), 'utf8');
  assert.match(architecture, /## Change-local documentation contract/i);
  assert.match(architecture, /read that contract before editing/i);
  assert.match(architecture, /component color tokens alias those canonical roles/i);
  assert.match(architecture, /generated platform CSS/i);
  assert.match(elevation, /Style Dictionary owns CSS serialization/i);
  assert.match(elevation, /must not rebuild canonical shadow geometry in TypeScript/i);
  assert.match(elevation, /cross-source drift/i);
  assert.match(elevation, /New code must not add new callers/i);
  assert.match(elevation, /Browser\/visual contract tests.*actual paint layer/is);
  assert.match(elevation, /must not require the interactive\/root element itself to own `box-shadow`/i);
  assert.match(ripple, /useRipple\(\).*wave geometry/is);
  assert.match(ripple, /generated `ripple\.css` owns immutable/i);
  assert.match(ripple, /must not be copied.*React `style`/is);
  assert.match(ripple, /React Aria\/native host semantics own normalized interaction events/i);
  assert.match(ripple, /Browser\/visual tests must instead validate the \*\*computed semantic value\*\*/i);
  assert.match(ripple, /bundler\/minifier.*0\.08.*\.08/is);
});

test('UI token subpath imports are limited to reviewed generated platform adapters', async () => {
  for (const file of await sourceFiles(uiSourceRoot)) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/['"](@m3-ui\/tokens\/[^'"]+)['"]/g)].map((match) => match[1]);
    for (const specifier of imports) assert.ok(allowedTokenCssSubpaths.has(specifier), `${file.pathname} imports unsupported token subpath ${specifier}`);
  }
});

test('Elevation and Ripple primitives do not serialize immutable design tokens in React', async () => {
  const elevation = await readFile(new URL('../ui/src/internal/elevation/Elevation.tsx', packageRoot), 'utf8');
  const ripple = await readFile(new URL('../ui/src/internal/ripple/Ripple.tsx', packageRoot), 'utf8');
  const button = await readFile(new URL('../ui/src/components/Button/Button.tsx', packageRoot), 'utf8');
  assert.match(elevation, /@m3-ui\/tokens\/elevation\.css/);
  assert.doesNotMatch(elevation, /getElevationBoxShadow|elevationShadowLayers/);
  assert.match(ripple, /@m3-ui\/tokens\/ripple\.css/);
  assert.doesNotMatch(ripple, /import \* as token from '@m3-ui\/tokens'/);
  assert.doesNotMatch(ripple, /RippleRadiusDuration|StateLayerOpacityHover|RippleFocusRingOuterStrokeWidth/);
  assert.match(button, /<Elevation/);
  assert.doesNotMatch(button, /getElevationBoxShadow/);
  assert.match(button, /legacyInlineElevation: false/);
});

test('Chip static colors are compiler-owned instead of decoded and rebuilt in TypeScript', async () => {
  const chip = await readFile(new URL('../ui/src/components/Chip/Chip.tsx', packageRoot), 'utf8');
  const chipTokens = await readFile(new URL('../ui/src/components/Chip/Chip.tokens.ts', packageRoot), 'utf8');
  const chipDefaults = await readFile(new URL('../ui/src/components/Chip/Chip.defaults.ts', packageRoot), 'utf8');
  const chipContract = await readFile(new URL('../ui/src/components/Chip/README.md', packageRoot), 'utf8');
  assert.match(chip, /@m3-ui\/tokens\/chip\.css/);
  assert.doesNotMatch(chipTokens, /\bcolorRole\b/);
  assert.doesNotMatch(chipDefaults, /\broleVariable\b|\bcolorRoleVariable\b|color-mix\(in srgb/);
  assert.doesNotMatch(chipDefaults, /--_chip-(?:container-color|label-color|leading-icon-color|trailing-icon-color|outline-color|outline-width)/);
  assert.match(chipContract, /Style Dictionary compiles.*color\/outline matrix/is);
  assert.match(chipContract, /must not decode `var\(--role\)`/i);
});

test('TextField immutable defaults are compiler-owned with no React token projection layer', async () => {
  const textField = await readFile(new URL('../ui/src/components/TextField/TextField.tsx', packageRoot), 'utf8');
  const contract = await readFile(new URL('../ui/src/components/TextField/README.md', packageRoot), 'utf8');
  assert.match(textField, /@m3-ui\/tokens\/text-field\.css/);
  assert.doesNotMatch(textField, /TextField\.defaults|TextField\.tokens|filledTextFieldBaseStyle|outlinedTextFieldBaseStyle/);
  await assert.rejects(access(new URL('../ui/src/components/TextField/TextField.tokens.ts', packageRoot)));
  await assert.rejects(access(new URL('../ui/src/components/TextField/TextField.defaults.ts', packageRoot)));
  assert.match(contract, /no immutable design-token projection layer in React/i);
  assert.match(contract, /complete immutable base-style projection/i);
});

test('Tooltip colors stay semantic and RichTooltip elevation paints through the shared primitive', async () => {
  const tooltipTokens = JSON.parse(await readFile(new URL('tokens/component/tooltip.json', packageRoot), 'utf8'));
  const sharedStates = JSON.parse(await readFile(new URL('tokens/component/tooltip-snackbar-web-states.json', packageRoot), 'utf8'));
  const tooltip = await readFile(new URL('../ui/src/components/Tooltip/Tooltip.tsx', packageRoot), 'utf8');
  const defaults = await readFile(new URL('../ui/src/components/Tooltip/Tooltip.defaults.ts', packageRoot), 'utf8');
  const contract = await readFile(new URL('../ui/src/components/Tooltip/README.md', packageRoot), 'utf8');
  const styleDependencies = await readFile(new URL('../ui/scripts/generated-style-dependencies.mjs', packageRoot), 'utf8');

  assert.equal(tooltipTokens.component.tooltip.plain.containerColor.$value, '{color.role.inverseSurface}');
  assert.equal(tooltipTokens.component.tooltip.rich.containerColor.$value, '{color.role.surfaceContainer}');
  assert.equal(tooltipTokens.component.tooltip.rich.actionLabelTextColor.$value, '{color.role.primary}');
  assert.equal(sharedStates.component.tooltip.rich.containerShadowColor.$value, '{color.role.shadow}');
  assert.match(tooltip, /<Elevation/);
  assert.match(tooltip, /shadowColor=\{shadowColor \?\? richTooltipTokens\.containerShadowColor\}/);
  assert.doesNotMatch(defaults, /getElevationBoxShadow|--_rich-tooltip-box-shadow/);
  assert.match(styleDependencies, /src\/components\/Tooltip\/tooltip\.css[\s\S]*dist\/generated\/elevation\.css[\s\S]*internal\/elevation\/elevation\.css/);
  assert.match(contract, /Browser tests must inspect `\.rich-tooltip__elevation`/i);
  assert.match(contract, /must not call `getElevationBoxShadow\(\)`/i);
});

test('Snackbar colors stay semantic and its static level3 elevation paints through the shared primitive', async () => {
  const snackbarTokens = JSON.parse(await readFile(new URL('tokens/component/snackbar.json', packageRoot), 'utf8'));
  const sharedStates = JSON.parse(await readFile(new URL('tokens/component/tooltip-snackbar-web-states.json', packageRoot), 'utf8'));
  const snackbar = await readFile(new URL('../ui/src/components/Snackbar/Snackbar.tsx', packageRoot), 'utf8');
  const defaults = await readFile(new URL('../ui/src/components/Snackbar/Snackbar.defaults.ts', packageRoot), 'utf8');
  const contract = await readFile(new URL('../ui/src/components/Snackbar/README.md', packageRoot), 'utf8');
  const styleDependencies = await readFile(new URL('../ui/scripts/generated-style-dependencies.mjs', packageRoot), 'utf8');

  assert.equal(snackbarTokens.component.snackbar.action.labelTextColor.$value, '{color.role.inversePrimary}');
  assert.equal(snackbarTokens.component.snackbar.container.color.$value, '{color.role.inverseSurface}');
  assert.equal(snackbarTokens.component.snackbar.icon.color.$value, '{color.role.inverseOnSurface}');
  assert.equal(sharedStates.component.snackbar.container.shadowColor.$value, '{color.role.shadow}');
  assert.match(snackbar, /<Elevation/);
  assert.match(snackbar, /shadowColor=\{shadowColor \?\? snackbarTokens\.containerShadowColor\}/);
  assert.doesNotMatch(defaults, /getElevationBoxShadow|--_snackbar-box-shadow/);
  assert.match(styleDependencies, /src\/components\/Snackbar\/snackbar\.css[\s\S]*dist\/generated\/elevation\.css[\s\S]*internal\/elevation\/elevation\.css/);
  assert.match(contract, /Browser\/visual tests must inspect `\.snackbar__elevation`/i);
  assert.match(contract, /call `getElevationBoxShadow\(\)` from `Snackbar\.defaults\.ts`/i);
  assert.match(contract, /interaction-dependent action\/icon mappings are behavior/i);
});

test('Dialog colors stay semantic and its scroll surface stays separate from Elevation paint', async () => {
  const surfaceControls = JSON.parse(await readFile(new URL('tokens/component/surface-controls.json', packageRoot), 'utf8'));
  const dialogStates = JSON.parse(await readFile(new URL('tokens/component/dialog-sheet-web-states.json', packageRoot), 'utf8'));
  const dialog = await readFile(new URL('../ui/src/components/Dialog/Dialog.tsx', packageRoot), 'utf8');
  const defaults = await readFile(new URL('../ui/src/components/Dialog/Dialog.defaults.ts', packageRoot), 'utf8');
  const contract = await readFile(new URL('../ui/src/components/Dialog/README.md', packageRoot), 'utf8');
  const styleDependencies = await readFile(new URL('../ui/scripts/generated-style-dependencies.mjs', packageRoot), 'utf8');
  const tokens = surfaceControls.component.dialog;
  const states = dialogStates.component.dialog;

  assert.equal(tokens.actionLabelTextColor.$value, '{color.role.primary}');
  assert.equal(tokens.containerColor.$value, '{color.role.surfaceContainerHigh}');
  assert.equal(tokens.headlineColor.$value, '{color.role.onSurface}');
  assert.equal(tokens.supportingTextColor.$value, '{color.role.onSurfaceVariant}');
  assert.equal(tokens.iconColor.$value, '{color.role.secondary}');
  assert.equal(states.actionFocusStateLayerColor.$value, '{color.role.primary}');
  assert.equal(states.actionHoverStateLayerColor.$value, '{color.role.primary}');
  assert.equal(states.actionPressedStateLayerColor.$value, '{color.role.primary}');
  assert.match(dialog, /<Elevation/);
  assert.match(dialog, /className="dialog__elevation"/);
  assert.match(dialog, /className="dialog-surface"/);
  assert.match(dialog, /shadowColor=\{shadowColor\}/);
  assert.doesNotMatch(defaults, /getElevationBoxShadow|--_dialog-box-shadow/);
  assert.match(styleDependencies, /src\/components\/Dialog\/dialog\.css[\s\S]*dist\/generated\/elevation\.css[\s\S]*internal\/elevation\/elevation\.css/);
  assert.match(contract, /Elevation must stay outside.*clipped scroll surface/i);
  assert.match(contract, /Browser\/visual tests inspect `\.dialog__elevation`/i);
  assert.match(contract, /separate shared UI layout workstream/i);
});

test('runtime color CSS expressions are never decoded back into semantic token names', async () => {
  const tokenValues = await readFile(new URL('../ui/src/internal/tokenValues.ts', packageRoot), 'utf8');
  assert.doesNotMatch(tokenValues, /\bcolorRole\b/);
  for (const file of await sourceFiles(uiSourceRoot)) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /\bcolorRole\s*\(/, `${uiRelativePath(file)} must use semantic DTCG aliases/generated CSS rather than decode var(--role)`);
  }
});

test('legacy TypeScript elevation serialization is frozen to the existing migration allowlist', async () => {
  const observed = new Set();
  for (const file of await sourceFiles(uiSourceRoot)) {
    const relative = uiRelativePath(file);
    if (!relative || relative.startsWith('internal/elevation/')) continue;
    if (/\.(?:test|stories)\.[jt]sx?$/.test(relative)) continue;
    const source = await readFile(file, 'utf8');
    if (!source.includes('getElevationBoxShadow')) continue;
    observed.add(relative);
    assert.ok(legacyElevationSerializerCallers.has(relative), `${relative} adds a new legacy getElevationBoxShadow caller; use <Elevation> + generated elevation.css instead`);
  }
  assert.deepEqual([...observed].sort(), [...legacyElevationSerializerCallers].sort(), 'legacy elevation allowlist changed; migrations must remove the caller from this set in the same PR');
});
