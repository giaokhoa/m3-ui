export const generatedStyleDependencies = {
  'src/components/Button/button.css': ['../tokens/dist/generated/button.css'],
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
