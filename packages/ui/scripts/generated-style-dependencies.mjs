export const generatedStyleDependencies = {
  'src/internal/elevation/elevation.css': [
    '../tokens/dist/generated/elevation.css',
  ],
  'src/internal/ripple/ripple.css': ['../tokens/dist/generated/ripple.css'],
  'src/components/Button/button.css': [
    '../tokens/dist/generated/elevation.css',
    'src/internal/elevation/elevation.css',
    '../tokens/dist/generated/button.css',
  ],
  'src/components/Chip/chip.css': ['../tokens/dist/generated/chip.css'],
  'src/components/TextField/text-field.css': [
    '../tokens/dist/generated/text-field.css',
  ],
  'src/components/Tooltip/tooltip.css': [
    '../tokens/dist/generated/elevation.css',
    'src/internal/elevation/elevation.css',
  ],
  'src/components/Snackbar/snackbar.css': [
    '../tokens/dist/generated/elevation.css',
    'src/internal/elevation/elevation.css',
  ],
  'src/components/Dialog/dialog.css': [
    '../tokens/dist/generated/elevation.css',
    'src/internal/elevation/elevation.css',
  ],
};

export function expandStyleSources(sources) {
  const expanded = [];
  for (const source of sources) {
    for (const dependency of generatedStyleDependencies[source] ?? []) {
      if (!expanded.includes(dependency)) expanded.push(dependency);
    }
    if (!expanded.includes(source)) expanded.push(source);
  }
  return expanded;
}
