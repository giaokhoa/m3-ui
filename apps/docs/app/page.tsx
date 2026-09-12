import Link from 'next/link';
import { redirect } from 'next/navigation';

const pagesBuild = process.env.M3_UI_GITHUB_PAGES === 'true';
const docsBasePath = pagesBuild ? (process.env.M3_UI_DOCS_BASE_PATH ?? '/m3-ui') : '';

export default function HomePage() {
  if (!pagesBuild) redirect('/docs');

  const docsUrl = `${docsBasePath}/docs/`;
  return (
    <main>
      <meta httpEquiv="refresh" content={`0;url=${docsUrl}`} />
      <p>
        Opening <Link href="/docs">m3-ui documentation</Link>…
      </p>
    </main>
  );
}
