import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateMaterialConformance,
} from './material-conformance.mjs';
import {
  openRequiredDimensions,
} from './material-conformance-registry.mjs';

function apiExport(path, kind = 'component') {
  return {
    kind,
    source: { path, line: 1 },
  };
}

function fixture() {
  const registry = {
    schemaVersion: 1,
    parentIssue: 296,
    rootEntrypoint: 'packages/ui/src/index.ts',
    layoutEntrypoint: 'packages/ui/src/layout/index.ts',
    families: [
      {
        id: 'button',
        kind: 'component',
        sourcePrefixes: ['packages/ui/src/components/Button/'],
        provenance: {
          kind: 'direct',
          family: 'Buttons',
          contractLabel: 'fixture Material contract',
          evidence: ['evidence/button.md'],
        },
        dimensions: openRequiredDimensions(296),
      },
      {
        id: 'layout-scaffold',
        kind: 'layout',
        sourcePrefixes: ['packages/ui/src/layout/components/Scaffold/'],
        provenance: {
          kind: 'direct',
          family: 'Scaffold',
          contractLabel: 'fixture adaptive contract',
          evidence: ['evidence/layout.md'],
        },
        dimensions: openRequiredDimensions(296),
      },
    ],
    nonComponents: [
      {
        id: 'theme-runtime',
        sourcePrefixes: ['packages/ui/src/theme/'],
        reason: 'fixture non-component runtime infrastructure',
      },
    ],
  };

  const rootModel = {
    entrypoint: 'packages/ui/src/index.ts',
    exports: {
      Button: apiExport('packages/ui/src/components/Button/Button.tsx'),
      Scaffold: apiExport('packages/ui/src/layout/components/Scaffold/Scaffold.tsx'),
      ThemeProvider: apiExport('packages/ui/src/theme/ThemeProvider.tsx', 'function'),
    },
  };
  const layoutModel = {
    entrypoint: 'packages/ui/src/layout/index.ts',
    exports: {
      Scaffold: apiExport('packages/ui/src/layout/components/Scaffold/Scaffold.tsx'),
    },
  };
  const existingPaths = new Set(['evidence/button.md', 'evidence/layout.md']);

  return {
    registry,
    rootModel,
    layoutModel,
    componentProvenanceIds: new Set(),
    pathExists: (path) => existingPaths.has(path),
  };
}

function validate(overrides = {}) {
  const base = fixture();
  return validateMaterialConformance({ ...base, ...overrides });
}

test('derives public symbols from public entrypoint models', () => {
  const { report, errors } = validate();
  assert.deepEqual(errors, []);
  assert.deepEqual(
    report.families.find((family) => family.id === 'button').publicSymbols.map((item) => item.name),
    ['Button'],
  );
  assert.deepEqual(
    report.families
      .find((family) => family.id === 'layout-scaffold')
      .publicSymbols.map((item) => item.name),
    ['Scaffold'],
  );
  assert.deepEqual(report.nonComponents[0].publicSymbols.map((item) => item.name), ['ThemeProvider']);
});

test('fails a new unclassified public root export', () => {
  const base = fixture();
  base.rootModel.exports.Mystery = apiExport(
    'packages/ui/src/components/Mystery/Mystery.tsx',
  );
  const { errors } = validateMaterialConformance(base);
  assert.ok(errors.some((error) => error.includes('Unclassified public root export "Mystery"')));
});

test('fails when a public layout subpath export disappears from the root entrypoint', () => {
  const base = fixture();
  delete base.rootModel.exports.Scaffold;
  const { errors } = validateMaterialConformance(base);
  assert.ok(errors.some((error) => error.includes('layout export "Scaffold" is missing from the root')));
});

test('fails a required dimension with neither evidence nor tracked gap', () => {
  const base = fixture();
  base.registry.families[0].dimensions.api = { status: 'required' };
  const { errors } = validateMaterialConformance(base);
  assert.ok(
    errors.some((error) =>
      error.includes('button.api: required dimensions need automated evidence or a tracked gapIssue'),
    ),
  );
});

test('fails an adapted dimension without a documented reason', () => {
  const base = fixture();
  base.registry.families[0].dimensions.browser = {
    status: 'adapted',
    evidence: ['evidence/button.md'],
  };
  const { errors } = validateMaterialConformance(base);
  assert.ok(
    errors.some((error) =>
      error.includes('button.browser: adapted dimensions need a documented adaptation reason'),
    ),
  );
});

test('fails stale evidence paths', () => {
  const base = fixture();
  base.registry.families[0].dimensions.api = {
    status: 'required',
    evidence: ['evidence/removed-test.ts'],
  };
  const { errors } = validateMaterialConformance(base);
  assert.ok(
    errors.some((error) =>
      error.includes('button.api: evidence path does not exist: evidence/removed-test.ts'),
    ),
  );
});

test('fails unknown component-docs provenance ids', () => {
  const base = fixture();
  base.registry.families[0].provenance = {
    kind: 'component-docs',
    id: 'missing-doc-id',
  };
  const { errors } = validateMaterialConformance(base);
  assert.ok(
    errors.some((error) =>
      error.includes('component docs provenance id "missing-doc-id" is not present'),
    ),
  );
});
