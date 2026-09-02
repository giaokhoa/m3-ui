'use client';

import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import { RouterProvider } from 'react-aria-components';
import { DocsThemeProvider } from './DocsThemeProvider';

export function DocsProviders({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <RouterProvider navigate={(href, options) => router.push(href, options)}>
      <DocsThemeProvider>{children}</DocsThemeProvider>
    </RouterProvider>
  );
}
