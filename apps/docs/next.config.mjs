import { createMDX } from 'fumadocs-mdx/next';

const pagesBuild = process.env.M3_UI_GITHUB_PAGES === 'true';
const docsBasePath = pagesBuild ? (process.env.M3_UI_DOCS_BASE_PATH ?? '/m3-ui') : '';

if (docsBasePath && (!docsBasePath.startsWith('/') || docsBasePath.endsWith('/'))) {
  throw new Error('M3_UI_DOCS_BASE_PATH must be empty or start with / and must not end with /.');
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_M3_UI_DOCS_BASE_PATH: docsBasePath,
  },
  ...(pagesBuild
    ? {
        output: 'export',
        trailingSlash: true,
        basePath: docsBasePath,
        images: { unoptimized: true },
      }
    : {
        async redirects() {
          return [
            {
              source: '/docs/theming',
              destination: '/docs/foundations/theming',
              permanent: true,
            },
            {
              source: '/docs/forms',
              destination: '/docs/develop/forms',
              permanent: true,
            },
            {
              source: '/docs/layout',
              destination: '/docs/develop/layout',
              permanent: true,
            },
            {
              source: '/docs/accessibility',
              destination: '/docs/develop/accessibility',
              permanent: true,
            },
            {
              source: '/docs/parity',
              destination: '/docs/reference/parity',
              permanent: true,
            },
          ];
        },
      }),
  devIndicators: { position: 'bottom-right' },
  allowedDevOrigins: ['terminal.local'],
};

const withMDX = createMDX();

export default withMDX(config);
