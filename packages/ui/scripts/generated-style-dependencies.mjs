import { listCssAdapterNames } from '../../tokens/style-dictionary/adapter-registry.mjs';

const themeFoundationCss = '../tokens/dist/generated/theme.css';
const generatedAdapterNames = new Set(listCssAdapterNames());

// Shared runtime/style primitives are separate from generated component adapters.
// Keep only structural dependencies here; generated adapters are discovered by
// matching their convention name to the consumer CSS basename.
export const sharedStyleDependencies = {
  'src/components/Button/button.css': ['src/internal/elevation/elevation.css'],
  'src/components/Card/card.css': ['src/internal/elevation/elevation.css'],
  'src/components/Tooltip/tooltip.css': ['src/internal/elevation/elevation.css'],
  'src/components/Snackbar/snackbar.css': ['src/internal/elevation/elevation.css'],
  'src/components/Dialog/dialog.css': ['src/internal/elevation/elevation.css'],
  'src/components/Menu/menu.css': ['src/internal/elevation/elevation.css'],
  'src/components/FloatingToolbar/floating-toolbar.css': [
    'src/internal/elevation/elevation.css',
  ],
  'src/components/ListItem/list-item.css': ['src/internal/elevation/elevation.css'],
  'src/components/BottomSheet/bottom-sheet.css': [
    'src/internal/elevation/elevation.css',
  ],
  'src/components/DatePicker/date-picker.css': [
    'src/internal/elevation/elevation.css',
  ],
  'src/components/TopAppBar/top-app-bar.css': [
    'src/internal/elevation/elevation.css',
  ],
  'src/components/WideNavigationRail/modal-wide-navigation-rail.css': [
    'src/internal/elevation/elevation.css',
  ],
};

function generatedAdapterFor(source) {
  if (!source.startsWith('src/')) return null;
  const fileName = source.split('/').at(-1);
  if (!fileName?.endsWith('.css')) return null;
  const name = fileName.slice(0, -'.css'.length);
  return generatedAdapterNames.has(name)
    ? `../tokens/dist/generated/${name}.css`
    : null;
}

export function expandStyleSources(sources) {
  const expanded = [themeFoundationCss];
  const add = (source) => {
    for (const dependency of sharedStyleDependencies[source] ?? []) add(dependency);
    const generatedAdapter = generatedAdapterFor(source);
    if (generatedAdapter && !expanded.includes(generatedAdapter)) {
      expanded.push(generatedAdapter);
    }
    if (!expanded.includes(source)) expanded.push(source);
  };
  for (const source of sources) add(source);
  return expanded;
}
