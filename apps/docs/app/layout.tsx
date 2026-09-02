import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@m3-ui/ui/styles.css';
import '../src/styles.css';
import { DocsProviders } from '../src/DocsProviders';

export const metadata: Metadata = {
  title: {
    default: 'm3-ui documentation',
    template: '%s · m3-ui',
  },
  description: 'Material 3 components and adaptive layout primitives for React.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DocsProviders>{children}</DocsProviders>
      </body>
    </html>
  );
}
