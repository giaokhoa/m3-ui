import { expect, test } from '@playwright/test';
import {
  createOneShotConsoleErrorMatcher,
  isHydrationWarning,
} from '../test-support/runtimeGuard';

test.describe('shared browser runtime guard mechanics', () => {
  test('console-error allowances are consumed exactly once', () => {
    const consume = createOneShotConsoleErrorMatcher([/intentional 404/]);

    expect(consume('intentional 404')).toBe(true);
    expect(consume('intentional 404')).toBe(false);
    expect(consume('different error')).toBe(false);
  });

  test('recognizes representative React hydration diagnostics', () => {
    expect(isHydrationWarning('Hydration failed because the server rendered HTML did not match')).toBe(true);
    expect(isHydrationWarning('A harmless browser warning')).toBe(false);
  });
});
