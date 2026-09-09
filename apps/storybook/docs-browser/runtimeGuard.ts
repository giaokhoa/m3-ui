import { expect, type Page } from '@playwright/test';

const docsOrigin = 'http://127.0.0.1:4173';
const hydrationWarning =
  /hydration|hydrated|server rendered html|did not match|content does not match|reactdom\.hydrate/i;

export interface RuntimeGuard {
  readonly failures: readonly string[];
  assertClean(): void;
}

export interface RuntimeGuardOptions {
  /**
   * Narrow one-shot allowances for browser errors that are themselves the
   * behavior under test. Each expression can suppress at most one message.
   */
  allowedConsoleErrors?: readonly RegExp[];
}

function isRequiredNextResource(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.origin === docsOrigin && url.pathname.startsWith('/_next/');
  } catch {
    return false;
  }
}

/**
 * Fail browser regressions on runtime failures that HTTP smoke tests cannot see.
 * External font/network noise is intentionally excluded; same-origin Next chunks
 * and the React/browser runtime are part of the docs product contract.
 */
export function installRuntimeGuard(
  page: Page,
  options: RuntimeGuardOptions = {},
): RuntimeGuard {
  const failures: string[] = [];
  const remainingAllowedConsoleErrors = [...(options.allowedConsoleErrors ?? [])];
  const record = (kind: string, detail: string) => {
    failures.push(`[${kind}] ${detail}`);
  };

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error') {
      const allowedIndex = remainingAllowedConsoleErrors.findIndex((pattern) =>
        pattern.test(text),
      );
      if (allowedIndex >= 0) {
        remainingAllowedConsoleErrors.splice(allowedIndex, 1);
        return;
      }

      record('console.error', text);
      return;
    }

    if (message.type() === 'warning' && hydrationWarning.test(text)) {
      record('hydration warning', text);
    }
  });

  page.on('pageerror', (error) => {
    record('pageerror', error.stack ?? error.message);
  });

  page.on('requestfailed', (request) => {
    if (!isRequiredNextResource(request.url())) return;
    record(
      'failed Next resource',
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`.trim(),
    );
  });

  page.on('response', (response) => {
    if (response.status() < 400 || !isRequiredNextResource(response.url())) return;
    record('Next resource response', `${response.status()} ${response.url()}`);
  });

  return {
    failures,
    assertClean() {
      expect(
        failures,
        failures.length > 0
          ? `Unexpected docs browser runtime failures:\n${failures.join('\n')}`
          : undefined,
      ).toEqual([]);
    },
  };
}
