import type { Page } from '@playwright/test';
import {
  installBrowserRuntimeGuard,
  type BrowserRuntimeGuard,
  type BrowserRuntimeGuardOptions,
} from '../test-support/runtimeGuard';

const docsOrigin = 'http://127.0.0.1:4173';

export type RuntimeGuard = BrowserRuntimeGuard;
export interface RuntimeGuardOptions
  extends Pick<BrowserRuntimeGuardOptions, 'allowedConsoleErrors'> {}

function isRequiredNextResource(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.origin === docsOrigin && url.pathname.startsWith('/_next/');
  } catch {
    return false;
  }
}

/**
 * Fail docs browser regressions on runtime failures that HTTP smoke tests cannot
 * see. External font/network noise stays excluded; same-origin Next chunks and
 * the React/browser runtime remain part of the docs product contract.
 */
export function installRuntimeGuard(
  page: Page,
  options: RuntimeGuardOptions = {},
): RuntimeGuard {
  return installBrowserRuntimeGuard(page, {
    ...options,
    isRequiredResource: isRequiredNextResource,
    requiredResourceLabel: 'Next resource',
  });
}
