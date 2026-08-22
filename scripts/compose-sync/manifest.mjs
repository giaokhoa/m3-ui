export const androidX = {
  repository: 'androidx/androidx',
  revision: '160825094a81825468a95b115bfb1b541e549856',
  tokenRoot:
    'compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens',
};

function lowerCamel(value) {
  return value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function isAndroidXTokenEntry(entry) {
  return (
    entry?.type === 'file' &&
    typeof entry.name === 'string' &&
    entry.name.endsWith('Tokens.kt') &&
    entry.path === `${androidX.tokenRoot}/${entry.name}`
  );
}

export function tokenSourceFromDirectoryEntry(entry) {
  if (!isAndroidXTokenEntry(entry)) {
    throw new Error(`Not an AndroidX Material3 token file: ${entry?.name ?? entry}`);
  }
  if (!/^[0-9a-f]{40}$/.test(entry.sha ?? '')) {
    throw new Error(`Invalid Git blob SHA for ${entry.name}: ${entry.sha}`);
  }

  const objectName = entry.name.slice(0, -'.kt'.length);
  const stem = objectName.slice(0, -'Tokens'.length);
  return {
    file: entry.name,
    path: entry.path,
    blobSha: entry.sha,
    exportName: `${lowerCamel(stem)}TokensGenerated`,
    output: `packages/tokens/src/generated/androidx/${kebab(stem)}.ts`,
  };
}

export function tokenSourcesFromDirectory(entries) {
  if (!Array.isArray(entries)) {
    throw new Error('AndroidX token directory response must be an array');
  }

  const sources = entries
    .filter(isAndroidXTokenEntry)
    .map(tokenSourceFromDirectoryEntry)
    .sort((a, b) => a.file.localeCompare(b.file));

  if (sources.length === 0) {
    throw new Error('No *Tokens.kt files discovered in pinned AndroidX token directory');
  }

  for (const key of ['file', 'path', 'blobSha', 'exportName', 'output']) {
    const values = sources.map((source) => source[key]);
    if (new Set(values).size !== values.length) {
      throw new Error(`Discovered AndroidX token ${key} values are not unique`);
    }
  }

  return sources;
}
