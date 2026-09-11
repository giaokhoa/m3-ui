import { expect, type Page } from '@playwright/test';

const hydrationWarning =
  /hydration|hydrated|server rendered html|did not match|content does not match|reactdom\.hydrate/i;

export interface BrowserRuntimeGuard {
  readonly failures: readonly string[];
  assertClean(): void;
}

export interface BrowserRuntimeGuardOptions {
  /**
   * Narrow one-shot allowances for browser errors that are themselves the
   * behavior under test. Each expression can suppress at most one message.
   */
  allowedConsoleErrors?: readonly RegExp[];
  /** Select resources that are part of the product/test contract. */
  isRequiredResource?: (rawUrl: string) => boolean;
  /** Human-readable resource label used in diagnostics. */
  requiredResourceLabel?: string;
}

export function isHydrationWarning(text: string) {
  return hydrationWarning.test(text);
}

/**
 * Build a stateful matcher for explicit one-shot console-error allowances.
 * Repeated matching errors are intentionally not swallowed.
 */
export function createOneShotConsoleErrorMatcher(patterns: readonly RegExp[]) {
  const remaining = [...patterns];

  return (text: string) => {
    const index = remaining.findIndex((pattern) => pattern.test(text));
    if (index < 0) return false;
    remaining.splice(index, 1);
    return true;
  };
}

/**
 * Record browser runtime failures without encoding app/component policy. The
 * caller decides which network resources are required; console/page runtime
 * failures remain shared browser mechanics.
 */
export function installBrowserRuntimeGuard(
  page: Page,
  options: BrowserRuntimeGuardOptions = {},
): BrowserRuntimeGuard {
  const failures: string[] = [];
  const consumeAllowedConsoleError = createOneShotConsoleErrorMatcher(
    options.allowedConsoleErrors ?? [],
  );
  const isRequiredResource = options.isRequiredResource ?? (() => false);
  const resourceLabel = options.requiredResourceLabel ?? 'required resource';
  const record = (kind: string, detail: string) => {
    failures.push(`[${kind}] ${detail}`);
  };

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error') {
      if (consumeAllowedConsoleError(text)) return;
      record('console.error', text);
      return;
    }

    if (message.type() === 'warning' && isHydrationWarning(text)) {
      record('hydration warning', text);
    }
  });

  page.on('pageerror', (error) => {
    record('pageerror', error.stack ?? error.message);
  });

  page.on('requestfailed', (request) => {
    if (!isRequiredResource(request.url())) return;
    record(
      `failed ${resourceLabel}`,
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`.trim(),
    );
  });

  page.on('response', (response) => {
    if (response.status() < 400 || !isRequiredResource(response.url())) return;
    record(`${resourceLabel} response`, `${response.status()} ${response.url()}`);
  });

  return {
    failures,
    assertClean() {
      expect(
        failures,
        failures.length > 0
          ? `Unexpected browser runtime failures:\n${failures.join('\n')}`
          : undefined,
      ).toEqual([]);
    },
  };
}
