import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createFromSource } from 'fumadocs-core/search/server';
import { loader } from 'fumadocs-core/source';
import { register } from 'fumadocs-mdx/node';

register({
  macro: {
    include: ['src/lib/source.ts'],
  },
});

const { docs } = await import('../src/lib/source.ts');
const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

function textValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const text = value.map(textValue).filter(Boolean).join(' ').trim();
    return text || undefined;
  }
  return undefined;
}

function normalizePage(node) {
  return {
    type: 'page',
    name: textValue(node.name) ?? node.url,
    url: node.url,
    description: textValue(node.description),
  };
}

function normalizeNode(node) {
  if (node.type === 'page') return normalizePage(node);

  if (node.type === 'separator') {
    return {
      type: 'separator',
      name: textValue(node.name),
    };
  }

  if (node.type === 'folder') {
    return {
      type: 'folder',
      name: textValue(node.name) ?? 'Documentation',
      index: node.index ? normalizePage(node.index) : undefined,
      defaultOpen: node.defaultOpen,
      collapsible: node.collapsible,
      children: node.children.map(normalizeNode),
    };
  }

  return undefined;
}

const tree = source.getPageTree();
const navigation = {
  name: textValue(tree.name) ?? 'm3-ui',
  children: tree.children.map(normalizeNode).filter(Boolean),
};

const searchResponse = await createFromSource(source).staticGET();
if (!searchResponse.ok) {
  throw new Error(`Failed to export docs search index: ${searchResponse.status}`);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, '..');
const outputDir = resolve(appDir, process.argv[2] ?? 'public');
await mkdir(outputDir, { recursive: true });

await Promise.all([
  writeFile(
    resolve(outputDir, 'docs-navigation.json'),
    `${JSON.stringify(navigation, null, 2)}\n`,
    'utf8',
  ),
  writeFile(
    resolve(outputDir, 'search-index.json'),
    await searchResponse.text(),
    'utf8',
  ),
]);
