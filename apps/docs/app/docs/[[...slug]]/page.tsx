import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsShell } from '../../../src/DocsShell';
import { source } from '../../../src/lib/source';
import { docsMdxComponents } from '../../../src/mdx';

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsShell
      description={page.data.description}
      title={page.data.title}
      toc={page.data.toc}
    >
      <MDX components={docsMdxComponents} />
    </DocsShell>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
