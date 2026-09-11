import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { RULES, validateDocsConformance } from './docs-conformance.mjs';

const API_MODEL = {
  packageName: '@m3-ui/ui',
  exports: { Button: { name: 'Button' } },
};

async function write(root, path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function createFixture() {
  const root = await mkdtemp(resolve(tmpdir(), 'm3-ui-docs-conformance-'));
  await write(root, 'apps/docs/src/allComponentDocs.ts', `
import { componentDocs } from './componentDocs';
export const allComponentDocs = { ...componentDocs } as const;
`);
  await write(root, 'apps/docs/src/componentDocs.ts', `
export const componentDocs = {
  button: {
    family: 'Buttons',
    materialUrl: 'https://m3.material.io/components/buttons/overview',
    composeMapping: ['Button'],
    implementation: 'Material button implementation.',
    webAdaptation: 'React Aria owns browser semantics.',
  },
} as const;
`);
  await write(
    root,
    'apps/docs/src/exampleRuntime.tsx',
    'export function ExampleRuntime() { return null; }\n',
  );
  await write(
    root,
    'apps/docs/content/docs/meta.json',
    JSON.stringify({ title: 'Docs', pages: ['index', 'components'] }, null, 2),
  );
  await write(root, 'apps/docs/content/docs/index.mdx', `---\ntitle: Docs\n---\n\n# Docs\n`);
  await write(
    root,
    'apps/docs/content/docs/components/meta.json',
    JSON.stringify({ title: 'Components', pages: ['button'] }, null, 2),
  );
  await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---

<MaterialParity component="button" />

## Accessibility

Browser button semantics are preserved.

<ApiReference name="Button" />
`);
  return root;
}

async function diagnosticsFor(root) {
  const result = await validateDocsConformance({
    repoRoot: root,
    apiReferenceModel: API_MODEL,
  });
  return result.diagnostics;
}

async function withFixture(run) {
  const root = await createFixture();
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('valid MDX-backed docs contract passes deterministically', async () => {
  await withFixture(async (root) => {
    assert.deepEqual(await diagnosticsFor(root), []);
  });
});

test('rejects a TSX-only public docs page', async () => {
  await withFixture(async (root) => {
    await write(
      root,
      'apps/docs/content/docs/components/tsx-only.tsx',
      'export default function Page() { return null; }\n',
    );
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some(
        (item) =>
          item.rule === RULES.PUBLIC_MDX_ONLY && item.file.endsWith('tsx-only.tsx'),
      ),
    );
  });
});

test('rejects direct MDX imports from app TS/TSX runtime modules', async () => {
  await withFixture(async (root) => {
    await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---
import { ExampleRuntime } from '../../../src/exampleRuntime';

<MaterialParity component="button" />
<ExampleRuntime />

## Accessibility
Browser semantics.

<ApiReference name="Button" />
`);
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some(
        (item) =>
          item.rule === RULES.MDX_RUNTIME_IMPORT &&
          item.subject === '../../../src/exampleRuntime',
      ),
    );
  });
});

test('requires every documented component ID to bind a canonical MDX guide', async () => {
  await withFixture(async (root) => {
    await write(
      root,
      'apps/docs/content/docs/components/button.mdx',
      `---\ntitle: Button\n---\n\n## Accessibility\nBrowser semantics.\n`,
    );
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some(
        (item) => item.rule === RULES.COMPONENT_ROUTE && item.subject === 'button',
      ),
    );
  });
});

test('requires accessibility guidance or a tracked exemption', async () => {
  await withFixture(async (root) => {
    await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---

<MaterialParity component="button" />
<ApiReference name="Button" />
`);
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some(
        (item) => item.rule === RULES.ACCESSIBILITY && item.subject === 'button',
      ),
    );
  });
});

test('rejects API references that are not public package exports', async () => {
  await withFixture(async (root) => {
    await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---

<MaterialParity component="button" />

## Accessibility
Browser semantics.

<ApiReference name="PrivateButton" />
`);
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some(
        (item) => item.rule === RULES.API_EXPORT && item.subject === 'PrivateButton',
      ),
    );
  });
});

test('rejects handwritten canonical values beside generated spec support', async () => {
  await withFixture(async (root) => {
    await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---

<MaterialParity component="button" />

## Accessibility
Browser semantics.

## Specification
<MaterialSpecTable family="button" />

| Token | Value |
| --- | --- |
| Container height | 40px |

<ApiReference name="Button" />
`);
    const diagnostics = await diagnosticsFor(root);
    assert.ok(
      diagnostics.some((item) => item.rule === RULES.CANONICAL_SPEC_VALUES),
    );
  });
});

test('allowlist entries require a tracked issue and suppress only the matching violation', async () => {
  await withFixture(async (root) => {
    await write(root, 'apps/docs/content/docs/components/button.mdx', `---
title: Button
---

<MaterialParity component="button" />
<ApiReference name="Button" />
`);
    await write(
      root,
      'apps/docs/scripts/docs-conformance.allowlist.json',
      JSON.stringify(
        {
          version: 1,
          entries: [
            {
              rule: RULES.ACCESSIBILITY,
              file: 'apps/docs/content/docs/components/button.mdx',
              subject: 'button',
              issue: '#233',
              reason: 'Tracked component-guide rewrite.',
            },
          ],
        },
        null,
        2,
      ),
    );
    const result = await validateDocsConformance({
      repoRoot: root,
      apiReferenceModel: API_MODEL,
    });
    assert.equal(result.diagnostics.length, 0);
    assert.equal(result.allowlisted.length, 1);
    assert.equal(result.allowlisted[0].issue, '#233');
  });
});
