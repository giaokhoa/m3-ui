export function packageNameFromSpecifier(specifier) {
  if (
    typeof specifier !== 'string' ||
    specifier.length === 0 ||
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('\0')
  ) {
    return null;
  }

  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');
    return scope && name ? `${scope}/${name}` : null;
  }

  return specifier.split('/')[0] || null;
}

export function runtimeDependencyNames(manifest) {
  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
}

export function createRuntimeExternalPredicate(manifest) {
  const runtimeDependencies = runtimeDependencyNames(manifest);

  return (specifier) => {
    const packageName = packageNameFromSpecifier(specifier);
    return packageName !== null && runtimeDependencies.has(packageName);
  };
}
