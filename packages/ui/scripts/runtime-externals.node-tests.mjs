import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  createRuntimeExternalPredicate,
  packageNameFromSpecifier,
  runtimeDependencyNames,
} from './runtime-externals.mjs';

const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

const isExternal = createRuntimeExternalPredicate(manifest);

test('package import classification preserves package roots', () => {
  assert.equal(packageNameFromSpecifier('react'), 'react');
  assert.equal(packageNameFromSpecifier('react/jsx-runtime'), 'react');
  assert.equal(
    packageNameFromSpecifier('@m3-ui/tokens/theme.css'),
    '@m3-ui/tokens',
  );
  assert.equal(
    packageNameFromSpecifier('@internationalized/date'),
    '@internationalized/date',
  );
  assert.equal(packageNameFromSpecifier('./local-module'), null);
  assert.equal(packageNameFromSpecifier('../local-module'), null);
  assert.equal(packageNameFromSpecifier('/absolute/module.js'), null);
  assert.equal(packageNameFromSpecifier('\0vite/client'), null);
});

test('every manifest dependency and peer plus its subpaths is external', () => {
  const runtimeDependencies = runtimeDependencyNames(manifest);
  assert.ok(runtimeDependencies.size > 0);

  for (const packageName of runtimeDependencies) {
    assert.equal(
      isExternal(packageName),
      true,
      `${packageName} root import must be external`,
    );
    assert.equal(
      isExternal(`${packageName}/example-subpath`),
      true,
      `${packageName} subpath imports must be external`,
    );
  }
});

test('local, virtual and undeclared package imports stay bundle-owned', () => {
  for (const specifier of [
    './local-module',
    '../local-module',
    '/absolute/module.js',
    '\0vite/client',
    'vite',
    '@vitejs/plugin-react',
  ]) {
    assert.equal(
      isExternal(specifier),
      false,
      `${specifier} must not be externalized by manifest policy`,
    );
  }
});
