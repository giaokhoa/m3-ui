import { defineDocs } from 'fumadocs-mdx/macro';

export const docs = defineDocs({
  dir: 'content/docs',
});

export function getDocsPage(slugs: readonly string[]) {
  if (slugs.length === 0) return docs.getPage('index.mdx');

  const path = slugs.join('/');
  return docs.getPage(`${path}.mdx`) ?? docs.getPage(`${path}/index.mdx`);
}
