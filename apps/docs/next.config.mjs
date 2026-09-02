import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
};

const withMDX = createMDX();

export default withMDX(config);
